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
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Check if current user already rated this course
  const existingRating = await prisma.rating.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
  });

  // Upsert user's rating record
  await prisma.rating.upsert({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
    update: { value },
    create: {
      userId: session.user.id,
      courseId,
      value,
    },
  });

  // Calculate new aggregate rating while preserving existing catalog review base
  let updatedRating: number;
  let updatedReviewCount: number;

  const currentRating = course.rating ?? value;
  const currentCount = course.reviewCount ?? 0;

  if (existingRating) {
    // User modified their vote
    const delta = value - existingRating.value;
    updatedReviewCount = Math.max(1, currentCount);
    updatedRating = currentCount > 0 ? (currentRating * currentCount + delta) / currentCount : value;
  } else {
    // New user review
    updatedReviewCount = currentCount + 1;
    updatedRating = (currentRating * currentCount + value) / updatedReviewCount;
  }

  const finalAvg = Math.round(updatedRating * 10) / 10;

  // Update Course rating & reviewCount
  await prisma.course.update({
    where: { id: courseId },
    data: {
      rating: finalAvg,
      reviewCount: updatedReviewCount,
    },
  });

  return NextResponse.json({ success: true, newRating: finalAvg, reviewCount: updatedReviewCount });
}
