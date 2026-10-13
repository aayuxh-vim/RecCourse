'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Send, Globe, ExternalLink, Save, CheckCircle } from 'lucide-react';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  published: boolean;
  courseUrl: string | null;
  syllabusUrl: string | null;
  joinCode?: string;
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

  // Course URL state
  const [courseUrlInput, setCourseUrlInput] = useState('');
  const [savingCourseUrl, setSavingCourseUrl] = useState(false);
  const [courseUrlSuccess, setCourseUrlSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        const data = await res.json();
        setCourse(data);
        setCourseUrlInput(data.courseUrl || '');
      }
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

  async function handleUpdateCourseUrl(e: React.FormEvent) {
    e.preventDefault();
    setSavingCourseUrl(true);
    setCourseUrlSuccess(false);

    const res = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseUrl: courseUrlInput.trim() || null }),
    });

    if (res.ok) {
      const updated = await res.json();
      setCourse((prev) => (prev ? { ...prev, courseUrl: updated.courseUrl } : null));
      setCourseUrlSuccess(true);
      setTimeout(() => setCourseUrlSuccess(false), 4000);
    }
    setSavingCourseUrl(false);
  }

  async function togglePublish() {
    if (!course) return;
    const res = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !course.published }),
    });
    if (res.ok) {
      setCourse((prev) => (prev ? { ...prev, published: !prev.published } : null));
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
      <Link
        href="/faculty/courses"
        className="btn btn-ghost"
        style={{ padding: 0, marginBottom: '24px', color: 'var(--text-muted)' }}
      >
        <ArrowLeft size={16} /> Back to My Courses
      </Link>

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
            {course.joinCode && (
              <span className="badge badge-violet">
                Join Code: {course.joinCode}
              </span>
            )}
          </div>
        </div>
        <button className="btn btn-secondary" onClick={togglePublish}>
          {course.published ? 'Unpublish' : 'Publish'}
        </button>
      </div>

      {/* Course Website Link Section */}
      <div className="card" style={{ marginBottom: '32px', borderLeft: '4px solid var(--accent-cyan)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Globe size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Course Website Link</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Set the destination website URL for this course (e.g. Udacity, Coursera, or custom course site). Students will be redirected here.
              </p>
            </div>
          </div>
          {course.courseUrl && (
            <a
              href={course.courseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm flex items-center gap-1"
            >
              Visit Course Site <ExternalLink size={14} />
            </a>
          )}
        </div>

        <form onSubmit={handleUpdateCourseUrl} className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <input
              type="url"
              className="input"
              placeholder="https://www.udacity.com/course/..."
              value={courseUrlInput}
              onChange={(e) => setCourseUrlInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingCourseUrl}>
            <Save size={14} />
            {savingCourseUrl ? 'Saving...' : 'Save Course Link'}
          </button>
          {courseUrlSuccess && (
            <span className="badge badge-green flex items-center gap-1">
              <CheckCircle size={14} /> Updated!
            </span>
          )}
        </form>
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
