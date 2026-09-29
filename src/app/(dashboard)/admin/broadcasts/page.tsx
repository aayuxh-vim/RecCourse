'use client';

import { useEffect, useState } from 'react';

interface Broadcast {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  faculty: { name: string; image: string | null };
  course: { title: string };
}

export default function AdminBroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Note: For admin, we need a different endpoint that lists ALL broadcasts
    // For now, we show a message. In production, add an admin broadcasts API.
    async function load() {
      // Fetch broadcasts from all courses
      const coursesRes = await fetch('/api/courses?limit=100');
      if (!coursesRes.ok) {
        setLoading(false);
        return;
      }
      const coursesData = await coursesRes.json();
      const allBroadcasts: Broadcast[] = [];

      for (const course of coursesData.courses.slice(0, 10)) {
        const bcRes = await fetch(`/api/broadcasts?courseId=${course.id}`);
        if (bcRes.ok) {
          const bcs = await bcRes.json();
          allBroadcasts.push(
            ...bcs.map((bc: Broadcast) => ({
              ...bc,
              course: { title: course.title },
            }))
          );
        }
      }

      allBroadcasts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setBroadcasts(allBroadcasts);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Broadcast Audit Log</h1>
        <p className="page-subtitle">All broadcasts across the platform</p>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '400px' }} />
      ) : broadcasts.length === 0 ? (
        <div className="empty-state">
          <h3>No broadcasts found</h3>
          <p>No faculty members have sent any broadcasts yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Course</th>
                <th>Faculty</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {broadcasts.map((bc) => (
                <tr key={bc.id}>
                  <td style={{ fontWeight: '500' }}>{bc.title}</td>
                  <td>
                    <span
                      className={`badge ${
                        bc.type === 'ANNOUNCEMENT'
                          ? 'badge-violet'
                          : bc.type === 'MATERIAL'
                          ? 'badge-green'
                          : 'badge-amber'
                      }`}
                    >
                      {bc.type.toLowerCase()}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {bc.course?.title || 'Unknown'}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {bc.faculty?.name || 'Unknown'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {new Date(bc.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
