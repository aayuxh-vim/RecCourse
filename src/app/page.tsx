import Link from 'next/link';
import { BookOpen, Brain, Users, FileText, Zap, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '24px 40px',
        borderBottom: '4px solid var(--accent-green)',
        background: 'var(--bg-primary)'
      }}>
        <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px', textTransform: 'uppercase', color: 'var(--accent-green)' }}>
          RecCourse_
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/login" className="btn btn-ghost" style={{ border: '2px solid transparent', fontWeight: 800 }}>LOGIN</Link>
          <Link href="/register" className="btn btn-primary" style={{ border: '2px solid var(--accent-green)', fontWeight: 800 }}>REGISTER</Link>
        </div>
      </nav>

      <main style={{ padding: '0 40px' }}>
        <section style={{ 
          display: 'grid', 
          gridTemplateColumns: '1.2fr 0.8fr', 
          minHeight: '75vh',
          borderBottom: '4px solid var(--border-primary)'
        }}>
          <div style={{ 
            padding: '80px 40px 80px 0', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center',
            borderRight: '4px solid var(--border-primary)'
          }}>
            <h1 style={{ 
              fontSize: 'clamp(4rem, 8vw, 8rem)', 
              fontWeight: '900', 
              lineHeight: '0.9', 
              textTransform: 'uppercase',
              letterSpacing: '-2px',
              margin: '0 0 40px 0'
            }}>
              SYSTEM_ <br />
              <span style={{ color: 'var(--accent-green)' }}>LEARNING</span> <br />
              UPGRADE.
            </h1>
            <p style={{ 
              fontSize: '20px', 
              fontWeight: '500', 
              maxWidth: '600px', 
              color: 'var(--text-secondary)',
              borderLeft: '4px solid var(--accent-green)',
              paddingLeft: '20px'
            }}>
              Stop scrolling blindly. RecCourse strictly aligns your trajectory with calculated course recommendations and direct academic research integration.
            </p>
          </div>
          
          <div style={{ 
            background: 'var(--accent-green)', 
            color: '#000',
            padding: '80px 60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <h2 style={{ fontSize: '48px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '24px', lineHeight: '1' }}>
              INITIATE <br/> PROTOCOL
            </h2>
            <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '40px', opacity: 0.9 }}>
              Students are matched to optimal paths. Faculty broadcast raw data directly to nodes.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Link href="/register" style={{
                background: '#000',
                color: 'var(--accent-green)',
                padding: '24px',
                fontSize: '20px',
                fontWeight: '900',
                textTransform: 'uppercase',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textDecoration: 'none'
              }}>
                CREATE ACCOUNT <ArrowRight size={28} />
              </Link>
            </div>
          </div>
        </section>

        <section style={{ padding: '80px 0' }}>
          <h2 style={{ fontSize: '64px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '40px' }}>
            CORE MODULES_
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '0',
            border: '4px solid var(--border-primary)'
          }}>
            {[
              { title: "ALGORITHMIC MATCHING", desc: "Courses are force-aligned to your specific knowledge nodes and interests.", icon: <Brain size={40} /> },
              { title: "ACADEMIC PARSING", desc: "Automated extraction of research papers from Semantic Scholar & arXiv.", icon: <FileText size={40} /> },
              { title: "DIRECT BROADCAST", desc: "Faculty inject materials and announcements straight into your feed.", icon: <Zap size={40} /> },
              { title: "CATALOG INDEX", desc: "Complete transparent index of all active learning sequences.", icon: <BookOpen size={40} /> }
            ].map((module, i) => (
              <div key={i} style={{
                padding: '40px',
                borderRight: i % 4 !== 3 ? '4px solid var(--border-primary)' : 'none',
                borderBottom: i < 2 ? '4px solid var(--border-primary)' : 'none',
                background: i % 2 === 0 ? 'var(--bg-secondary)' : 'var(--bg-primary)'
              }}>
                <div style={{ color: 'var(--accent-green)', marginBottom: '24px' }}>{module.icon}</div>
                <h3 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px' }}>
                  {module.title}
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  {module.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <footer style={{ 
        borderTop: '4px solid var(--accent-green)', 
        padding: '24px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        fontWeight: '900',
        textTransform: 'uppercase',
        color: 'var(--text-secondary)'
      }}>
        <span>REC_COURSE // v1.0</span>
        <span>STATUS: ONLINE</span>
      </footer>
    </div>
  );
}
