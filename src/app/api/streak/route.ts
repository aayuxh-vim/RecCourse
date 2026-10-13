import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { streak: true, longestStreak: true, lastLoginDate: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const now = new Date();
  
  if (user.lastLoginDate) {
    const diffHours = (now.getTime() - new Date(user.lastLoginDate).getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) {
      // Cooldown active: checked in within the last 24 hours
      return NextResponse.json({
        streak: user.streak,
        longestStreak: user.longestStreak,
        lastLoginDate: user.lastLoginDate,
        hasCheckedInToday: true,
        hoursRemaining: Math.max(1, Math.ceil(24 - diffHours)),
        updated: false,
      });
    }
  }

  let newStreak = 1;

  if (user.lastLoginDate) {
    const diffHours = (now.getTime() - new Date(user.lastLoginDate).getTime()) / (1000 * 60 * 60);
    // Because check-ins are locked out for 24 hours, any check-in within 48 hours
    // (the following day's window) qualifies as consecutive continuation.
    if (diffHours <= 48) {
      newStreak = (user.streak || 0) + 1;
    } else {
      // More than 48 hours elapsed — a full day was missed, streak resets to 1
      newStreak = 1;
    }
  }

  const newLongest = Math.max(newStreak, user.longestStreak || 1);

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      streak: newStreak,
      longestStreak: newLongest,
      lastLoginDate: now,
    },
    select: { streak: true, longestStreak: true, lastLoginDate: true },
  });

  return NextResponse.json({
    ...updated,
    hasCheckedInToday: true,
    hoursRemaining: 24,
    updated: true,
  });
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { streak: true, longestStreak: true, lastLoginDate: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const now = new Date();
  const diffHours = user.lastLoginDate
    ? (now.getTime() - new Date(user.lastLoginDate).getTime()) / (1000 * 60 * 60)
    : 999;

  const hasCheckedInToday = diffHours < 24;
  const hoursRemaining = hasCheckedInToday ? Math.max(1, Math.ceil(24 - diffHours)) : 0;
  
  // If more than 48 hours passed without checking in, the active streak has expired
  const activeStreak = diffHours > 48 ? 0 : user.streak;

  return NextResponse.json({
    ...user,
    streak: activeStreak,
    hasCheckedInToday,
    hoursRemaining,
  });
}
