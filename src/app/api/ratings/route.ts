import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ratingSchema = z.object({
  courseId: z.string(),
  value: z.number().min(1).max(5),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = ratingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { courseId, value } = parsed.data;

  // Check if course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { ratings: true }
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Upsert Rating
  await prisma.rating.upsert({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: courseId,
      }
    },
    update: { value },
    create: {
      userId: session.user.id,
      courseId: courseId,
      value,
    }
  });

  // Calculate new aggregate rating
  const allRatings = await prisma.rating.findMany({
    where: { courseId }
  });

  const sum = allRatings.reduce((acc, curr) => acc + curr.value, 0);
  const avg = sum / allRatings.length;

  // Update Course rating & reviewCount
  await prisma.course.update({
    where: { id: courseId },
    data: {
      rating: avg,
      reviewCount: allRatings.length,
    }
  });

  return NextResponse.json({ success: true, newRating: avg, reviewCount: allRatings.length });
}
