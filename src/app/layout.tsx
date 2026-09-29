import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RecCourse - Intelligent Course Recommendations',
  description: 'An intelligent course recommendation and academic collaboration platform for students and faculty. Discover courses, explore research papers, and manage your academic journey.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
