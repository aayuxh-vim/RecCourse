import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const classroomSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  
  if (user?.role === 'FACULTY' || user?.role === 'ADMIN') {
    // Faculty sees classrooms they own
    const classrooms = await prisma.classroom.findMany({
      where: { facultyId: user.id },
      include: {
        _count: { select: { members: true, courses: true, broadcasts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(classrooms);
  } else {
    // Student sees classrooms they joined
    const memberships = await prisma.classroomMember.findMany({
      where: { userId: user!.id },
      include: {
        classroom: {
          include: {
            faculty: { select: { name: true } },
            _count: { select: { members: true, courses: true, broadcasts: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
    return NextResponse.json(memberships.map(m => ({ ...m.classroom, joinedAt: m.joinedAt })));
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || (user.role !== 'FACULTY' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = classroomSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten() }, { status: 400 });
  }

  // Generate a 6-character unique join code
  const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

  const classroom = await prisma.classroom.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      joinCode,
      facultyId: user.id,
    },
  });

  return NextResponse.json(classroom, { status: 201 });
}
