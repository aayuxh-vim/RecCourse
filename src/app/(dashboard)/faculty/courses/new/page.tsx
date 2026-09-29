'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  'Computer Science', 'Mathematics', 'Physics', 'Biology', 'Chemistry',
  'Business', 'Engineering', 'Economics', 'Psychology', 'Philosophy',
  'Environmental Science', 'Linguistics',
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export default function CreateCoursePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [syllabusUrl, setSyllabusUrl] = useState('');
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function addTag() {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        category,
        difficulty,
        tags,
        syllabusUrl: syllabusUrl || undefined,
        published,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create course');
      setLoading(false);
      return;
    }

    const course = await res.json();
    router.push(`/faculty/courses/${course.id}`);
  }

  return (
    <div style={{ maxWidth: '640px' }}>
      <div className="page-header">
        <h1 className="page-title">Create Course</h1>
        <p className="page-subtitle">Set up a new course for your students</p>
      </div>

      {error && <div className="message message-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="course-title" className="label">Course title</label>
          <input
            id="course-title"
            type="text"
            className="input"
            placeholder="Introduction to Machine Learning"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="course-desc" className="label">Description</label>
          <textarea
            id="course-desc"
            className="input textarea"
            placeholder="A detailed description of what students will learn..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-2">
          <div className="form-group">
            <label htmlFor="course-category" className="label">Category</label>
            <select
              id="course-category"
              className="input select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="course-difficulty" className="label">Difficulty</label>
            <select
              id="course-difficulty"
              className="input select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="label">Tags</label>
          <div className="tags-input-container">
            {tags.map((tag) => (
              <span key={tag} className="tag-removable">
                {tag}
                <span className="tag-remove" onClick={() => removeTag(tag)}>x</span>
              </span>
            ))}
            <input
              type="text"
              className="tags-input"
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="syllabus-url" className="label">Syllabus URL (optional)</label>
          <input
            id="syllabus-url"
            type="url"
            className="input"
            placeholder="https://..."
            value={syllabusUrl}
            onChange={(e) => setSyllabusUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="flex items-center gap-3" style={{ cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--accent-violet)' }}
            />
            <span className="label" style={{ margin: 0 }}>Publish immediately (visible to students)</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Course'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
