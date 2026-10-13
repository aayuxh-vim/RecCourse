'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen, GraduationCap, Brain, ArrowRight, Flame, Award,
  Zap, Clock, Target, CheckCircle2, Trophy, Sparkles, TrendingUp, CheckCircle
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  tags: string[];
  courseUrl?: string | null;
  _count: { enrollments: number };
  faculty: { name: string } | null;
  recommendationScore?: number;
  recommendationReason?: string;
}

interface Enrollment {
  id: string;
  status: string;
  enrolledAt?: string;
  course: Course;
}

interface StreakData {
  streak: number;
  longestStreak: number;
  lastLoginDate: string | null;
  hasCheckedInToday?: boolean;
  hoursRemaining?: number;
}

export default function StudentDashboard() {
  const [recommendations, setRecommendations] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [streakData, setStreakData] = useState<StreakData>({
    streak: 0,
    longestStreak: 0,
    lastLoginDate: null,
    hasCheckedInToday: false,
    hoursRemaining: 0,
  });
  const [streakClaimed, setStreakClaimed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  useEffect(() => {
    async function loadInitial() {
      try {
        const [recRes, enrRes, streakRes] = await Promise.all([
          fetch('/api/recommendations'),
          fetch('/api/enrollments'),
          fetch('/api/streak'),
        ]);

        if (recRes.ok) setRecommendations(await recRes.json());
        if (enrRes.ok) setEnrollments(await enrRes.json());
        if (streakRes.ok) {
          const sData = await streakRes.json();
          setStreakData(sData);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  async function handleClaimDailyStreak() {
    if (streakData.hasCheckedInToday) return;

    try {
      const res = await fetch('/api/streak', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setStreakData({
          streak: data.streak,
          longestStreak: data.longestStreak,
          lastLoginDate: data.lastLoginDate,
          hasCheckedInToday: true,
          hoursRemaining: data.hoursRemaining || 24,
        });
        if (data.updated) {
          setStreakClaimed(true);
          setTimeout(() => setStreakClaimed(false), 4000);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function handleToggleStatus(e: React.MouseEvent, courseId: string, currentStatus: string) {
    e.preventDefault();
    e.stopPropagation();
    const newAction = currentStatus === 'COMPLETED' ? 'resume' : 'complete';
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, action: newAction }),
      });
      if (res.ok) {
        setEnrollments((prev) =>
          prev.map((enr) =>
            enr.course.id === courseId
              ? { ...enr, status: newAction === 'complete' ? 'COMPLETED' : 'ACTIVE' }
              : enr
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (loading) return;
    async function fetchFilteredRecommendations() {
      setRecLoading(true);
      const res = await fetch(`/api/recommendations?difficulty=${difficultyFilter}`);
      if (res.ok) setRecommendations(await res.json());
      setRecLoading(false);
    }
    fetchFilteredRecommendations();
  }, [difficultyFilter, loading]);

  const isNewUser = enrollments.length === 0;
  const streak = streakData.streak || 0;
  const longestStreak = streakData.longestStreak || 0;

  const completedCount = enrollments.filter((e) => e.status === 'COMPLETED').length;
  const activeCount = enrollments.filter((e) => e.status === 'ACTIVE').length;

  // Real points based on streak, enrollments, and completed courses
  const points = isNewUser
    ? (streak > 0 ? streak * 50 : 0)
    : (streak * 100 + enrollments.length * 100 + completedCount * 250);

  const currentLevel = points === 0 ? 1 : Math.floor(points / 500) + 1;
  const levelProgress = points === 0 ? 0 : ((points % 500) / 500) * 100;
  const pointsRank = isNewUser ? 'Earn points to rank' : `Rank #${Math.max(1, 10 - completedCount * 2)} in Class`;

  const weeklyData = isNewUser
    ? [
        { day: 'Mon', hrs: 0, percent: 4 },
        { day: 'Tue', hrs: 0, percent: 4 },
        { day: 'Wed', hrs: 0, percent: 4 },
        { day: 'Thu', hrs: 0, percent: 4 },
        { day: 'Fri', hrs: 0, percent: 4 },
        { day: 'Sat', hrs: 0, percent: 4 },
        { day: 'Sun', hrs: 0, percent: 4 },
      ]
    : [
        { day: 'Mon', hrs: 2.0, percent: 50 },
        { day: 'Tue', hrs: 3.5, percent: 80 },
        { day: 'Wed', hrs: 1.5, percent: 40 },
        { day: 'Thu', hrs: 4.0, percent: 95 },
        { day: 'Fri', hrs: 2.0, percent: 50 },
        { day: 'Sat', hrs: 3.0, percent: 70 },
        { day: 'Sun', hrs: 1.0, percent: 25 },
      ];

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="skeleton" style={{ width: '220px', height: '32px', marginBottom: '8px' }} />
          <div className="skeleton" style={{ width: '320px', height: '20px' }} />
        </div>
        <div className="grid grid-4" style={{ marginBottom: '24px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton" style={{ height: '120px' }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: '250px' }} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">Student Dashboard</h1>
          <p className="page-subtitle">Track your learning progress, stay on streak, and level up</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClaimDailyStreak}
            disabled={streakData.hasCheckedInToday}
            className="btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: streakData.hasCheckedInToday ? '#27272a' : 'var(--accent-violet)',
              borderColor: streakData.hasCheckedInToday ? '#3f3f46' : 'var(--accent-violet)',
              color: streakData.hasCheckedInToday ? '#a1a1aa' : '#ffffff',
              cursor: streakData.hasCheckedInToday ? 'not-allowed' : 'pointer',
              opacity: streakData.hasCheckedInToday ? 0.65 : 1,
              transition: 'all 0.2s ease',
            }}
            title={
              streakData.hasCheckedInToday
                ? `Already checked in today. Next check-in in ${streakData.hoursRemaining || 24} hours.`
                : 'Claim daily check-in streak bonus (+50 XP)'
            }
          >
            <Flame
              size={18}
              color={streakData.hasCheckedInToday ? '#71717a' : '#f97316'}
              fill={streakData.hasCheckedInToday ? 'none' : '#f97316'}
            />
            <span>
              {streakData.hasCheckedInToday
                ? `✓ Checked-in Today (Next in ${streakData.hoursRemaining || 24}h)`
                : 'Check-in Today (+50 XP)'}
            </span>
          </button>
        </div>
      </div>

      {streakClaimed && (
        <div className="message message-success animate-fadeIn" style={{ marginBottom: '24px' }}>
          🔥 Daily streak claimed! You gained +50 XP. The check-in button is now locked for the next 24 hours.
        </div>
      )}

      {/* Motivation & Streak Loyalty Banner */}
      <div
        className="card"
        style={{
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)',
          borderColor: 'var(--accent-violet)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '20px' }}>
          <div className="flex items-center gap-4">
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                background: streak > 0 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: streak > 0 ? '#f97316' : 'var(--text-muted)',
              }}
            >
              <Flame size={36} fill={streak > 0 ? 'currentColor' : 'none'} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 style={{ fontSize: '20px', fontWeight: '700' }}>
                  {streak > 0 ? `${streak} Day Study Streak!` : 'Start Your Learning Streak'}
                </h3>
                {longestStreak > 0 && (
                  <span className="badge badge-amber" style={{ fontSize: '11px' }}>
                    Record: {longestStreak} days
                  </span>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
                {streak > 0
                  ? 'Consistency is key! Complete at least 1 lesson every day to earn bonus loyalty multiplier.'
                  : 'Check in daily and enroll in courses to build your learning habit and earn loyalty XP.'}
              </p>
            </div>
          </div>

          <div style={{ minWidth: '220px' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Level {currentLevel} Scholar
              </span>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--accent-cyan)' }}>
                {points} XP
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${levelProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #6366f1, #10b981)',
                  borderRadius: '4px',
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
              {Math.round(500 - (points % 500))} XP to Level {currentLevel + 1}
            </div>
          </div>
        </div>
      </div>

      {/* Real Learning Stats Grid */}
      <div className="grid grid-4" style={{ marginBottom: '32px' }}>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-violet)' }}><GraduationCap size={22} /></div>
            <div>
              <div className="stat-value">{enrollments.length}</div>
              <div className="stat-label">Enrolled Courses</div>
              <div style={{ fontSize: '11px', color: isNewUser ? 'var(--text-muted)' : 'var(--accent-green)', marginTop: '2px' }}>
                {isNewUser ? 'No enrollments yet' : 'In your curriculum'}
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-cyan)' }}><Clock size={22} /></div>
            <div>
              <div className="stat-value">{activeCount}</div>
              <div className="stat-label">In Progress</div>
              <div style={{ fontSize: '11px', color: isNewUser ? 'var(--text-muted)' : 'var(--accent-cyan)', marginTop: '2px' }}>
                {isNewUser ? 'Start a course' : 'Currently learning'}
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-green)' }}><CheckCircle2 size={22} /></div>
            <div>
              <div className="stat-value">{completedCount}</div>
              <div className="stat-label">Completed Courses</div>
              <div style={{ fontSize: '11px', color: isNewUser ? 'var(--text-muted)' : 'var(--accent-green)', marginTop: '2px' }}>
                {enrollments.length > 0 ? `${Math.round((completedCount / enrollments.length) * 100)}% completed` : '0 completed so far'}
              </div>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div style={{ color: 'var(--accent-amber)' }}><Trophy size={22} /></div>
            <div>
              <div className="stat-value">{points}</div>
              <div className="stat-label">Loyalty XP Points</div>
              <div style={{ fontSize: '11px', color: 'var(--accent-amber)', marginTop: '2px' }}>
                {pointsRank}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Learning Activity & Badges Row */}
      <div className="grid grid-2" style={{ marginBottom: '36px' }}>
        {/* Weekly Study Activity Chart */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <div className="flex items-center gap-2">
              <TrendingUp size={18} color="var(--accent-violet)" />
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Weekly Study Activity</h3>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Target: 15 hrs/wk</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {isNewUser
              ? 'No study activity recorded this week yet. Enroll in a course to start tracking your daily study sessions.'
              : `Active learning schedule across ${activeCount} in-progress courses.`}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '120px',
              paddingTop: '10px',
              gap: '8px',
            }}
          >
            {weeklyData.map((d, idx) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{d.hrs}h</span>
                <div
                  style={{
                    width: '100%',
                    maxWidth: '32px',
                    height: `${d.percent}%`,
                    minHeight: '4px',
                    background: isNewUser
                      ? 'rgba(255, 255, 255, 0.05)'
                      : idx === 3 ? 'var(--accent-violet)' : 'rgba(99, 102, 241, 0.35)',
                    borderRadius: '4px',
                    transition: 'all 0.3s ease',
                  }}
                  title={`${d.day}: ${d.hrs} hours`}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '500' }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Motivation & Achievement Badges */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
            <div className="flex items-center gap-2">
              <Award size={18} color="var(--accent-amber)" />
              <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Badges & Achievements</h3>
            </div>
            <span className={`badge ${completedCount > 0 ? 'badge-green' : 'badge-amber'}`}>
              {completedCount > 0 ? `${completedCount} Finished` : 'Learning'}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3" style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)' }}>
              <div style={{ fontSize: '24px' }}>🔥</div>
              <div style={{ flex: 1 }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>Streak Champion</span>
                  <span className={`badge ${streak >= 3 ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '10px' }}>
                    {streak >= 3 ? 'Unlocked' : `${streak}/3 days`}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Log in 3 consecutive days to ignite your streak</p>
              </div>
            </div>

            <div className="flex items-center gap-3" style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)' }}>
              <div style={{ fontSize: '24px' }}>⚡</div>
              <div style={{ flex: 1 }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>Course Pioneer</span>
                  <span className={`badge ${enrollments.length >= 1 ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '10px' }}>
                    {enrollments.length >= 1 ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {enrollments.length >= 1 ? 'Enrolled in your first course!' : 'Enroll in your first course to unlock'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3" style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)' }}>
              <div style={{ fontSize: '24px' }}>🏆</div>
              <div style={{ flex: 1 }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>Course Finisher</span>
                  <span className={`badge ${completedCount >= 1 ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '10px' }}>
                    {completedCount >= 1 ? `${completedCount} Completed` : 'Locked'}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {completedCount >= 1 ? 'Marked course as completed!' : 'Finish a course and mark it completed'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended for You Section */}
      {recommendations.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
            <div className="flex items-center gap-4">
              <h2 style={{ fontSize: '20px', fontWeight: '600' }}>Recommended for you</h2>
              <select
                className="input select"
                style={{ padding: '4px 32px 4px 10px', width: 'auto', fontSize: '13px' }}
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

      {/* Your Courses Section (Honest Status & Real Completion Toggle) */}
      {enrollments.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Your Courses</h2>
          <div className="grid grid-3">
            {enrollments.map((enrollment) => {
              const isCompleted = enrollment.status === 'COMPLETED';
              return (
                <Link key={enrollment.id} href={`/student/courses/${enrollment.course.id}`}>
                  <div className="course-card">
                    <div className="course-card-header">
                      <span className="course-card-category">{enrollment.course.category}</span>
                      {enrollment.enrolledAt && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="course-card-body">
                      <h3 className="course-card-title">{enrollment.course.title}</h3>
                      
                      <div className="flex items-center justify-between" style={{ marginTop: '12px', marginBottom: '16px' }}>
                        <span className={`badge ${isCompleted ? 'badge-green' : 'badge-cyan'}`}>
                          {isCompleted ? '✓ Completed' : 'In Progress'}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {enrollment.course.faculty?.name || 'Self-paced'}
                        </span>
                      </div>

                      {/* Real Action: Mark as Completed / In Progress */}
                      <button
                        onClick={(e) => handleToggleStatus(e, enrollment.course.id, enrollment.status)}
                        className={`btn btn-sm ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                        style={{
                          width: '100%',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        {isCompleted ? (
                          'Mark as In Progress'
                        ) : (
                          <>
                            <CheckCircle size={14} /> Mark as Completed
                          </>
                        )}
                      </button>
                    </div>
                    <div className="course-card-footer">
                      <span>{enrollment.course.difficulty}</span>
                      <span style={{ color: 'var(--accent-violet)', fontSize: '12px' }}>
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {enrollments.length === 0 && recommendations.length === 0 && (
        <div className="empty-state">
          <BookOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <h3>No courses yet</h3>
          <p>Browse the course catalog to find courses that interest you and start your streak!</p>
          <Link href="/student/courses" className="btn btn-primary" style={{ marginTop: '16px' }}>
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
}
