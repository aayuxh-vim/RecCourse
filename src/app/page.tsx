'use client';

import Link from 'next/link';
import { BookOpen, Brain, Users, FileText, Zap, ArrowRight, Sparkles, Code, Terminal } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* Interactive Background Glow */}
      {mounted && (
        <div 
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            pointerEvents: 'none',
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.05), transparent 40%)`,
            zIndex: 0
          }}
        />
      )}

      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '24px 40px',
        borderBottom: '1px solid rgba(16, 185, 129, 0.3)',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: '900', 
          letterSpacing: '-1px', 
          textTransform: 'uppercase', 
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{ width: '12px', height: '12px', background: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)' }}></div>
          RecCourse_
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/login" className="btn btn-ghost" style={{ border: '1px solid transparent', fontWeight: 600 }}>LOGIN</Link>
          <Link href="/register" className="btn" style={{ 
            background: 'var(--accent-green)', 
            color: '#000', 
            fontWeight: 800,
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            INITIALIZE <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      <main style={{ padding: '0 40px', position: 'relative', zIndex: 10, maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Hero Section */}
        <section style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          minHeight: '80vh',
          justifyContent: 'center',
          padding: '80px 0'
        }}>
          <div className="animate-fadeIn" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '100px', color: 'var(--accent-green)', marginBottom: '32px', fontWeight: '600', fontSize: '14px' }}>
            <Sparkles size={16} /> V2.0 PYTHON RECOMMENDATION ENGINE LIVE
          </div>
          
          <h1 style={{ 
            fontSize: 'clamp(3.5rem, 8vw, 7rem)', 
            fontWeight: '900', 
            lineHeight: '0.95', 
            textTransform: 'uppercase',
            letterSpacing: '-2px',
            margin: '0 0 32px 0',
            textShadow: '0 0 40px rgba(16, 185, 129, 0.2)'
          }}>
            INTELLIGENT <br />
            <span style={{ color: 'var(--accent-green)' }}>LEARNING</span> <br />
            TRAJECTORY.
          </h1>
          
          <p style={{ 
            fontSize: '20px', 
            fontWeight: '400', 
            maxWidth: '700px', 
            color: 'var(--text-secondary)',
            marginBottom: '48px',
            lineHeight: '1.6'
          }}>
            Stop scrolling blindly. RecCourse strictly aligns your trajectory with AI-curated learning paths, calculated course recommendations, and direct academic research integration.
          </p>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/register" style={{
              background: 'var(--text-primary)',
              color: 'var(--bg-primary)',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '800',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              border: '2px solid var(--text-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--text-primary)';
              e.currentTarget.style.color = 'var(--bg-primary)';
            }}
            >
              Start Journey <ArrowRight size={20} />
            </Link>
            <Link href="/login" style={{
              background: 'transparent',
              color: 'var(--text-primary)',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '800',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              border: '2px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-green)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
            >
              <Terminal size={20} /> Access Portal
            </Link>
          </div>
        </section>

        {/* Modules Section */}
        <section style={{ padding: '80px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
            <h2 style={{ fontSize: '48px', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1' }}>
              CORE <br/><span style={{ color: 'var(--accent-green)' }}>MODULES_</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', textAlign: 'right' }}>
              Hover over a module to initialize its parameters and view technical specifications.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px',
          }}>
            {[
              { title: "ALGORITHMIC MATCHING", desc: "Courses are force-aligned to your specific knowledge nodes and interests via our Python engine.", icon: <Brain size={32} /> },
              { title: "AI LEARNING PATHS", desc: "Enter a goal and let Gemini AI sequence a complete curriculum automatically.", icon: <Code size={32} /> },
              { title: "ACADEMIC PARSING", desc: "Automated extraction of research papers from Semantic Scholar & arXiv.", icon: <FileText size={32} /> },
              { title: "DIRECT BROADCAST", desc: "Faculty inject materials and announcements straight into your active feed.", icon: <Zap size={32} /> }
            ].map((module, i) => (
              <div 
                key={i} 
                className="interactive-card"
                style={{
                  padding: '40px 32px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'crosshair',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-8px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ color: 'var(--accent-green)', marginBottom: '24px', transition: 'transform 0.3s ease' }}>
                  {module.icon}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '0.5px' }}>
                  {module.title}
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '400', lineHeight: '1.6' }}>
                  {module.desc}
                </p>
                
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  0{i + 1}
                </div>
                <div style={{ position: 'absolute', bottom: '0', left: '0', height: '2px', width: '0%', background: 'var(--accent-green)', transition: 'width 0.4s ease' }} className="card-indicator"></div>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <footer style={{ 
        borderTop: '1px solid rgba(16, 185, 129, 0.3)', 
        padding: '32px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        fontWeight: '700',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        background: 'rgba(0,0,0,0.5)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 10px var(--accent-green)' }}></div>
          STATUS: SYSTEM ONLINE
        </div>
        <span>REC_COURSE // BUILD 2.0</span>
      </footer>

      {/* Add global styles for the new hover effects */}
      <style dangerouslySetInnerHTML={{__html: `
        .interactive-card:hover .card-indicator { width: 100% !important; }
        .interactive-card:hover > div:first-child { transform: scale(1.1); }
      `}} />
    </div>
  );
}
