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
