# RecCourse

An intelligent course recommendation and academic collaboration platform for students and faculty.

## Features

- **User Registration and Authentication**: Students and faculty can register with role selection. Supports Google and GitHub OAuth alongside credential-based login.
- **Python-Powered Course Recommendation Engine**: Recommends courses to students based on their interests, learning history, difficulty preferences, popularity, and ratings. The core recommendation logic runs on a dedicated Python engine. Logs all recommendations for future tuning.
- **AI-Generated Learning Paths (Gemini AI)**: Enter a learning goal and let Google's Gemini AI construct a curated step-by-step learning path from the course catalog.
- **Course Ratings and Reviews**: Students can rate courses from 1 to 5 stars.
- **Kaggle Course Dataset Integration**: Built-in support to seed the database with a large dataset of Udacity/Kaggle courses.
- **Faculty Course Broadcast Management**: Faculty can create courses, publish them to students, and send broadcasts (announcements, materials, assignments) with email notifications.
- **AI Research Paper Recommender**: For every course, discovers relevant research papers by querying Semantic Scholar (primary) and arXiv (fallback). Results are cached and logged.
- **Course and Resource Data Management**: Admin can ingest course updates from external providers via a sync API endpoint.
- **Admin Oversight**: Full platform management including user roles, course publishing, and broadcast audit logs.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma
- **Auth**: NextAuth.js v5 (Google, GitHub, Credentials)
- **AI Engine**: Google GenAI SDK (Gemini)
- **Recommendation Engine**: Python 3
- **Email**: Resend
- **External APIs**: Semantic Scholar, arXiv
- **UI**: Vanilla CSS with glassmorphism, gradients, and micro-animations

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- A Supabase project (for PostgreSQL)
- Google and GitHub OAuth credentials (optional for credential-only login)
- Resend API key (optional for email notifications)
- Gemini API key (for AI Learning Paths)

### Installation

```bash
git clone https://github.com/your-repo/reccourse.git
cd reccourse
npm install
```

### Environment Setup

Create an `.env` file and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL`: Your Supabase PostgreSQL connection string (pooled)
- `DIRECT_URL`: Your Supabase PostgreSQL direct connection string
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: `http://localhost:3000` for local development
- `GEMINI_API_KEY`: Your Google Gemini API Key

Optional variables:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: For Google OAuth
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`: For GitHub OAuth
- `RESEND_API_KEY`: For email notifications on broadcasts

### Database Setup

```bash
npx prisma db push
npx prisma db seed
```

This creates the database schema and seeds the sample Kaggle courses plus test accounts:

| Account | Email | Password | Role |
|---------|-------|----------|------|
| Admin | admin@reccourse.dev | admin123 | ADMIN |
| Faculty | faculty@reccourse.dev | faculty123 | FACULTY |
| Student | student@reccourse.dev | student123 | STUDENT |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
  app/
    (auth)/          Login and registration pages
    (dashboard)/     Role-based dashboards
      student/       Student dashboard, learning paths, catalog, course detail
      faculty/       Faculty dashboard, course management, broadcasts
      admin/         Admin dashboard, user/course/broadcast management
    api/             API route handlers
      auth/          NextAuth endpoints
      courses/       Course CRUD and sync
      enrollments/   Enrollment management
      learning-paths/ Gemini AI path generation
      ratings/       Course rating management
      recommendations/ Python-based course recommendation engine
      papers/        Research paper search
      broadcasts/    Broadcast CRUD with email
      admin/         Admin-only endpoints
      users/         User registration and profile
  lib/
    auth.ts          NextAuth configuration
    prisma.ts        Prisma client singleton
    email.ts         Resend email service
    papers/          Semantic Scholar and arXiv clients
prisma/
  schema.prisma      Database schema
  seed.ts            Sample data seeder
scripts/
  recommend.py       Python recommendation algorithm
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/courses | List published courses (search, filter, paginate) |
| POST | /api/courses | Create a course (faculty/admin) |
| GET | /api/courses/[id] | Course detail with enrollment check |
| PUT | /api/courses/[id] | Update course (owner/admin) |
| DELETE | /api/courses/[id] | Delete course (admin) |
| POST | /api/courses/sync | Bulk upsert courses from external provider (admin) |
| POST | /api/enrollments | Enroll or unenroll from a course |
| GET | /api/enrollments | List user enrollments |
| POST | /api/learning-paths | Generate a personalized learning path with Gemini |
| GET | /api/learning-paths | List user's saved learning paths |
| GET | /api/recommendations | Get personalized course recommendations (via Python script) |
| POST | /api/ratings | Rate a course (1-5 stars) |
| GET | /api/papers?courseId=X | Get research paper recommendations for a course |
| POST | /api/broadcasts | Create broadcast with email notification |
| GET | /api/broadcasts?courseId=X | List broadcasts for a course |
| POST | /api/users | Register new user |
| PUT | /api/users | Update user profile and interests |
| GET | /api/users | Get current user profile |
| GET | /api/admin/users | List all users (admin) |
| PUT | /api/admin/users | Update user role (admin) |
| DELETE | /api/admin/users?userId=X | Delete user (admin) |
| GET | /api/admin/stats | Platform analytics (admin) |

## License

MIT
