'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Map as MapIcon, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LearningPath {
  id: string;
  goal: string;
  description: string;
  createdAt: string;
  courses: any[];
}

export default function LearningPathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPaths();
  }, []);

  async function fetchPaths() {
    const res = await fetch('/api/learning-paths');
    if (res.ok) {
      setPaths(await res.json());
    }
    setLoading(false);
  }

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;

    setGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/learning-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: goal.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate path');
      }

      const newPath = await res.json();
      router.push(`/student/learning-paths/${newPath.id}`);
    } catch (err: any) {
      setError(err.message);
      setGenerating(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Learning Paths</h1>
        <p className="page-subtitle">AI-curated learning journeys to reach your goals</p>
      </div>

      <div className="card" style={{ marginBottom: '32px', border: '1px solid var(--accent-violet)', background: 'linear-gradient(to right, rgba(139, 92, 246, 0.05), transparent)' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
          <Sparkles className="text-violet-500" style={{ color: 'var(--accent-violet)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Generate a New Path</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Tell us what you want to achieve, and our AI will build a step-by-step curriculum from our catalog just for you.
        </p>
        
        <form onSubmit={handleGenerate} className="flex gap-3">
          <input
            type="text"
            className="input"
            style={{ flex: 1 }}
            placeholder="e.g. Become a full-stack developer, Master machine learning, Get better at Python..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={generating}
          />
          <button type="submit" className="btn btn-primary" disabled={generating || !goal.trim()}>
            {generating ? (
              <><Loader2 size={16} className="animate-spin" /> Generating...</>
            ) : (
              <><Sparkles size={16} /> Create Path</>
            )}
          </button>
        </form>
        {error && <p style={{ color: 'var(--accent-danger)', marginTop: '12px', fontSize: '14px' }}>{error}</p>}
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Your Saved Paths</h3>
      
      {loading ? (
        <div className="grid grid-2">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: '160px' }} />
          ))}
        </div>
      ) : paths.length === 0 ? (
        <div className="empty-state">
          <MapIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No learning paths yet</h3>
          <p>Use the form above to generate your first AI-curated curriculum.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {paths.map((path) => (
            <Link key={path.id} href={`/student/learning-paths/${path.id}`}>
              <div className="course-card">
                <div className="course-card-header">
                  <span className="badge badge-violet">{path.courses.length} courses</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(path.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="course-card-body">
                  <h3 className="course-card-title">{path.goal}</h3>
                  <p className="course-card-desc" style={{ WebkitLineClamp: 2 }}>{path.description}</p>
                </div>
                <div className="course-card-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <span className="flex items-center gap-1" style={{ color: 'var(--accent-cyan)', fontSize: '14px', fontWeight: '500' }}>
                    View Path <ArrowRight size={16} />
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
