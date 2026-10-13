'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, Users, Megaphone, PlusCircle, Video, Star,
  Award, TrendingUp, CheckCircle
} from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  description: string;
  joinCode: string;
  meetLink?: string | null;
  _count: { members: number; courses: number; broadcasts: number };
}

interface FacultyCourse {
  id: string;
  title: string;
  published: boolean;
  rating: number | null;
  reviewCount: number | null;
}

export default function FacultyDashboard() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [courses, setCourses] = useState<FacultyCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [classroomsRes, coursesRes] = await Promise.all([
          fetch('/api/classrooms'),
          fetch('/api/courses?mine=true&limit=100'),
        ]);

        if (classroomsRes.ok) {
          setClassrooms(await classroomsRes.json());
        }
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData.courses || []);
        }
      } catch (err) {
        console.error('Failed to load faculty dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalStudents = classrooms.reduce((sum, c) => sum + c._count.members, 0);
  const totalBroadcasts = classrooms.reduce((sum, c) => sum + c._count.broadcasts, 0);

  const publishedCourses = courses.filter((c) => c.published).length;
  const meetClassrooms = classrooms.filter((c) => !!c.meetLink).length;

  const ratedCourses = courses.filter((c) => c.rating != null && c.rating > 0);
  const avgRating = ratedCourses.length > 0
    ? (ratedCourses.reduce((sum, c) => sum + (c.rating || 0), 0) / ratedCourses.length).toFixed(1)
    : null;
  const totalReviews = ratedCourses.reduce((sum, c) => sum + (c.reviewCount || 0), 0);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton" style={{ width: '200px', height: '32px' }} />
        </div>
        <div className="grid grid-3" style={{ marginBottom: '24px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '120px' }} />
          ))}
        </div>
        <div className="grid grid-3">
          {[4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ height: '120px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Faculty Dashboard</h1>
          <p className="page-subtitle">Manage your classrooms, schedule live lectures, and engage students</p>
        </div>
        <div className="flex gap-2">
          <Link href="/student/courses" className="btn btn-secondary">
            <BookOpen size={16} /> Course Catalog
          </Link>
          <Link href="/faculty/courses/new" className="btn btn-secondary">
            <PlusCircle size={16} /> New Course
          </Link>
          <Link href="/faculty/classrooms/new" className="btn btn-primary">
            <PlusCircle size={16} /> Create Classroom
          </Link>
        </div>
      </div>

      {/* Row 1: Student & Cohort Engagement Metrics */}
      <div className="grid grid-3" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-violet)' }}><Users size={22} /></div>
            <div>
              <div className="stat-value">{classrooms.length}</div>
              <div className="stat-label">Active Classrooms</div>
              <div style={{ fontSize: '11px', color: classrooms.length > 0 ? 'var(--accent-green)' : 'var(--text-muted)', marginTop: '2px' }}>
                {classrooms.length > 0 ? 'Cohorts in session' : 'Create your first classroom'}
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-cyan)' }}><Users size={22} /></div>
            <div>
              <div className="stat-value">{totalStudents}</div>
              <div className="stat-label">Enrolled Students</div>
              <div style={{ fontSize: '11px', color: totalStudents > 0 ? 'var(--accent-green)' : 'var(--text-muted)', marginTop: '2px' }}>
                {totalStudents > 0 ? `Across ${classrooms.length} active classrooms` : 'Invite students via code'}
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-amber)' }}><Megaphone size={22} /></div>
            <div>
              <div className="stat-value">{totalBroadcasts}</div>
              <div className="stat-label">Broadcasts Dispatched</div>
              <div style={{ fontSize: '11px', color: totalBroadcasts > 0 ? 'var(--accent-amber)' : 'var(--text-muted)', marginTop: '2px' }}>
                {totalBroadcasts > 0 ? 'Announcements & materials delivered' : 'No announcements yet'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Real Teaching & Curriculum Metrics */}
      <div className="grid grid-3" style={{ marginBottom: '40px' }}>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-violet)' }}><BookOpen size={22} /></div>
            <div>
              <div className="stat-value">{courses.length}</div>
              <div className="stat-label">Courses Managed</div>
              <div style={{ fontSize: '11px', color: 'var(--accent-green)', marginTop: '2px' }}>
                {courses.length > 0
                  ? `${publishedCourses} published, ${courses.length - publishedCourses} in draft`
                  : 'Start authoring a course'}
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-green)' }}><Video size={22} /></div>
            <div>
              <div className="stat-value">
                {meetClassrooms} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>/ {classrooms.length}</span>
              </div>
              <div className="stat-label">Live Classrooms</div>
              <div style={{ fontSize: '11px', color: meetClassrooms > 0 ? 'var(--accent-green)' : 'var(--text-muted)', marginTop: '2px' }}>
                {meetClassrooms > 0
                  ? `${meetClassrooms} active Google Meet links`
                  : 'Add Meet link to classrooms'}
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-amber)' }}><Star size={22} fill="currentColor" /></div>
            <div>
              <div className="stat-value">
                {avgRating ? `${avgRating} / 5.0` : 'New Instructor'}
              </div>
              <div className="stat-label">Course Rating</div>
              <div style={{ fontSize: '11px', color: totalReviews > 0 ? 'var(--accent-green)' : 'var(--text-muted)', marginTop: '2px' }}>
                {totalReviews > 0
                  ? `From ${totalReviews.toLocaleString()} reviews`
                  : 'Awaiting student reviews'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Your Classrooms</h2>
        <Link href="/faculty/classrooms" className="btn btn-ghost btn-sm">
          Manage Classrooms →
        </Link>
      </div>

      {classrooms.length === 0 ? (
        <div className="empty-state">
          <h3>No classrooms yet</h3>
          <p>Create your first classroom to invite students and share live lecture links.</p>
          <Link href="/faculty/classrooms/new" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Create Classroom
          </Link>
        </div>
      ) : (
        <div className="grid grid-3">
          {classrooms.map((c) => (
            <Link key={c.id} href={`/faculty/classrooms/${c.id}`}>
              <div className="course-card animate-fadeIn">
                <div className="course-card-header" style={{ height: '100px' }}>
                  <span className="course-card-category">Classroom</span>
                </div>
                <div className="course-card-body">
                  <h3 className="course-card-title">{c.name}</h3>
                  <p className="course-card-desc" style={{ marginTop: '4px' }}>{c.description}</p>
                  <div className="flex items-center gap-2" style={{ marginTop: '12px' }}>
                    <span
                      className="badge badge-violet"
                      style={{ cursor: 'copy' }}
                      title="Copy Code"
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText(c.joinCode);
                        alert('Join Code copied!');
                      }}
                    >
                      Code: {c.joinCode}
                    </span>
                    {c.meetLink && (
                      <span className="badge badge-green flex items-center gap-1" style={{ fontSize: '11px' }}>
                        <Video size={10} /> Meet Ready
                      </span>
                    )}
                  </div>
                </div>
                <div className="course-card-footer">
                  <span>{c._count.members} students</span>
                  <span>{c._count.courses} courses</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
