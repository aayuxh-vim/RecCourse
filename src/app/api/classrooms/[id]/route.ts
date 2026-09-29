import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Next.js 15+ requires params to be awaited
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const classroom = await prisma.classroom.findUnique({
    where: { id },
    include: {
      faculty: { select: { name: true } },
      members: {
        include: { user: { select: { name: true, email: true } } },
        orderBy: { joinedAt: 'desc' }
      },
      courses: {
        include: { course: true },
        orderBy: { addedAt: 'desc' }
      },
      broadcasts: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!classroom) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // Check access: only the faculty owner or an enrolled student or ADMIN can view it
  if (
    session.user.role !== 'ADMIN' &&
    classroom.facultyId !== session.user.id &&
    !classroom.members.some(m => m.userId === session.user.id)
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(classroom);
}
