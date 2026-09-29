'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, BookOpen, Megaphone, PlusCircle } from 'lucide-react';

interface ClassroomData {
  id: string;
  name: string;
  description: string;
  joinCode: string;
  members: any[];
  courses: any[];
  broadcasts: any[];
}

export default function ClassroomViewPage() {
  const pathname = usePathname();
  const id = pathname.split('/').pop();
  
  const [classroom, setClassroom] = useState<ClassroomData | null>(null);
  const [loading, setLoading] = useState(true);

  const [catalog, setCatalog] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastType, setBroadcastType] = useState('ANNOUNCEMENT');

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/classrooms/${id}`);
      if (res.ok) {
        setClassroom(await res.json());
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
    const res = await fetch(`/api/classrooms/${id}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, action: 'remove' })
    });
    if (res.ok) window.location.reload();
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        classroomId: id,
        title: broadcastTitle,
        content: broadcastContent,
        type: broadcastType
      })
    });
    if (res.ok) window.location.reload();
    else alert('Failed to send broadcast');
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
        <Link href="/faculty" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/faculty" className="btn btn-ghost" style={{ padding: 0, marginBottom: '24px', color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between" style={{ marginBottom: '32px' }}>
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
              <button type="submit" className="btn btn-primary">Add</button>
            </form>
            
            <div className="flex flex-col gap-2">
              {classroom.courses.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No courses added yet.</p>
              ) : (
                classroom.courses.map((cc: any) => (
                  <div key={cc.id} className="flex justify-between items-center p-3" style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{cc.course.title}</span>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-red)' }} onClick={() => handleRemoveCourse(cc.courseId)}>Remove</button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Enrolled Students</h3>
            <div className="flex flex-col gap-2">
              {classroom.members.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No students have joined yet.</p>
              ) : (
                classroom.members.map((m: any) => (
                  <div key={m.id} className="flex justify-between items-center p-3" style={{ background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-primary)' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>{m.user.name || 'Anonymous'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.user.email}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Broadcasts */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Send Broadcast</h3>
            <form onSubmit={handleSendBroadcast}>
              <div className="form-group">
                <label className="label">Type</label>
                <select className="input select" value={broadcastType} onChange={e => setBroadcastType(e.target.value)}>
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="MATERIAL">Material</option>
                  <option value="ASSIGNMENT">Assignment</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label">Title</label>
                <input type="text" className="input" required value={broadcastTitle} onChange={e => setBroadcastTitle(e.target.value)} placeholder="e.g., Midterm Exam Schedule" />
              </div>
              <div className="form-group">
                <label className="label">Message</label>
                <textarea className="input textarea" required value={broadcastContent} onChange={e => setBroadcastContent(e.target.value)} placeholder="Type your message here... Emails will be sent automatically." />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Megaphone size={16} /> Broadcast to Classroom
              </button>
            </form>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Broadcast History</h3>
            <div className="flex flex-col gap-3">
              {classroom.broadcasts.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No broadcasts sent yet.</p>
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
    </div>
  );
}
