'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Users, BookOpen, Megaphone, PlusCircle,
  Video, ExternalLink, Save, CheckCircle
} from 'lucide-react';

interface ClassroomData {
  id: string;
  name: string;
  description: string;
  joinCode: string;
  meetLink?: string | null;
  members: any[];
  courses: any[];
  broadcasts: any[];
}

export default function ClassroomViewPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [classroom, setClassroom] = useState<ClassroomData | null>(null);
  const [loading, setLoading] = useState(true);

  // Meet link state
  const [meetLinkInput, setMeetLinkInput] = useState('');
  const [savingMeet, setSavingMeet] = useState(false);
  const [meetSuccess, setMeetSuccess] = useState(false);

  const [catalog, setCatalog] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastType, setBroadcastType] = useState('ANNOUNCEMENT');

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/classrooms/${id}`);
      if (res.ok) {
        const data = await res.json();
        setClassroom(data);
        setMeetLinkInput(data.meetLink || '');
      }
      
      const cRes = await fetch('/api/courses?limit=100');
      if (cRes.ok) {
        const cData = await cRes.json();
        setCatalog(cData.courses);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleUpdateMeetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMeet(true);
    setMeetSuccess(false);

    const res = await fetch(`/api/classrooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ meetLink: meetLinkInput.trim() || null }),
    });

    if (res.ok) {
      const updated = await res.json();
      setClassroom((prev) => (prev ? { ...prev, meetLink: updated.meetLink } : null));
      setMeetSuccess(true);
      setTimeout(() => setMeetSuccess(false), 4000);
    }
    setSavingMeet(false);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    const res = await fetch(`/api/classrooms/${id}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: selectedCourseId })
    });
    if (res.ok) window.location.reload();
  };

  const handleRemoveCourse = async (courseId: string) => {
    const res = await fetch(`/api/classrooms/${id}/courses?courseId=${courseId}`, {
      method: 'DELETE'
    });
    if (res.ok) window.location.reload();
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/broadcasts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classroomId: id,
        title: broadcastTitle,
        content: broadcastContent,
        type: broadcastType
      })
    });
    if (res.ok) {
      setBroadcastTitle('');
      setBroadcastContent('');
      window.location.reload();
    }
  };

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
        <p>The classroom you are looking for does not exist or you do not have access.</p>
        <Link href="/faculty/classrooms" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to My Classrooms</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/faculty/classrooms" className="btn btn-ghost" style={{ padding: 0, marginBottom: '24px', color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to My Classrooms
      </Link>

      <div className="flex items-center justify-between" style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">{classroom.name}</h1>
          <p className="page-subtitle">{classroom.description || 'No description provided.'}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="badge badge-violet" style={{ padding: '8px 12px', fontSize: '14px', cursor: 'copy' }} title="Copy Join Code" onClick={() => { navigator.clipboard.writeText(classroom.joinCode); alert('Copied!'); }}>
            Join Code: <strong style={{ marginLeft: '4px', letterSpacing: '2px' }}>{classroom.joinCode}</strong>
          </div>
        </div>
      </div>

      {/* Live Class Meeting Link Card */}
      <div className="card" style={{ marginBottom: '32px', borderLeft: '4px solid var(--accent-violet)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div className="flex items-center gap-3">
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-violet)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Video size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Live Class Meeting Link</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Set a Google Meet, Zoom, or Microsoft Teams link for enrolled students in this classroom to join live sessions.
              </p>
            </div>
          </div>
          {classroom.meetLink && (
            <a
              href={classroom.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary btn-sm flex items-center gap-1"
            >
              Test Meeting Link <ExternalLink size={14} />
            </a>
          )}
        </div>

        <form onSubmit={handleUpdateMeetLink} className="flex gap-3 items-center" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <input
              type="url"
              className="input"
              placeholder="https://meet.google.com/abc-defg-hij"
              value={meetLinkInput}
              onChange={(e) => setMeetLinkInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={savingMeet}>
            <Save size={14} />
            {savingMeet ? 'Saving...' : 'Save Meet Link'}
          </button>
          {meetSuccess && (
            <span className="badge badge-green flex items-center gap-1">
              <CheckCircle size={14} /> Updated!
            </span>
          )}
        </form>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '40px' }}>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-violet)' }}><Users size={20} /></div>
            <div>
              <div className="stat-value">{classroom.members.length}</div>
              <div className="stat-label">Students Joined</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-cyan)' }}><BookOpen size={20} /></div>
            <div>
              <div className="stat-value">{classroom.courses.length}</div>
              <div className="stat-label">Courses Included</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-amber)' }}><Megaphone size={20} /></div>
            <div>
              <div className="stat-value">{classroom.broadcasts.length}</div>
              <div className="stat-label">Broadcasts Sent</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '32px' }}>
        
        {/* Left Column: Management */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Manage Courses</h3>
            <form onSubmit={handleAddCourse} className="flex gap-2" style={{ marginBottom: '24px' }}>
              <select className="input select" value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)} required>
                <option value="" disabled>Select a course to add...</option>
                {catalog.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                <PlusCircle size={16} /> Add Course
              </button>
            </form>

            <div className="flex flex-col gap-2">
              {classroom.courses.map(c => (
                <div key={c.id} className="flex items-center justify-between" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{c.course.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.course.category}</div>
                  </div>
                  <button onClick={() => handleRemoveCourse(c.courseId)} className="btn btn-danger btn-sm">Remove</button>
                </div>
              ))}
              {classroom.courses.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No courses added to this classroom yet.</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Enrolled Students ({classroom.members.length})</h3>
            <div className="flex flex-col gap-2">
              {classroom.members.map(m => (
                <div key={m.id} className="flex items-center justify-between" style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                  <div>
                    <div style={{ fontWeight: '500' }}>{m.user.name || 'Anonymous User'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.user.email}</div>
                  </div>
                  <span className="badge badge-cyan">Student</span>
                </div>
              ))}
              {classroom.members.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No students have joined yet. Share the Join Code above!</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Broadcasts */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Send Class Broadcast</h3>
            <form onSubmit={handleSendBroadcast} className="flex flex-col gap-4">
              <div>
                <label className="label">Type</label>
                <select className="input select" value={broadcastType} onChange={e => setBroadcastType(e.target.value)}>
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="ASSIGNMENT">Assignment</option>
                  <option value="MATERIAL">Material</option>
                </select>
              </div>
              <div>
                <label className="label">Title</label>
                <input type="text" className="input" required value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} placeholder="e.g. Lecture Notes Updated" />
              </div>
              <div>
                <label className="label">Content</label>
                <textarea className="input textarea" required value={broadcastContent} onChange={e => setBroadcastContent(e.target.value)} placeholder="Write your broadcast message here..." />
              </div>
              <button type="submit" className="btn btn-primary">
                <Megaphone size={16} /> Send to Class
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Broadcast History</h3>
            <div className="flex flex-col gap-4">
              {classroom.broadcasts.map(b => (
                <div key={b.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                    <span className="badge badge-violet">{b.type}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{b.title}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{b.content}</p>
                </div>
              ))}
              {classroom.broadcasts.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No broadcasts sent yet.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
