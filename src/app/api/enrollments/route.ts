import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId, joinCode, action } = await request.json();

  if (!courseId && !joinCode) {
    return NextResponse.json({ error: 'courseId or joinCode required' }, { status: 400 });
  }

  let course;
  if (joinCode) {
    course = await prisma.course.findUnique({ where: { joinCode } });
  } else {
    course = await prisma.course.findUnique({ where: { id: courseId } });
  }

  if (!course) {
    return NextResponse.json({ error: 'Course not found or invalid code' }, { status: 404 });
  }

  const targetCourseId = course.id;

  if (action === 'unenroll') {
    try {
      await prisma.enrollment.delete({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: targetCourseId,
          },
        },
      });
    } catch (err: any) {
      if (err?.code !== 'P2025') throw err;
    }
    return NextResponse.json({ enrolled: false });
  }

  if (action === 'complete') {
    try {
      const updated = await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: targetCourseId,
          },
        },
        data: { status: 'COMPLETED' },
      });
      return NextResponse.json({ success: true, enrollment: updated });
    } catch (err: any) {
      if (err?.code === 'P2025') {
        return NextResponse.json({ error: 'You are not enrolled in this course' }, { status: 400 });
      }
      throw err;
    }
  }

  if (action === 'resume' || action === 'active') {
    try {
      const updated = await prisma.enrollment.update({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: targetCourseId,
          },
        },
        data: { status: 'ACTIVE' },
      });
      return NextResponse.json({ success: true, enrollment: updated });
    } catch (err: any) {
      if (err?.code === 'P2025') {
        return NextResponse.json({ error: 'You are not enrolled in this course' }, { status: 400 });
      }
      throw err;
    }
  }

  // Enroll
  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: targetCourseId,
      },
    },
    update: { status: 'ACTIVE' },
    create: {
      userId: session.user.id,
      courseId: targetCourseId,
      status: 'ACTIVE',
    },
  });

  return NextResponse.json({ enrolled: true, enrollment });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;

  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: session.user.id,
      ...(status ? { status: status as 'ACTIVE' | 'COMPLETED' | 'DROPPED' } : {}),
    },
    include: {
      course: {
        include: {
          faculty: { select: { name: true } },
          _count: { select: { enrollments: true } },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' },
  });

  return NextResponse.json(enrollments);
}
