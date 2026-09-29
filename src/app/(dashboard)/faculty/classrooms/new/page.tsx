'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

export default function NewClassroomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create classroom');
      }

      router.push('/faculty');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px', padding: '40px 24px' }}>
      <Link href="/faculty" className="btn btn-ghost" style={{ padding: 0, marginBottom: '24px', color: 'var(--text-muted)' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <h1 className="page-title">Create Classroom</h1>
      <p className="page-subtitle" style={{ marginBottom: '32px' }}>
        A classroom acts as a digital hub where you can share courses and send broadcasts to students.
      </p>

      {error && (
        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label className="label">Classroom Name *</label>
          <input
            type="text"
            className="input"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Introduction to Machine Learning (Fall 2026)"
          />
        </div>

        <div className="form-group">
          <label className="label">Description (Optional)</label>
          <textarea
            className="input textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Briefly describe what this classroom is about..."
          />
        </div>

        <div className="flex justify-between items-center" style={{ marginTop: '32px' }}>
          <Link href="/faculty" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Create Classroom
          </button>
        </div>
      </form>
    </div>
  );
}
