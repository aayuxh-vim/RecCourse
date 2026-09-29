import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [
    totalUsers,
    totalStudents,
    totalFaculty,
    totalCourses,
    totalEnrollments,
    totalBroadcasts,
    recentUsers,
    recentEnrollments,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.user.count({ where: { role: 'FACULTY' } }),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.broadcast.count(),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.enrollment.count({
      where: {
        enrolledAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return NextResponse.json({
    totalUsers,
    totalStudents,
    totalFaculty,
    totalCourses,
    totalEnrollments,
    totalBroadcasts,
    recentUsers,
    recentEnrollments,
  });
}
