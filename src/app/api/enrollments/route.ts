import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { courseId, action } = await request.json();

  if (!courseId) {
    return NextResponse.json({ error: 'courseId required' }, { status: 400 });
  }

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  if (action === 'unenroll') {
    await prisma.enrollment.delete({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });
    return NextResponse.json({ enrolled: false });
  }

  // Enroll
  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
    update: { status: 'ACTIVE' },
    create: {
      userId: session.user.id,
      courseId,
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
