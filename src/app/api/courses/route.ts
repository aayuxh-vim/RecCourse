import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const courseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  difficulty: z.string().default('Intermediate'),
  syllabusUrl: z.string().optional(),
  courseUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  duration: z.string().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
  prerequisites: z.string().optional(),
  courseType: z.string().optional(),
  published: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');

  const where: Record<string, unknown> = { published: true };

  if (category) {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search.toLowerCase()] } },
    ];
  }

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      include: {
        faculty: { select: { id: true, name: true, image: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.course.count({ where }),
  ]);

  return NextResponse.json({
    courses,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || (user.role !== 'FACULTY' && user.role !== 'ADMIN')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = courseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const course = await prisma.course.create({
    data: {
      ...parsed.data,
      facultyId: user.id,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
