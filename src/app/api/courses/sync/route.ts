import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const syncSchema = z.object({
  courses: z.array(
    z.object({
      externalId: z.string(),
      title: z.string(),
      description: z.string(),
      category: z.string(),
      tags: z.array(z.string()).default([]),
      difficulty: z.string().default('Intermediate'),
      syllabusUrl: z.string().optional(),
      courseUrl: z.string().optional(),
      imageUrl: z.string().optional(),
      duration: z.string().optional(),
      rating: z.number().optional(),
      reviewCount: z.number().optional(),
      prerequisites: z.string().optional(),
      courseType: z.string().optional(),
    })
  ),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = syncSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const results = [];
  for (const courseData of parsed.data.courses) {
    const result = await prisma.course.upsert({
      where: { externalId: courseData.externalId },
      update: {
        title: courseData.title,
        description: courseData.description,
        category: courseData.category,
        tags: courseData.tags,
        difficulty: courseData.difficulty,
        syllabusUrl: courseData.syllabusUrl,
        courseUrl: courseData.courseUrl,
        imageUrl: courseData.imageUrl,
        duration: courseData.duration,
        rating: courseData.rating,
        reviewCount: courseData.reviewCount,
        prerequisites: courseData.prerequisites,
        courseType: courseData.courseType,
      },
      create: {
        ...courseData,
        published: true,
      },
    });
    results.push(result);
  }

  return NextResponse.json({
    synced: results.length,
    courses: results,
  });
}
