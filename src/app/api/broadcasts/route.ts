import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendBroadcastNotification } from '@/lib/email';

const broadcastSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['ANNOUNCEMENT', 'MATERIAL', 'ASSIGNMENT']).default('ANNOUNCEMENT'),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || (user.role !== 'FACULTY' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = broadcastSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Verify faculty owns the course
  const course = await prisma.course.findUnique({
    where: { id: parsed.data.courseId },
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  if (user.role !== 'ADMIN' && course.facultyId !== user.id) {
    return NextResponse.json(
      { error: 'You do not teach this course' },
      { status: 403 }
    );
  }

  const broadcast = await prisma.broadcast.create({
    data: {
      ...parsed.data,
      facultyId: user.id,
    },
    include: {
      faculty: { select: { name: true } },
      course: { select: { title: true } },
    },
  });

  // Send email notifications to enrolled students
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId: parsed.data.courseId, status: 'ACTIVE' },
    include: {
      user: { select: { email: true } },
    },
  });

  const recipientEmails = enrollments
    .map((e) => e.user.email)
    .filter((email): email is string => !!email);

  await sendBroadcastNotification({
    recipientEmails,
    courseName: course.title,
    broadcastTitle: parsed.data.title,
    broadcastContent: parsed.data.content,
    broadcastType: parsed.data.type,
    facultyName: user.name || 'Faculty',
  });

  return NextResponse.json(broadcast, { status: 201 });
}

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

  const broadcasts = await prisma.broadcast.findMany({
    where: { courseId },
    include: {
      faculty: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(broadcasts);
}
