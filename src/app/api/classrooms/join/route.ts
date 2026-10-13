import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { joinCode } = await request.json();

  if (!joinCode) {
    return NextResponse.json({ error: 'joinCode required' }, { status: 400 });
  }

  const classroom = await prisma.classroom.findUnique({ where: { joinCode } });
  if (!classroom) {
    return NextResponse.json({ error: 'Classroom not found or invalid code' }, { status: 404 });
  }

  // Check if user is the faculty owner
  if (classroom.facultyId === session.user.id) {
    return NextResponse.json({ error: 'You are the faculty owner of this classroom' }, { status: 400 });
  }

  // Check if already joined
  const existing = await prisma.classroomMember.findUnique({
    where: {
      userId_classroomId: {
        userId: session.user.id,
        classroomId: classroom.id,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ message: 'Already joined this classroom' }, { status: 200 });
  }

  const member = await prisma.classroomMember.create({
    data: {
      userId: session.user.id,
      classroomId: classroom.id,
    },
  });

  return NextResponse.json({ joined: true, classroom }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const classroomId = searchParams.get('classroomId');

  if (!classroomId) {
    return NextResponse.json({ error: 'classroomId required' }, { status: 400 });
  }

  try {
    await prisma.classroomMember.delete({
      where: {
        userId_classroomId: {
          userId: session.user.id,
          classroomId,
        },
      },
    });
    return NextResponse.json({ success: true, left: true });
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ message: 'Not a member of this classroom' }, { status: 200 });
    }
    throw err;
  }
}
