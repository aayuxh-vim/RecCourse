'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Megaphone, PlusCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  published: boolean;
  _count: { enrollments: number; broadcasts: number };
}

export default function FacultyDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/courses?limit=100');
      if (res.ok) {
        const data = await res.json();
        // Faculty sees their own courses via the general endpoint
        setCourses(data.courses);
      }
      setLoading(false);
    }
    load();
  }, []);

  const totalStudents = courses.reduce((sum, c) => sum + c._count.enrollments, 0);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton" style={{ width: '200px', height: '32px' }} />
        </div>
        <div className="grid grid-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '120px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Faculty Dashboard</h1>
          <p className="page-subtitle">Manage your courses and communicate with students</p>
        </div>
        <Link href="/faculty/courses/new" className="btn btn-primary">
          <PlusCircle size={16} /> Create Course
        </Link>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '40px' }}>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-violet)' }}><BookOpen size={20} /></div>
            <div>
              <div className="stat-value">{courses.length}</div>
              <div className="stat-label">Courses</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-cyan)' }}><Users size={20} /></div>
            <div>
              <div className="stat-value">{totalStudents}</div>
              <div className="stat-label">Total students</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-amber)' }}><Megaphone size={20} /></div>
            <div>
              <div className="stat-value">
                {courses.reduce((sum, c) => sum + c._count.broadcasts, 0)}
              </div>
              <div className="stat-label">Broadcasts sent</div>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Your Courses</h2>

      {courses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses yet</h3>
          <p>Create your first course to get started.</p>
          <Link href="/faculty/courses/new" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Create course
          </Link>
        </div>
      ) : (
        <div className="grid grid-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/faculty/courses/${course.id}`}>
              <div className="course-card animate-fadeIn">
                <div className="course-card-header">
                  <span className="course-card-category">{course.category}</span>
                </div>
                <div className="course-card-body">
                  <h3 className="course-card-title">{course.title}</h3>
                  <div className="flex items-center gap-2" style={{ marginTop: '8px' }}>
                    <span className={`badge ${course.published ? 'badge-green' : 'badge-amber'}`}>
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <div className="course-card-footer">
                  <span>{course._count.enrollments} students</span>
                  <span>{course._count.broadcasts} broadcasts</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
