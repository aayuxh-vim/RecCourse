'use client';

import { useEffect, useState } from 'react';
import { Users, BookOpen, GraduationCap, Megaphone } from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalEnrollments: number;
  totalBroadcasts: number;
  recentUsers: number;
  recentEnrollments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/stats');
      if (res.ok) setStats(await res.json());
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
        <div className="grid grid-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '120px' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and management</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '40px' }}>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-violet)' }}><Users size={20} /></div>
            <div>
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Total users</div>
              <div className="stat-change positive">+{stats.recentUsers} this week</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-cyan)' }}><BookOpen size={20} /></div>
            <div>
              <div className="stat-value">{stats.totalCourses}</div>
              <div className="stat-label">Courses</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-green)' }}><GraduationCap size={20} /></div>
            <div>
              <div className="stat-value">{stats.totalEnrollments}</div>
              <div className="stat-label">Enrollments</div>
              <div className="stat-change positive">+{stats.recentEnrollments} this week</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-amber)' }}><Megaphone size={20} /></div>
            <div>
              <div className="stat-value">{stats.totalBroadcasts}</div>
              <div className="stat-label">Broadcasts</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>User Breakdown</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Students</span>
              <span style={{ fontWeight: '600' }}>{stats.totalStudents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Faculty</span>
              <span style={{ fontWeight: '600' }}>{stats.totalFaculty}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Admins</span>
              <span style={{ fontWeight: '600' }}>
                {stats.totalUsers - stats.totalStudents - stats.totalFaculty}
              </span>
            </div>
          </div>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Quick Stats</h3>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Avg. enrollments per course</span>
              <span style={{ fontWeight: '600' }}>
                {stats.totalCourses > 0
                  ? (stats.totalEnrollments / stats.totalCourses).toFixed(1)
                  : '0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: 'var(--text-secondary)' }}>Avg. broadcasts per course</span>
              <span style={{ fontWeight: '600' }}>
                {stats.totalCourses > 0
                  ? (stats.totalBroadcasts / stats.totalCourses).toFixed(1)
                  : '0'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
