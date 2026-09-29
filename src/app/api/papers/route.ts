import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { searchPapers } from '@/lib/papers';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return NextResponse.json(
      { error: 'courseId required' },
      { status: 400 }
    );
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Check for cached results (less than 24 hours old)
  const cached = await prisma.paperRecommendation.findMany({
    where: {
      courseId,
      userId: session.user.id,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { citationCount: 'desc' },
  });

  if (cached.length > 0) {
    return NextResponse.json(cached);
  }

  // Fetch fresh results
  const papers = await searchPapers(
    course.title,
    course.tags,
    course.category
  );

  // Store results
  const stored = [];
  for (const paper of papers) {
    const record = await prisma.paperRecommendation.create({
      data: {
        userId: session.user.id,
        courseId,
        paperId: paper.paperId,
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        url: paper.url,
        source: paper.source,
        citationCount: paper.citationCount,
        year: paper.year,
      },
    });
    stored.push(record);
  }

  return NextResponse.json(stored);
}
