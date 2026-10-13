'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle, BookOpen, Eye } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  published: boolean;
  meetLink?: string | null;
  joinCode?: string | null;
  _count: { enrollments: number };
}

export default function FacultyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const url = activeTab === 'my' ? '/api/courses?mine=true&limit=100' : '/api/courses?limit=100';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
      }
      setLoading(false);
    }
    load();
  }, [activeTab]);

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">{activeTab === 'my' ? 'My Courses' : 'All Catalog Courses'}</h1>
          <p className="page-subtitle">
            {activeTab === 'my'
              ? 'Courses created and managed by you'
              : 'Browse all active platform courses'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/student/courses" className="btn btn-secondary">
            <Eye size={16} /> Course Catalog
          </Link>
          <Link href="/faculty/courses/new" className="btn btn-primary">
            <PlusCircle size={16} /> Create Course
          </Link>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '24px' }}>
        <button
          className={`tab ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          My Created Courses ({activeTab === 'my' ? courses.length : '...'})
        </button>
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Platform Courses
        </button>
      </div>

      {loading ? (
        <div className="grid grid-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '200px' }} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>{activeTab === 'my' ? 'No courses created yet' : 'No courses found'}</h3>
          <p>
            {activeTab === 'my'
              ? 'Create your first course to start teaching and host live meetings.'
              : 'No courses are currently available in the catalog.'}
          </p>
          {activeTab === 'my' && (
            <Link href="/faculty/courses/new" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Create Course
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={activeTab === 'my' ? `/faculty/courses/${course.id}` : `/student/courses/${course.id}`}
            >
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
                    {course.joinCode && (
                      <span className="badge badge-violet" style={{ fontSize: '11px' }}>
                        Code: {course.joinCode}
                      </span>
                    )}
                  </div>
                </div>
                <div className="course-card-footer">
                  <span>{course._count.enrollments} students enrolled</span>
                  <span style={{ color: 'var(--accent-violet)', fontSize: '12px' }}>
                    {activeTab === 'my' ? 'Manage →' : 'View →'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
