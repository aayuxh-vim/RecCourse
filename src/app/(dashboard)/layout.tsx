'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';
import {
  LayoutDashboard, BookOpen, GraduationCap, Users, Megaphone,
  Settings, LogOut, PlusCircle, Map
} from 'lucide-react';

import { ThemeToggle } from '@/components/ThemeToggle';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;
  const userName = session?.user?.name || 'User';

  const studentLinks = [
    { href: '/student', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student/courses', label: 'Course Catalog', icon: BookOpen },
    { href: '/student/enrolled', label: 'My Classrooms', icon: Users },
    { href: '/student/learning-paths', label: 'Learning Paths', icon: Map },
  ];

  const facultyLinks = [
    { href: '/faculty', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/faculty/courses', label: 'My Courses', icon: BookOpen },
    { href: '/faculty/classrooms/new', label: 'Create Classroom', icon: PlusCircle },
    { href: '/faculty/courses/new', label: 'Create Course', icon: PlusCircle },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/courses', label: 'Courses', icon: BookOpen },
    { href: '/admin/broadcasts', label: 'Broadcasts', icon: Megaphone },
  ];

  const links = role === 'ADMIN' ? adminLinks : role === 'FACULTY' ? facultyLinks : studentLinks;

  return (
    <>
      <nav className="navbar">
        <Link href="/" className="navbar-brand">RecCourse</Link>
        <div className="navbar-user">
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {userName}
          </span>
          <span className="badge badge-violet" style={{ textTransform: 'capitalize' }}>
            {role?.toLowerCase()}
          </span>
          <ThemeToggle />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => signOut({ callbackUrl: '/' })}
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </nav>
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-label">Navigation</div>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
          <div style={{ flex: 1 }} />
          <Link href="/student" className="sidebar-link">
            <Settings size={18} />
            Settings
          </Link>
        </aside>
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}
