import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { courseId, action } = await request.json();

  if (!courseId) {
    return NextResponse.json({ error: 'courseId required' }, { status: 400 });
  }

  const classroom = await prisma.classroom.findUnique({ where: { id } });

  if (!classroom) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (session.user.role !== 'ADMIN' && classroom.facultyId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (action === 'remove') {
    try {
      await prisma.classroomCourse.delete({
        where: {
          classroomId_courseId: { classroomId: id, courseId },
        },
      });
    } catch (err: any) {
      if (err?.code !== 'P2025') throw err;
    }
    return NextResponse.json({ success: true });
  }

  // Add course
  const added = await prisma.classroomCourse.upsert({
    where: {
      classroomId_courseId: { classroomId: id, courseId },
    },
    update: {},
    create: {
      classroomId: id,
      courseId,
    },
  });

  return NextResponse.json({ success: true, added }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resolvedParams = await params;
  const { id } = resolvedParams;

  const { searchParams } = new URL(request.url);
  const courseId = searchParams.get('courseId');

  if (!courseId) {
    return NextResponse.json({ error: 'courseId required' }, { status: 400 });
  }

  const classroom = await prisma.classroom.findUnique({ where: { id } });
  if (!classroom) return NextResponse.json({ error: 'Classroom not found' }, { status: 404 });

  if (session.user.role !== 'ADMIN' && classroom.facultyId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    await prisma.classroomCourse.delete({
      where: {
        classroomId_courseId: { classroomId: id, courseId },
      },
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ success: true, message: 'Course was not in classroom' });
    }
    throw err;
  }
}
