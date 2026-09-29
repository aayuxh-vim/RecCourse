'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const INTEREST_OPTIONS = [
  'machine learning', 'data science', 'web development', 'algorithms',
  'databases', 'cybersecurity', 'cloud computing', 'AI', 'deep learning',
  'natural language processing', 'computer vision', 'robotics',
  'mathematics', 'statistics', 'physics', 'chemistry', 'biology',
  'economics', 'psychology', 'philosophy', 'engineering',
  'business analytics', 'finance', 'entrepreneurship',
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'FACULTY'>('STUDENT');
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function toggleInterest(interest: string) {
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, interests }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Registration failed');
      setLoading(false);
      return;
    }

    // Auto sign in after registration
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Account created but could not sign in automatically. Please sign in manually.');
      setLoading(false);
      return;
    }

    router.push(role === 'FACULTY' ? '/faculty' : '/student');
  }

  return (
    <div className="auth-container">
      <div className="auth-card animate-fadeIn" style={{ maxWidth: '520px' }}>
        <Link href="/" className="navbar-brand" style={{ display: 'block', marginBottom: '32px' }}>
          RecCourse
        </Link>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Choose your role and set up your profile</p>

        <div className="flex flex-col gap-3" style={{ marginBottom: '24px' }}>
          <button
            className="oauth-btn"
            onClick={() => signIn('google', { callbackUrl: '/student' })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
          <button
            className="oauth-btn"
            onClick={() => signIn('github', { callbackUrl: '/student' })}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="auth-divider">or register with email</div>

        {error && <div className="message message-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label">I am a</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${role === 'STUDENT' ? 'selected' : ''}`}
                onClick={() => setRole('STUDENT')}
              >
                <div className="role-option-label">Student</div>
                <div className="role-option-desc">Browse and enroll in courses</div>
              </button>
              <button
                type="button"
                className={`role-option ${role === 'FACULTY' ? 'selected' : ''}`}
                onClick={() => setRole('FACULTY')}
              >
                <div className="role-option-label">Faculty</div>
                <div className="role-option-desc">Publish courses and broadcasts</div>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-name" className="label">Full name</label>
            <input
              id="reg-name"
              type="text"
              className="input"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email" className="label">Email</label>
            <input
              id="reg-email"
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password" className="label">Password</label>
            <input
              id="reg-password"
              type="password"
              className="input"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {role === 'STUDENT' && (
            <div className="form-group">
              <label className="label">Interests (select a few to personalize recommendations)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {INTEREST_OPTIONS.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    className={`tag ${interests.includes(interest) ? 'tag-removable' : ''}`}
                    onClick={() => toggleInterest(interest)}
                    style={{ cursor: 'pointer' }}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent-violet)', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
