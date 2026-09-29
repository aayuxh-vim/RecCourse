'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Megaphone } from 'lucide-react';

export default function StudentClassroomViewPage() {
  const pathname = usePathname();
  const id = pathname.split('/').pop();
  
  const [classroom, setClassroom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/classrooms/${id}`);
      if (res.ok) {
        setClassroom(await res.json());
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '24px' }} />
        <div className="skeleton" style={{ height: '200px' }} />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="empty-state">
        <h3>Classroom Not Found</h3>
        <p>This classroom does not exist or you have not joined it.</p>
        <Link href="/student/enrolled" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Classrooms</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/student/enrolled" className="btn btn-ghost" style={{ padding: 0, marginBottom: '24px', color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to My Classrooms
      </Link>

      <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">{classroom.name}</h1>
          <p className="page-subtitle">Instructor: {classroom.faculty.name || 'TBD'}</p>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '32px' }}>
        
        {/* Left Column: Courses */}
        <div className="card">
          <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
            <BookOpen size={20} style={{ color: 'var(--accent-cyan)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Classroom Courses</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {classroom.courses.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Your instructor hasn't added any courses yet.</p>
            ) : (
              classroom.courses.map((cc: any) => (
                <Link key={cc.id} href={`/student/courses/${cc.courseId}`}>
                  <div className="p-4 animate-fadeIn" style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--accent-cyan)'} onMouseOut={e => e.currentTarget.style.borderColor = 'var(--border-primary)'}>
                    <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>{cc.course.title}</h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{cc.course.category} • {cc.course.difficulty}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Broadcasts */}
        <div className="card">
          <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
            <Megaphone size={20} style={{ color: 'var(--accent-amber)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Announcements & Materials</h3>
          </div>
          
          <div className="flex flex-col gap-3">
            {classroom.broadcasts.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No announcements yet.</p>
            ) : (
              classroom.broadcasts.map((b: any) => (
                <div key={b.id} style={{ padding: '16px', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                  <div className="flex justify-between items-start" style={{ marginBottom: '8px' }}>
                    <span className={`broadcast-type ${b.type.toLowerCase()}`}>{b.type}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="broadcast-title">{b.title}</div>
                  <div className="broadcast-content">{b.content}</div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
