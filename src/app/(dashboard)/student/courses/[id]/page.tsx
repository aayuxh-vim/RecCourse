'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BookOpen, Users, ExternalLink, FileText, Star, Clock, Award, ArrowUpRight } from 'lucide-react';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  syllabusUrl: string | null;
  courseUrl: string | null;
  courseType: string | null;
  rating: number | null;
  reviewCount: number | null;
  duration: string | null;
  prerequisites: string | null;
  published: boolean;
  isEnrolled: boolean;
  faculty: { id: string; name: string; bio: string | null } | null;
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

interface Paper {
  id: string;
  paperId: string;
  title: string;
  authors: string;
  abstract: string | null;
  url: string;
  source: string;
  citationCount: number;
  year: number | null;
}

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [papersLoading, setPapersLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'papers' | 'broadcasts'>('overview');

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/courses/${courseId}`);
      if (res.ok) {
        setCourse(await res.json());
      }
      setLoading(false);
    }
    load();
  }, [courseId]);

  async function loadPapers() {
    if (papers.length > 0) return;
    setPapersLoading(true);
    const res = await fetch(`/api/papers?courseId=${courseId}`);
    if (res.ok) {
      setPapers(await res.json());
    }
    setPapersLoading(false);
  }

  async function handleEnroll() {
    setEnrolling(true);
    const action = course?.isEnrolled ? 'unenroll' : 'enroll';
    const res = await fetch('/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId, action }),
    });
    if (res.ok) {
      setCourse((prev) => prev ? { ...prev, isEnrolled: !prev.isEnrolled } : null);
    }
    setEnrolling(false);
  }

  useEffect(() => {
    if (activeTab === 'papers') {
      loadPapers();
    }
  }, [activeTab]);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '40px', width: '400px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '200px', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '300px' }} />
      </div>
    );
  }

  if (!course) {
    return <div className="empty-state"><h3>Course not found</h3></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div>
          <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
            <span className="badge badge-cyan">
              {course.category}
            </span>
            {course.courseType && (
              <span className={`badge ${course.courseType === 'free' ? 'badge-green' : course.courseType === 'nanodegree' ? 'badge-violet' : 'badge-amber'}`}>
                {course.courseType}
              </span>
            )}
          </div>
          <h1 className="page-title">{course.title}</h1>
          <p className="page-subtitle">
            {course.faculty?.name || 'Self-paced'} / {course.difficulty}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {course.courseUrl && (
            <a
              href={course.courseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              Go to Course <ArrowUpRight size={16} />
            </a>
          )}
          <button
            className={`btn ${course.isEnrolled ? 'btn-danger' : 'btn-secondary'}`}
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? 'Processing...' : course.isEnrolled ? 'Unenroll' : 'Enroll'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4" style={{ marginBottom: '24px', fontSize: '14px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
        <span className="flex items-center gap-2">
          <Users size={16} /> {course._count.enrollments} students enrolled
        </span>
        <span className="badge badge-violet">{course.difficulty}</span>
        {course.rating && (
          <span className="flex items-center gap-1" style={{ color: 'var(--accent-amber)' }}>
            <Star size={14} fill="currentColor" /> {course.rating.toFixed(1)}
            {course.reviewCount && (
              <span style={{ color: 'var(--text-muted)', fontSize: '12px', marginLeft: '2px' }}>
                ({course.reviewCount.toLocaleString()} reviews)
              </span>
            )}
          </span>
        )}
        {course.duration && (
          <span className="flex items-center gap-1">
            <Clock size={14} /> {course.duration}
          </span>
        )}
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={`tab ${activeTab === 'papers' ? 'active' : ''}`} onClick={() => setActiveTab('papers')}>
          Research Papers
        </button>
        <button className={`tab ${activeTab === 'broadcasts' ? 'active' : ''}`} onClick={() => setActiveTab('broadcasts')}>
          Broadcasts ({course.broadcasts.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="animate-fadeIn">
          <div className="card" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>About this course</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7' }}>{course.description}</p>
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Topics & Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {course.tags.map((tag) => (
                  <span key={tag} className="badge badge-violet">{tag}</span>
                ))}
              </div>
            </div>

            {course.prerequisites && (
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  <span className="flex items-center gap-2"><Award size={16} /> Prerequisites</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{course.prerequisites}</p>
              </div>
            )}

            {course.faculty && (
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Instructor</h3>
                <p style={{ fontWeight: '500', marginBottom: '4px' }}>{course.faculty.name}</p>
                {course.faculty.bio && (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{course.faculty.bio}</p>
                )}
              </div>
            )}

            {(course.rating || course.duration || true) && (
              <div className="card">
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Course Info</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {course.rating && (
                    <div className="flex items-center gap-2">
                      <Star size={16} style={{ color: 'var(--accent-amber)' }} fill="var(--accent-amber)" />
                      <span style={{ fontWeight: '500' }}>{course.rating.toFixed(1)}</span>
                      {course.reviewCount && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                          ({course.reviewCount.toLocaleString()} reviews)
                        </span>
                      )}
                    </div>
                  )}
                  {course.duration && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} style={{ color: 'var(--accent-cyan)' }} />
                      <span>{course.duration}</span>
                    </div>
                  )}

                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Rate this course</h4>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={async () => {
                            const res = await fetch('/api/ratings', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ courseId: course.id, value: star })
                            });
                            if (res.ok) {
                              const data = await res.json();
                              setCourse(prev => prev ? { ...prev, rating: data.newRating, reviewCount: data.reviewCount } : null);
                              alert("Rating submitted!");
                            }
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            transition: 'color 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            const siblings = (e.currentTarget.parentNode as HTMLElement).childNodes;
                            siblings.forEach((s: any, idx) => {
                              if (idx < star) s.style.color = 'var(--accent-amber)';
                              else s.style.color = 'var(--text-muted)';
                            });
                          }}
                          onMouseLeave={(e) => {
                            const siblings = (e.currentTarget.parentNode as HTMLElement).childNodes;
                            siblings.forEach((s: any) => s.style.color = 'var(--text-muted)');
                          }}
                        >
                          <Star size={20} fill="currentColor" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3" style={{ marginTop: '20px' }}>
            {course.courseUrl && (
              <a
                href={course.courseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                Go to Course <ArrowUpRight size={16} />
              </a>
            )}
            {course.syllabusUrl && (
              <a
                href={course.syllabusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={16} /> View Syllabus <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}

      {activeTab === 'papers' && (
        <div className="animate-fadeIn">
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Research papers related to this course from Semantic Scholar and arXiv.
          </p>
          {papersLoading ? (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: '120px' }} />
              ))}
            </div>
          ) : papers.length === 0 ? (
            <div className="empty-state">
              <h3>No papers found</h3>
              <p>We could not find research papers related to this course at this time.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {papers.map((paper) => (
                <a
                  key={paper.id || paper.paperId}
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="paper-card"
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: '4px' }}>
                    <span className={`badge ${paper.source === 'SEMANTIC_SCHOLAR' ? 'badge-violet' : 'badge-amber'}`}>
                      {paper.source === 'SEMANTIC_SCHOLAR' ? 'Semantic Scholar' : 'arXiv'}
                    </span>
                    <ExternalLink size={14} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <h4 className="paper-title">{paper.title}</h4>
                  <p className="paper-authors">{paper.authors}</p>
                  {paper.abstract && <p className="paper-abstract">{paper.abstract}</p>}
                  <div className="paper-meta">
                    {paper.year && <span>{paper.year}</span>}
                    {paper.citationCount > 0 && <span>{paper.citationCount} citations</span>}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'broadcasts' && (
        <div className="animate-fadeIn">
          {course.broadcasts.length === 0 ? (
            <div className="empty-state">
              <h3>No broadcasts yet</h3>
              <p>The instructor has not posted any announcements for this course.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {course.broadcasts.map((broadcast) => (
                <div key={broadcast.id} className="broadcast-card">
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
                  <p className="broadcast-meta">
                    Posted by {broadcast.faculty.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
