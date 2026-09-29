'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Users, Send } from 'lucide-react';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  published: boolean;
  broadcasts: Array<{
    id: string;
    title: string;
    content: string;
    type: string;
    createdAt: string;
    faculty: { name: string };
  }>;
  _count: { enrollments: number };
}

export default function FacultyCourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Broadcast form state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastType, setBroadcastType] = useState('ANNOUNCEMENT');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) setCourse(await res.json());
      setLoading(false);
    }
    load();
  }, [courseId]);

  async function handleSendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setSuccess('');

    const res = await fetch('/api/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId,
        title: broadcastTitle,
        content: broadcastContent,
        type: broadcastType,
      }),
    });

    if (res.ok) {
      const broadcast = await res.json();
      setCourse((prev) =>
        prev
          ? { ...prev, broadcasts: [broadcast, ...prev.broadcasts] }
          : null
      );
      setBroadcastTitle('');
      setBroadcastContent('');
      setSuccess('Broadcast sent. Email notifications have been dispatched to enrolled students.');
      setTimeout(() => setSuccess(''), 5000);
    }
    setSending(false);
  }

  async function togglePublish() {
    if (!course) return;
    const res = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !course.published }),
    });
    if (res.ok) {
      setCourse((prev) => prev ? { ...prev, published: !prev.published } : null);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ width: '300px', height: '32px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '400px' }} />
      </div>
    );
  }

  if (!course) {
    return <div className="empty-state"><h3>Course not found</h3></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
        <div>
          <span className="badge badge-cyan" style={{ marginBottom: '8px', display: 'inline-block' }}>
            {course.category}
          </span>
          <h1 className="page-title">{course.title}</h1>
          <div className="flex items-center gap-3" style={{ marginTop: '8px' }}>
            <span className={`badge ${course.published ? 'badge-green' : 'badge-amber'}`}>
              {course.published ? 'Published' : 'Draft'}
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              <Users size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              {course._count.enrollments} students
            </span>
          </div>
        </div>
        <button className="btn btn-secondary" onClick={togglePublish}>
          {course.published ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      <div className="grid grid-2" style={{ gap: '32px' }}>
        {/* Broadcast Form */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Send Broadcast
          </h2>

          {success && <div className="message message-success">{success}</div>}

          <form onSubmit={handleSendBroadcast} className="card">
            <div className="form-group">
              <label htmlFor="bc-type" className="label">Type</label>
              <select
                id="bc-type"
                className="input select"
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value)}
              >
                <option value="ANNOUNCEMENT">Announcement</option>
                <option value="MATERIAL">Material</option>
                <option value="ASSIGNMENT">Assignment</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="bc-title" className="label">Title</label>
              <input
                id="bc-title"
                type="text"
                className="input"
                placeholder="Broadcast title"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="bc-content" className="label">Content</label>
              <textarea
                id="bc-content"
                className="input textarea"
                placeholder="Write your broadcast message..."
                value={broadcastContent}
                onChange={(e) => setBroadcastContent(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={sending}>
              <Send size={14} />
              {sending ? 'Sending...' : 'Send Broadcast'}
            </button>
          </form>
        </div>

        {/* Broadcast History */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Broadcast History
          </h2>

          {course.broadcasts.length === 0 ? (
            <div className="empty-state">
              <h3>No broadcasts yet</h3>
              <p>Send your first broadcast to communicate with enrolled students.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {course.broadcasts.map((broadcast) => (
                <div key={broadcast.id} className="broadcast-card animate-fadeIn">
                  <div className="broadcast-header">
                    <span className={`broadcast-type ${broadcast.type.toLowerCase()}`}>
                      {broadcast.type}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(broadcast.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="broadcast-title">{broadcast.title}</h4>
                  <p className="broadcast-content">{broadcast.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
