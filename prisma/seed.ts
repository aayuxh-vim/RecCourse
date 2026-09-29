import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// ── CSV Parser (simple, handles quoted fields) ──────────────────────────────
function parseCSV(content: string): Record<string, string>[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === '\n' && !inQuotes) {
      lines.push(current.replace(/\r$/, ''));
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) lines.push(current.replace(/\r$/, ''));

  if (lines.length < 2) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] || '').trim();
    });
    return row;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ── Category inference from title and skills ────────────────────────────────
const CATEGORY_RULES: { category: string; keywords: string[] }[] = [
  {
    category: 'Data Science',
    keywords: [
      'data scien', 'data analy', 'data engineer', 'data wrangling',
      'business analytics', 'data visualization', 'tableau', 'power bi',
      'predictive analytics', 'a/b testing', 'data streaming',
    ],
  },
  {
    category: 'Machine Learning & AI',
    keywords: [
      'machine learning', 'deep learning', 'neural network', 'ai programming',
      'artificial intelligence', 'computer vision', 'natural language',
      'nlp', 'reinforcement learning', 'generative ai', 'pytorch',
      'tensorflow', 'ml engineer', 'ml ops',
    ],
  },
  {
    category: 'Web Development',
    keywords: [
      'web develop', 'front end', 'frontend', 'full stack', 'fullstack',
      'react', 'javascript', 'html', 'css', 'node.js', 'django',
      'flask', 'api development', 'web app',
    ],
  },
  {
    category: 'Mobile Development',
    keywords: [
      'android', 'ios', 'kotlin', 'swift', 'mobile', 'flutter', 'react native',
    ],
  },
  {
    category: 'Cloud & DevOps',
    keywords: [
      'cloud', 'aws', 'azure', 'devops', 'docker', 'kubernetes',
      'microservices', 'site reliability', 'infrastructure',
      'cloud developer', 'cloud devops',
    ],
  },
  {
    category: 'Cybersecurity',
    keywords: [
      'security', 'cybersecurity', 'ethical hacking', 'penetration',
      'security analyst', 'security engineer',
    ],
  },
  {
    category: 'Programming',
    keywords: [
      'c++', 'java', 'python', 'programming', 'intro to programming',
      'object orient', 'data structure', 'algorithm', 'coding',
      'shell scripting', 'git',
    ],
  },
  {
    category: 'Product & Design',
    keywords: [
      'product manager', 'ux', 'user experience', 'design sprint',
      'product design', 'interaction design',
    ],
  },
  {
    category: 'Marketing',
    keywords: [
      'digital marketing', 'marketing', 'growth', 'seo',
      'social media', 'content strategy',
    ],
  },
  {
    category: 'Business',
    keywords: [
      'business', 'leadership', 'management', 'entrepreneurship',
      'startup', 'executive', 'agile', 'sql',
    ],
  },
  {
    category: 'Robotics & Autonomous Systems',
    keywords: [
      'robotics', 'autonomous', 'self-driving', 'flying car',
      'sensor fusion', 'lidar',
    ],
  },
  {
    category: 'Blockchain',
    keywords: ['blockchain', 'smart contract', 'solidity', 'ethereum'],
  },
];

function inferCategory(title: string, skills: string): string {
  const text = `${title} ${skills}`.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => text.includes(kw))) {
      return rule.category;
    }
  }
  return 'Computer Science';
}

function capitalizeLevel(level: string): string {
  if (!level) return 'Intermediate';
  return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
}

// ── Main seed function ──────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Create users ─────────────────────────────────────────────────────
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@reccourse.dev' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@reccourse.dev',
      password: adminPassword,
      role: Role.ADMIN,
      interests: [],
    },
  });
  console.log('✅ Admin user:', admin.email);

  const facultyPassword = await hash('faculty123', 12);
  const faculty = await prisma.user.upsert({
    where: { email: 'faculty@reccourse.dev' },
    update: {},
    create: {
      name: 'Dr. Sarah Chen',
      email: 'faculty@reccourse.dev',
      password: facultyPassword,
      role: Role.FACULTY,
      bio: 'Associate Professor of Computer Science with research interests in machine learning and natural language processing.',
      interests: ['machine learning', 'NLP', 'deep learning'],
    },
  });
  console.log('✅ Faculty user:', faculty.email);

  const studentPassword = await hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@reccourse.dev' },
    update: {},
    create: {
      name: 'Alex Johnson',
      email: 'student@reccourse.dev',
      password: studentPassword,
      role: Role.STUDENT,
      interests: ['machine learning', 'data science', 'python', 'web development'],
    },
  });
  console.log('✅ Student user:', student.email);

  // ─── Load CSV ─────────────────────────────────────────────────────────
  const csvPath = path.join(__dirname, 'all_courses.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('❌ CSV file not found at:', csvPath);
    process.exit(1);
  }

  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(csvContent);
  console.log(`\n📄 Loaded ${rows.length} courses from CSV\n`);

  // ─── Seed courses from CSV ────────────────────────────────────────────
  let seeded = 0;
  let skipped = 0;
  const categories = new Set<string>();

  for (const row of rows) {
    const title = row['Title']?.trim();
    const description = row['Description']?.trim();
    const url = row['URL']?.trim();

    if (!title || !description) {
      skipped++;
      continue;
    }

    const skills = row['Skills Covered'] || '';
    const tags = skills
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s.length > 0 && s.length < 50)
      .slice(0, 10);

    const category = inferCategory(title, skills);
    categories.add(category);

    const level = capitalizeLevel(row['Level'] || '');
    const rating = row['Rating'] ? parseFloat(row['Rating']) : null;
    const reviewCount = row['Review Count']
      ? Math.round(parseFloat(row['Review Count']))
      : null;
    const duration = row['Duration']?.trim() || null;
    const prerequisites = row['Prerequisites']?.trim() || null;
    const courseType = row['Type']?.trim() || null;
    const externalId = `udacity-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '')}`;

    try {
      await prisma.course.upsert({
        where: { externalId },
        update: {
          description,
          category,
          tags,
          difficulty: level,
          courseUrl: url || null,
          duration,
          rating,
          reviewCount,
          prerequisites,
          courseType,
          published: true,
        },
        create: {
          title,
          description,
          category,
          tags,
          difficulty: level,
          courseUrl: url || null,
          duration,
          rating,
          reviewCount,
          prerequisites,
          courseType,
          externalId,
          published: true,
          facultyId: null,
        },
      });
      seeded++;
    } catch (err) {
      console.warn(`⚠️  Skipped "${title}":`, (err as Error).message?.slice(0, 80));
      skipped++;
    }
  }

  console.log(`\n✅ Seeded ${seeded} courses (${skipped} skipped)`);
  console.log(`📁 Categories: ${[...categories].sort().join(', ')}\n`);

  // ─── Enroll sample student in a few courses ──────────────────────────
  const courses = await prisma.course.findMany({ take: 3 });
  for (const course of courses) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: course.id,
        },
      },
      update: {},
      create: {
        userId: student.id,
        courseId: course.id,
        status: 'ACTIVE',
      },
    });
  }
  console.log('✅ Enrolled sample student in 3 courses');

  console.log('\n🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
