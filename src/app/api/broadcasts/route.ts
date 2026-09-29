import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendBroadcastNotification } from '@/lib/email';

const broadcastSchema = z.object({
  courseId: z.string().optional(),
  classroomId: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  type: z.enum(['ANNOUNCEMENT', 'MATERIAL', 'ASSIGNMENT']).default('ANNOUNCEMENT'),
}).refine(data => data.courseId || data.classroomId, {
  message: "Either courseId or classroomId must be provided"
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

  // Verify faculty owns the course or classroom
  let targetName = 'Target';
  let recipientEmails: string[] = [];

  if (parsed.data.classroomId) {
    const classroom = await prisma.classroom.findUnique({
      where: { id: parsed.data.classroomId },
      include: { members: { include: { user: { select: { email: true } } } } }
    });
    if (!classroom) return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });
    if (user.role !== 'ADMIN' && classroom.facultyId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    
    targetName = classroom.name;
    recipientEmails = classroom.members.map(m => m.user.email).filter((e): e is string => !!e);
  } else if (parsed.data.courseId) {
    const course = await prisma.course.findUnique({
      where: { id: parsed.data.courseId },
      include: { enrollments: { where: { status: 'ACTIVE' }, include: { user: { select: { email: true } } } } }
    });
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    if (user.role !== 'ADMIN' && course.facultyId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    
    targetName = course.title;
    recipientEmails = course.enrollments.map(e => e.user.email).filter((e): e is string => !!e);
  }

  const broadcast = await prisma.broadcast.create({
    data: {
      courseId: parsed.data.courseId,
      classroomId: parsed.data.classroomId,
      title: parsed.data.title,
      content: parsed.data.content,
      type: parsed.data.type,
      facultyId: user.id,
    },
  });

  await sendBroadcastNotification({
    recipientEmails,
    courseName: targetName,
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
  const classroomId = searchParams.get('classroomId');

  if (!courseId && !classroomId) {
    return NextResponse.json(
      { error: 'courseId or classroomId required' },
      { status: 400 }
    );
  }

  const where = courseId ? { courseId } : { classroomId };

  const broadcasts = await prisma.broadcast.findMany({
    where,
    include: {
      faculty: { select: { name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(broadcasts);
}
