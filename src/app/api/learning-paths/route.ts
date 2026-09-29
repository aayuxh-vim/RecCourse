import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

const generatePathSchema = z.object({
  goal: z.string().min(3).max(200),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const paths = await prisma.learningPath.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(paths);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = generatePathSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid data', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { goal } = parsed.data;

  // Initialize Gemini
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Gemini API Key is not configured.' },
      { status: 500 }
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Fetch a catalog summary (id, title, difficulty, tags) to send to AI
  const allCourses = await prisma.course.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      difficulty: true,
      tags: true,
      category: true,
    },
  });

  const courseCatalogContext = allCourses.map(c => 
    `ID: ${c.id} | Title: ${c.title} | Category: ${c.category} | Difficulty: ${c.difficulty} | Tags: ${c.tags.join(', ')}`
  ).join('\n');

  const prompt = `You are an expert educational counselor. The user wants to achieve this goal: "${goal}".
Here is a list of available courses in our catalog:
${courseCatalogContext}

Create a structured learning path to help them achieve their goal. 
Select between 3 to 8 courses from the catalog that logically build upon each other (from beginner to advanced, if applicable).
Return a JSON object matching this schema exactly:
{
  "description": "A short, encouraging paragraph summarizing this learning path and why these courses were chosen.",
  "courses": [
    {
      "courseId": "The exact ID of the course from the catalog",
      "rationale": "A short sentence explaining why this course is the logical next step."
    }
  ]
}

DO NOT wrap the response in markdown blocks like \`\`\`json. Return RAW JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('No response from AI');
    }
    
    let parsedResult;
    try {
      parsedResult = JSON.parse(resultText);
    } catch (e) {
       // fallback cleanup if markdown was included
       const cleaned = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
       parsedResult = JSON.parse(cleaned);
    }

    if (!parsedResult.courses || !Array.isArray(parsedResult.courses)) {
      throw new Error('Invalid response structure from AI');
    }

    // Add order index to the courses array
    const orderedCourses = parsedResult.courses.map((c: any, index: number) => ({
      courseId: c.courseId,
      rationale: c.rationale,
      order: index + 1
    }));

    // Verify all recommended courseIds exist
    const validCourseIds = new Set(allCourses.map(c => c.id));
    const validatedCourses = orderedCourses.filter((c: any) => validCourseIds.has(c.courseId));

    if (validatedCourses.length === 0) {
      throw new Error('AI recommended invalid courses.');
    }

    const learningPath = await prisma.learningPath.create({
      data: {
        userId: session.user.id,
        goal,
        description: parsedResult.description || 'Your personalized learning path.',
        courses: validatedCourses,
      },
    });

    return NextResponse.json(learningPath, { status: 201 });

  } catch (error: any) {
    console.error('Error generating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning path', details: error.message },
      { status: 500 }
    );
  }
}
