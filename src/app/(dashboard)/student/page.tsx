'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, GraduationCap, Brain, ArrowRight } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  tags: string[];
  _count: { enrollments: number };
  faculty: { name: string } | null;
  recommendationScore?: number;
  recommendationReason?: string;
}

interface Enrollment {
  id: string;
  status: string;
  course: Course;
}

export default function StudentDashboard() {
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  useEffect(() => {
    async function loadInitial() {
      const [recRes, enrRes] = await Promise.all([
        fetch('/api/recommendations'),
        fetch('/api/enrollments'),
      ]);
      if (recRes.ok) setRecommendations(await recRes.json());
      if (enrRes.ok) setEnrollments(await enrRes.json());
      setLoading(false);
    }
    loadInitial();
  }, []);

  useEffect(() => {
    if (loading) return; // Skip initial load
    async function fetchFilteredRecommendations() {
      setRecLoading(true);
      const res = await fetch(`/api/recommendations?difficulty=${difficultyFilter}`);
      if (res.ok) setRecommendations(await res.json());
      setRecLoading(false);
    }
    fetchFilteredRecommendations();
  }, [difficultyFilter, loading]);

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton" style={{ width: '200px', height: '32px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '300px', height: '20px' }} />
        </div>
        <div className="grid grid-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '200px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Your personalized learning hub</p>
      </div>

      <div className="grid grid-3" style={{ marginBottom: '40px' }}>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-violet)' }}><GraduationCap size={20} /></div>
            <div>
              <div className="stat-value">{enrollments.length}</div>
              <div className="stat-label">Enrolled courses</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-cyan)' }}><BookOpen size={20} /></div>
            <div>
              <div className="stat-value">{enrollments.filter((e) => e.status === 'ACTIVE').length}</div>
              <div className="stat-label">Active courses</div>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-amber)' }}><Brain size={20} /></div>
            <div>
              <div className="stat-value">{recommendations.length}</div>
              <div className="stat-label">Recommendations</div>
            </div>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
            <div className="flex items-center gap-4">
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Recommended for you</h2>
              <select 
                className="input" 
                style={{ padding: '4px 8px', width: 'auto', fontSize: '14px' }}
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
              >
                <option value="All">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <Link href="/student/courses" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recLoading ? (
            <div className="grid grid-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ height: '200px' }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-3">
            {recommendations.slice(0, 6).map((course) => (
              <Link key={course.id} href={`/student/courses/${course.id}`}>
                <div className="course-card">
                  <div className="course-card-header">
                    <span className="course-card-category">{course.category}</span>
                  </div>
                  <div className="course-card-body">
                    <h3 className="course-card-title">{course.title}</h3>
                    {course.recommendationReason && (
                      <p className="course-card-desc" style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>
                        {course.recommendationReason}
                      </p>
                    )}
                    <div className="course-card-tags">
                      {course.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="course-card-footer">
                    <span>{course.difficulty}</span>
                    <span>{course._count.enrollments} enrolled</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          )}
        </div>
      )}

      {enrollments.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Your courses</h2>
          <div className="grid grid-3">
            {enrollments.map((enrollment) => (
              <Link key={enrollment.id} href={`/student/courses/${enrollment.course.id}`}>
                <div className="course-card">
                  <div className="course-card-header">
                    <span className="course-card-category">{enrollment.course.category}</span>
                  </div>
                  <div className="course-card-body">
                    <h3 className="course-card-title">{enrollment.course.title}</h3>
                    <div className="flex items-center gap-2" style={{ marginTop: '8px' }}>
                      <span className={`badge ${enrollment.status === 'ACTIVE' ? 'badge-green' : 'badge-amber'}`}>
                        {enrollment.status.toLowerCase()}
                      </span>
                    </div>
                  </div>
                  <div className="course-card-footer">
                    <span>{enrollment.course.faculty?.name || 'Unknown'}</span>
                    <span>{enrollment.course.difficulty}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {enrollments.length === 0 && recommendations.length === 0 && (
        <div className="empty-state">
          <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No courses yet</h3>
          <p>Browse the course catalog to find courses that interest you.</p>
          <Link href="/student/courses" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Browse courses
          </Link>
        </div>
      )}
    </div>
  );
}
