'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Star, Clock, ExternalLink } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  tags: string[];
  courseUrl: string | null;
  courseType: string | null;
  rating: number | null;
  reviewCount: number | null;
  duration: string | null;
  faculty: { name: string } | null;
  _count: { enrollments: number };
}

const CATEGORIES = [
  'All',
  'Data Science',
  'Machine Learning & AI',
  'Web Development',
  'Mobile Development',
  'Cloud & DevOps',
  'Cybersecurity',
  'Programming',
  'Product & Design',
  'Marketing',
  'Business',
  'Robotics & Autonomous Systems',
  'Blockchain',
  'Computer Science',
];

export default function CourseCatalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams({ page: page.toString(), limit: '12' });
      if (search) params.set('search', search);
      if (category !== 'All') params.set('category', category);

      const res = await fetch(`/api/courses?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
        setTotalPages(data.totalPages);
      }
      setLoading(false);
    }
    load();
  }, [search, category, page]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Course Catalog</h1>
        <p className="page-subtitle">Browse and enroll in courses across departments</p>
      </div>

      <div className="search-container">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input search-input"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setCategory(cat); setPage(1); }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton" style={{ height: '280px' }} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <h3>No courses found</h3>
          <p>Try a different search term or category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-3">
            {courses.map((course) => (
              <Link key={course.id} href={`/student/courses/${course.id}`}>
                <div className="course-card animate-fadeIn">
                  <div className="course-card-header">
                    <span className="course-card-category">{course.category}</span>
                    {course.courseType && (
                      <span className={`badge ${course.courseType === 'free' ? 'badge-green' : course.courseType === 'nanodegree' ? 'badge-violet' : 'badge-amber'}`}
                        style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {course.courseType}
                      </span>
                    )}
                  </div>
                  <div className="course-card-body">
                    <h3 className="course-card-title">{course.title}</h3>
                    <p className="course-card-desc">{course.description}</p>
                    <div className="course-card-tags">
                      {course.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="course-card-footer">
                    <div className="flex items-center gap-2">
                      {course.rating && (
                        <span className="flex items-center gap-1" style={{ color: 'var(--accent-amber)' }}>
                          <Star size={12} fill="currentColor" /> {course.rating.toFixed(1)}
                        </span>
                      )}
                      {course.duration && (
                        <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          <Clock size={11} /> {course.duration}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: '12px' }}>{course._count.enrollments} enrolled</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between" style={{ marginTop: '32px' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </button>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
