import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const learningPath = await prisma.learningPath.findUnique({
    where: { id },
  });

  if (!learningPath) {
    return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
  }

  if (learningPath.userId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Hydrate the courses json with actual course data
  const courseDataList = learningPath.courses as Array<{ courseId: string, order: number, rationale: string }>;
  const courseIds = courseDataList.map(c => c.courseId);

  const courses = await prisma.course.findMany({
    where: { id: { in: courseIds } },
    include: {
      faculty: { select: { name: true } },
      _count: { select: { enrollments: true } },
    },
  });

  const coursesMap = new Map(courses.map(c => [c.id, c]));

  const populatedCourses = courseDataList
    .map(c => ({
      ...c,
      course: coursesMap.get(c.courseId) || null,
    }))
    .filter(c => c.course !== null)
    .sort((a, b) => a.order - b.order);

  return NextResponse.json({
    ...learningPath,
    populatedCourses,
  });
}
