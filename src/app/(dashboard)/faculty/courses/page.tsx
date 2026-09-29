'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  published: boolean;
  _count: { enrollments: number };
}

export default function FacultyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/courses?limit=100');
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton" style={{ width: '200px', height: '32px' }} />
        </div>
        <div className="grid grid-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '200px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">My Courses</h1>
          <p className="page-subtitle">{courses.length} courses total</p>
        </div>
        <Link href="/faculty/courses/new" className="btn btn-primary">
          <PlusCircle size={16} /> Create Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses created</h3>
          <p>Create your first course to start teaching.</p>
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
                  <span className={`badge ${course.published ? 'badge-green' : 'badge-amber'}`}>
                    {course.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="course-card-footer">
                  <span>{course._count.enrollments} students</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
