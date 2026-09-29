'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Enrollment {
  id: string;
  status: string;
  enrolledAt: string;
  course: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    faculty: { name: string } | null;
    _count: { enrollments: number };
  };
}

export default function EnrolledCoursesPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/enrollments');
      if (res.ok) setEnrollments(await res.json());
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
      <div className="page-header">
        <h1 className="page-title">My Courses</h1>
        <p className="page-subtitle">{enrollments.length} courses enrolled</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="empty-state">
          <h3>No enrolled courses</h3>
          <p>Browse the catalog to find courses that interest you.</p>
          <Link href="/student/courses" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-3">
          {enrollments.map((enrollment) => (
            <Link key={enrollment.id} href={`/student/courses/${enrollment.course.id}`}>
              <div className="course-card animate-fadeIn">
                <div className="course-card-header">
                  <span className="course-card-category">{enrollment.course.category}</span>
                </div>
                <div className="course-card-body">
                  <h3 className="course-card-title">{enrollment.course.title}</h3>
                  <div className="flex items-center gap-2" style={{ marginTop: '8px' }}>
                    <span className={`badge ${enrollment.status === 'ACTIVE' ? 'badge-green' : enrollment.status === 'COMPLETED' ? 'badge-cyan' : 'badge-red'}`}>
                      {enrollment.status.toLowerCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="course-card-footer">
                  <span>{enrollment.course.faculty?.name || 'TBD'}</span>
                  <span>{enrollment.course.difficulty}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
