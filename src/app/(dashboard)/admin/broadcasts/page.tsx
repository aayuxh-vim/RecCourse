'use client';

import { useEffect, useState } from 'react';

interface Broadcast {
  id: string;
  title: string;
  content: string;
  type: string;
  createdAt: string;
  faculty: { name: string; image: string | null };
  course?: { title: string } | null;
  classroom?: { name: string } | null;
}

export default function AdminBroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/broadcasts?all=true');
        if (res.ok) {
          const data = await res.json();
          setBroadcasts(data);
        }
      } catch (err) {
        console.error('Failed to load broadcasts:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Broadcast Audit Log</h1>
        <p className="page-subtitle">All announcements and broadcasts dispatched across the platform</p>
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
                <th>Destination</th>
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
                    {bc.course?.title
                      ? `Course: ${bc.course.title}`
                      : bc.classroom?.name
                      ? `Classroom: ${bc.classroom.name}`
                      : 'Global'}
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
