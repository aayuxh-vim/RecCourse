import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      faculty: { select: { id: true, name: true, image: true, bio: true } },
      broadcasts: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          faculty: { select: { name: true } },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  // Check if current user is enrolled
  const session = await auth();
  let isEnrolled = false;
  if (session?.user) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: id,
        },
      },
    });
    isEnrolled = !!enrollment;
  }

  return NextResponse.json({ ...course, isEnrolled });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const course = await prisma.course.findUnique({ where: { id } });

  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (
    !user ||
    (user.role !== 'ADMIN' && course.facultyId !== user.id)
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const updated = await prisma.course.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.course.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
