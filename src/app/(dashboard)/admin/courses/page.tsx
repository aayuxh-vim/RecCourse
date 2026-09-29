'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  published: boolean;
  faculty: { name: string } | null;
  _count: { enrollments: number };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const params = new URLSearchParams({ limit: '100' });
      if (search) params.set('search', search);

      const res = await fetch(`/api/courses?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCourses(data.courses);
      }
      setLoading(false);
    }
    load();
  }, [search]);

  async function togglePublish(courseId: string, published: boolean) {
    const res = await fetch(`/api/courses/${courseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !published }),
    });
    if (res.ok) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseId ? { ...c, published: !published } : c
        )
      );
    }
  }

  async function deleteCourse(courseId: string) {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
    if (res.ok) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Course Management</h1>
        <p className="page-subtitle">{courses.length} courses total</p>
      </div>

      <div className="search-container">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: '400px' }} />
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Instructor</th>
                <th>Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td style={{ fontWeight: '500' }}>{course.title}</td>
                  <td>
                    <span className="badge badge-cyan">{course.category}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {course.faculty?.name || 'Unassigned'}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {course._count.enrollments}
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${course.published ? 'btn-secondary' : 'btn-primary'}`}
                      onClick={() => togglePublish(course.id, course.published)}
                    >
                      {course.published ? 'Unpublish' : 'Publish'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteCourse(course.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
