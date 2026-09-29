'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, BookOpen } from 'lucide-react';

interface Classroom {
  id: string;
  name: string;
  description: string;
  joinedAt: string;
  faculty: { name: string } | null;
  _count: { members: number; courses: number };
}

export default function MyClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/classrooms');
      if (res.ok) setClassrooms(await res.json());
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
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title">My Classrooms</h1>
          <p className="page-subtitle">{classrooms.length} classrooms joined</p>
        </div>
        <form 
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const code = (e.currentTarget.elements.namedItem('joinCode') as HTMLInputElement).value;
            if (!code) return;
            
            const res = await fetch('/api/classrooms/join', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ joinCode: code }),
            });
            
            if (res.ok) {
              window.location.reload();
            } else {
              const data = await res.json();
              alert(data.error || 'Failed to join classroom');
            }
          }}
        >
          <input 
            type="text" 
            name="joinCode" 
            placeholder="Enter Class Code" 
            className="input" 
            style={{ width: '200px' }} 
            required 
          />
          <button type="submit" className="btn btn-primary">Join</button>
        </form>
      </div>

      {classrooms.length === 0 ? (
        <div className="empty-state">
          <h3>No joined classrooms</h3>
          <p>Ask your instructor for a class code to join their classroom.</p>
        </div>
      ) : (
        <div className="grid grid-3">
          {classrooms.map((c) => (
            <Link key={c.id} href={`/student/classrooms/${c.id}`}>
              <div className="course-card animate-fadeIn">
                <div className="course-card-header" style={{ height: '100px' }}>
                  <span className="course-card-category">Classroom</span>
                </div>
                <div className="course-card-body">
                  <h3 className="course-card-title">{c.name}</h3>
                  <p className="course-card-desc" style={{ marginTop: '4px' }}>{c.description}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
                    Joined {new Date(c.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="course-card-footer">
                  <span>{c.faculty?.name || 'TBD'}</span>
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
