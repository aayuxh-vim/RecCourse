import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { spawn } from 'child_process';
import path from 'path';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get('difficulty');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { interests: true, id: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get user's enrolled course IDs to exclude them
  const enrolledCourseIds = await prisma.enrollment.findMany({
    where: { userId: user.id },
    select: { courseId: true },
  });
  const enrolledIds = new Set(enrolledCourseIds.map((e) => e.courseId));

  // Get eligible courses (published and optionally filtered by difficulty)
  const whereClause: any = { published: true };
  if (difficulty && difficulty !== 'All') {
    whereClause.difficulty = difficulty;
  }

  const allCourses = await prisma.course.findMany({
    where: whereClause,
    include: {
      faculty: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
  });

  const eligibleCourses = allCourses.filter(c => !enrolledIds.has(c.id));

  // Prepare payload for Python script
  const payload = {
    userInterests: user.interests,
    courses: eligibleCourses.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      tags: c.tags,
      rating: c.rating,
      _count: c._count
    }))
  };

  // Run Python recommendation engine
  let pythonResult: any;

  try {
    if (process.env.VERCEL) {
      // In Vercel production, call the Python serverless function endpoint
      const protocol = process.env.VERCEL_URL?.includes('localhost') ? 'http' : 'https';
      const apiUrl = `${protocol}://${process.env.VERCEL_URL}/api/recommendEngine`;
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        throw new Error(`Vercel Python API failed: ${await res.text()}`);
      }
      pythonResult = await res.json();
    } else {
      // Local development fallback
      pythonResult = await new Promise<any>((resolve, reject) => {
        const scriptPath = path.join(process.cwd(), 'scripts', 'recommend.py');
        const pythonProcess = spawn('python', [scriptPath]);
        
        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
          dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
          if (code !== 0) {
            console.error("Python script error:", errorString);
            return reject(new Error('Python recommendation script failed'));
          }
          try {
            resolve(JSON.parse(dataString));
          } catch (err) {
            reject(new Error('Failed to parse Python script output'));
          }
        });

        pythonProcess.stdin.write(JSON.stringify(payload));
        pythonProcess.stdin.end();
      });
    }
  } catch (error: any) {
    console.error("Recommendation Engine Error:", error);
    return NextResponse.json({ error: error.message || 'Recommendation failed' }, { status: 500 });
  }

  if (pythonResult.error) {
    return NextResponse.json({ error: pythonResult.error }, { status: 500 });
  }

  const recommendations = pythonResult.recommendations || [];
  const algorithmVersion = pythonResult.algorithmVersion || 'v2_python';

  // Map back to full course objects
  const coursesMap = new Map(eligibleCourses.map(c => [c.id, c]));
  
  const scored = recommendations.map((item: any) => ({
    course: coursesMap.get(item.courseId),
    score: item.score,
    reason: item.reason,
  })).filter((item: any) => item.course != null);

  // Store Recommendation log entry (user, timestamp, resource IDs, algorithm version)
  for (const item of scored) {
    await prisma.recommendation.create({
      data: {
        userId: user.id,
        courseId: item.course.id,
        score: item.score,
        reason: item.reason,
        algorithmVersion,
      },
    });
  }

  return NextResponse.json(
    scored.map((item: any) => ({
      ...item.course,
      recommendationScore: item.score,
      recommendationReason: item.reason,
    }))
  );
}
