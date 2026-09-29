'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Star, Users } from 'lucide-react';

interface PopulatedCourse {
  courseId: string;
  order: number;
  rationale: string;
  course: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    tags: string[];
    courseType: string | null;
    rating: number | null;
    reviewCount: number | null;
    duration: string | null;
    faculty: { name: string } | null;
    _count: { enrollments: number };
  };
}

interface LearningPathDetail {
  id: string;
  goal: string;
  description: string;
  createdAt: string;
  populatedCourses: PopulatedCourse[];
}

export default function LearningPathDetailPage() {
  const params = useParams();
  const pathId = params.id as string;
  const router = useRouter();
  const [path, setPath] = useState<LearningPathDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/learning-paths/${pathId}`);
      if (res.ok) {
        setPath(await res.json());
      } else {
        router.push('/student/learning-paths');
      }
      setLoading(false);
    }
    load();
  }, [pathId, router]);

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '40px', width: '30%', marginBottom: '16px' }} />
        <div className="skeleton" style={{ height: '80px', marginBottom: '32px' }} />
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '150px' }} />)}
        </div>
      </div>
    );
  }

  if (!path) return null;

  return (
    <div>
      <Link href="/student/learning-paths" className="btn btn-ghost btn-sm" style={{ marginBottom: '20px', display: 'inline-flex', paddingLeft: 0 }}>
        <ArrowLeft size={16} /> Back to Learning Paths
      </Link>

      <div style={{ marginBottom: '40px' }}>
        <h1 className="page-title" style={{ fontSize: '28px', marginBottom: '12px' }}>{path.goal}</h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: '1.6', maxWidth: '800px' }}>
          {path.description}
        </p>
      </div>

      <div className="timeline" style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
        {/* Vertical line connecting steps */}
        <div style={{ position: 'absolute', left: '20px', top: '24px', bottom: '24px', width: '2px', backgroundColor: 'var(--border)', zIndex: 0 }} />
        
        {path.populatedCourses.map((item, index) => (
          <div key={item.courseId} style={{ display: 'flex', gap: '24px', position: 'relative', zIndex: 1 }}>
            
            {/* Step number indicator */}
            <div style={{ 
              width: '42px', height: '42px', borderRadius: '50%', 
              backgroundColor: 'var(--bg-secondary)', 
              border: '2px solid var(--accent-violet)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '18px', color: 'var(--accent-violet)',
              flexShrink: 0
            }}>
              {item.order}
            </div>

            <div className="card" style={{ flex: 1, padding: '24px' }}>
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed var(--border)' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Why this step?
                </h4>
                <p style={{ fontStyle: 'italic', color: 'var(--text)' }}>"{item.rationale}"</p>
              </div>

              <div className="flex gap-4">
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '8px' }}>
                    <span className="badge badge-cyan">{item.course.category}</span>
                    <span className="badge badge-violet">{item.course.difficulty}</span>
                    {item.course.courseType && (
                      <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)' }}>{item.course.courseType}</span>
                    )}
                  </div>
                  
                  <Link href={`/student/courses/${item.course.id}`}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: 'var(--accent-cyan)' }}>
                      {item.course.title}
                    </h3>
                  </Link>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.course.description}
                  </p>
                  
                  <div className="flex items-center gap-4" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {item.course.duration && (
                      <span className="flex items-center gap-1"><Clock size={14} /> {item.course.duration}</span>
                    )}
                    {item.course.rating && (
                      <span className="flex items-center gap-1" style={{ color: 'var(--accent-amber)' }}>
                        <Star size={14} fill="currentColor" /> {item.course.rating.toFixed(1)}
                      </span>
                    )}
                    <span className="flex items-center gap-1"><Users size={14} /> {item.course._count.enrollments}</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Link href={`/student/courses/${item.course.id}`} className="btn btn-primary">
                    View Course
                  </Link>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
