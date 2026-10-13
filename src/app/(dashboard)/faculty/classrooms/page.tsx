'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, PlusCircle, BookOpen, Megaphone, Copy, Check } from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  description: string;
  joinCode: string;
  _count: { members: number; courses: number; broadcasts: number };
}

export default function FacultyClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/classrooms');
        if (res.ok) {
          setClassrooms(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleCopyCode(e: React.MouseEvent, code: string) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">My Classrooms</h1>
          <p className="page-subtitle">
            Manage your student cohorts, share courses, and send live broadcasts
          </p>
        </div>
        <Link href="/faculty/classrooms/new" className="btn btn-primary">
          <PlusCircle size={16} /> Create Classroom
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '220px' }} />
          ))}
        </div>
      ) : classrooms.length === 0 ? (
        <div className="empty-state">
          <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No Classrooms Created Yet</h3>
          <p>Create a classroom to invite students with a join code and assign courses.</p>
          <Link href="/faculty/classrooms/new" className="btn btn-primary" style={{ marginTop: '16px' }}>
            <PlusCircle size={16} /> Create Your First Classroom
          </Link>
        </div>
      ) : (
        <div className="grid grid-3">
          {classrooms.map((c) => (
            <Link key={c.id} href={`/faculty/classrooms/${c.id}`}>
              <div className="course-card animate-fadeIn">
                <div className="course-card-header" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                  <span className="course-card-category">Cohort Hub</span>
                  <button
                    onClick={(e) => handleCopyCode(e, c.joinCode)}
                    className="badge badge-violet"
                    style={{
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: copiedCode === c.joinCode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                      color: copiedCode === c.joinCode ? '#34d399' : '#a5b4fc',
                      borderColor: copiedCode === c.joinCode ? '#10b981' : 'rgba(99, 102, 241, 0.3)',
                    }}
                    title="Click to copy join code"
                  >
                    {copiedCode === c.joinCode ? (
                      <>
                        <Check size={12} /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Code: {c.joinCode}
                      </>
                    )}
                  </button>
                </div>
                <div className="course-card-body">
                  <h3 className="course-card-title">{c.name}</h3>
                  <p className="course-card-desc" style={{ marginTop: '6px' }}>
                    {c.description || 'No description provided.'}
                  </p>
                </div>
                <div className="course-card-footer">
                  <div className="flex items-center gap-3" style={{ fontSize: '13px' }}>
                    <span className="flex items-center gap-1">
                      <Users size={14} style={{ color: 'var(--text-muted)' }} /> {c._count.members}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} style={{ color: 'var(--text-muted)' }} /> {c._count.courses}
                    </span>
                    <span className="flex items-center gap-1">
                      <Megaphone size={14} style={{ color: 'var(--text-muted)' }} /> {c._count.broadcasts}
                    </span>
                  </div>
                  <span style={{ color: 'var(--accent-violet)', fontSize: '13px', fontWeight: '500' }}>
                    Manage →
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
