'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Megaphone, PlusCircle } from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  description: string;
  joinCode: string;
  _count: { members: number; courses: number; broadcasts: number };
}

export default function FacultyDashboard() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/classrooms');
      if (res.ok) {
        setClassrooms(await res.json());
      }
      setLoading(false);
    }
    load();
  }, []);

  const totalStudents = classrooms.reduce((sum, c) => sum + c._count.members, 0);
  const totalBroadcasts = classrooms.reduce((sum, c) => sum + c._count.broadcasts, 0);

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
          <p className="page-subtitle">Manage your classrooms and communicate with students</p>
        </div>
        <div className="flex gap-2">
          <Link href="/faculty/courses/new" className="btn btn-secondary">
            <BookOpen size={16} /> New Course
          </Link>
          <Link href="/faculty/classrooms/new" className="btn btn-primary">
            <PlusCircle size={16} /> Create Classroom
          </Link>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '40px' }}>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-violet)' }}><Users size={20} /></div>
            <div>
              <div className="stat-value">{classrooms.length}</div>
              <div className="stat-label">Classrooms</div>
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
              <div className="stat-value">{totalBroadcasts}</div>
              <div className="stat-label">Broadcasts sent</div>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Your Classrooms</h2>

      {classrooms.length === 0 ? (
        <div className="empty-state">
          <h3>No classrooms yet</h3>
          <p>Create your first classroom to invite students.</p>
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
                    <span className="badge badge-violet" style={{ cursor: 'copy' }} title="Copy Code" onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(c.joinCode); alert('Code copied!'); }}>
                      Code: {c.joinCode}
                    </span>
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
