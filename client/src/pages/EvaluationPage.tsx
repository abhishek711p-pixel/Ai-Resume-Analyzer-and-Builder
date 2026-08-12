import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Award, Terminal, Cpu, Layers, Sparkles, Play, ArrowRight, BookOpen, AlertTriangle } from 'lucide-react';
import { getApiUrl } from '../utils/api';

const EvaluationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Automatically logins the evaluator using the pre-seeded credentials
  const handleLaunchDemo = async () => {
    setIsLoggingIn(true);
    setErrorMsg('');
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'evaluator@pw.edu', password: 'password123' })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed. Please verify the backend is running.');
      }

      // Save credentials in client browser storage
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('email', data.user.email);
      localStorage.setItem('isAuthenticated', 'true');
      
      // Navigate to dashboard workspace
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Auto-login failed. Make sure the backend server is running and connected.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const sections = [
    {
      title: '1. Solve the Problem',
      subtitle: 'Is it useful?',
      icon: <Award size={24} color="var(--accent-primary)" />,
      bg: 'rgba(99, 102, 241, 0.08)',
      borderColor: 'rgba(99, 102, 241, 0.2)',
      points: [
        '**ATS Resurrecter:** Converts plain resumes into parser-optimized structured files.',
        '**Real-time Alignment:** Scans resumes against job descriptions to compute a mathematical ATS match score.',
        '**Dynamic Section Reordering:** Drag-and-drop hierarchy adjustments to customize resume layout flow.'
      ]
    },
    {
      title: '2. Build Quality',
      subtitle: 'Does it work well?',
      icon: <Cpu size={24} color="#10B981" />,
      bg: 'rgba(16, 185, 129, 0.08)',
      borderColor: 'rgba(16, 185, 129, 0.2)',
      points: [
        '**Automatic Local Database Fallback:** Connects to MongoDB, with auto-fallback to an isolated `mongodb-memory-server` if local MongoDB is not running (zero external dependencies required!).',
        '**Strict Routing Protection:** Integrates route guards (`ProtectedRoute`) to prevent unauthenticated access to the Builder or Tailor spaces, redirecting to the login flow and returning users back afterward.',
        '**Mobile Responsive Design:** Mutually exclusive mobile/desktop nav elements, hamburger layout drawer, and CSS viewport scale transforms.'
      ]
    },
    {
      title: '3. Creative Thinking',
      subtitle: 'What is different or better?',
      icon: <Sparkles size={24} color="#F59E0B" />,
      bg: 'rgba(245, 158, 11, 0.08)',
      borderColor: 'rgba(245, 158, 11, 0.2)',
      points: [
        '**Visual Dual-Theme System:** Instant toggling between business Professional mode (sleek gray) and GenZ neon cyberpunk theme.',
        '**AI Tech Stack Q&A Bot:** Integrated chat assistant in the footer to answer technical implementation questions about the project stack.',
        '**Contextual Keyword Injection:** Highlights exactly what keywords are missing from the resume and suggests target sections to insert them.'
      ]
    },
    {
      title: '4. Clean Code',
      subtitle: 'Can others understand it?',
      icon: <Terminal size={24} color="#06B6D4" />,
      bg: 'rgba(6, 182, 212, 0.08)',
      borderColor: 'rgba(6, 182, 212, 0.2)',
      points: [
        '**Strict TypeScript Types:** Complete end-to-end interface declarations (`IResume`, `IUser`, `ResumeData`) ensuring strict compile-time checks.',
        '**Logical Project Structure:** Separate controller layer (`authController`, `aiController`), data models, middlewares, and reusable React UI modules.',
        '**Documentation Standards:** Documented entry points (`index.ts`), routes, utility functions, and inline comments detailing complex layout states.'
      ]
    }
  ];

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '40px auto 80px auto',
      padding: '0 24px',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Title Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <span style={{
          background: 'var(--accent-glow)',
          color: 'var(--accent-primary)',
          fontSize: '0.85rem',
          fontWeight: 700,
          padding: '6px 16px',
          borderRadius: '20px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          border: '1px solid var(--accent-primary)',
          boxShadow: '0 0 15px var(--accent-glow)'
        }}>
          Evaluation Hub
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginTop: '16px', color: 'var(--text-primary)' }}>
          PW Institute of Innovation Evaluation
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '12px auto 0 auto' }}>
          This page highlights the implementation features aligned directly with the Builders Program evaluation metrics.
        </p>
      </div>

      {/* Seeding & Demo Login Callout */}
      <div style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '40px',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          background: 'var(--accent-primary)'
        }} />
        
        <BookOpen size={36} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
        
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          5. Final Demo - Launch Evaluator Sandbox
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '650px', lineHeight: 1.6, marginBottom: '20px' }}>
          To verify that the application is fully functional and connected to the database, click the button below. 
          It will instantly sign you into a pre-seeded evaluation account containing candidate <strong>Abhishek Jain's</strong> resume.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%' }}>
          <button
            onClick={handleLaunchDemo}
            disabled={isLoggingIn}
            style={{
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
              color: '#fff',
              border: 'none',
              padding: '14px 32px',
              borderRadius: '24px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: isLoggingIn ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 8px 20px var(--accent-glow)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => { if (!isLoggingIn) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
          >
            {isLoggingIn ? (
              <span>Authenticating Sandbox...</span>
            ) : (
              <>
                <Play size={18} fill="#fff" /> Launch Evaluator Demo Account <ArrowRight size={18} />
              </>
            )}
          </button>

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#ef4444',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginTop: '8px',
              background: 'rgba(239, 68, 68, 0.08)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            <span>Demo Credentials: <strong>evaluator@pw.edu</strong> / <strong>password123</strong></span>
          </div>
        </div>
      </div>

      {/* Grid of Evaluation Categories */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px'
      }}>
        {sections.map((sec, idx) => (
          <div key={idx} style={{
            background: sec.bg,
            border: `1px solid ${sec.borderColor}`,
            borderRadius: '16px',
            padding: '24px',
            transition: 'transform 0.3s, box-shadow 0.3s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                background: 'var(--bg-primary)',
                padding: '10px',
                borderRadius: '12px',
                display: 'flex',
                boxShadow: '0 4px 10px rgba(0,0,0,0.04)'
              }}>
                {sec.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {sec.title}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  {sec.subtitle}
                </span>
              </div>
            </div>

            <ul style={{
              paddingLeft: '16px',
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              lineHeight: 1.5
            }}>
              {sec.points.map((pt, pIdx) => {
                const parts = pt.split('**');
                return (
                  <li key={pIdx}>
                    {parts.map((part, partIdx) => 
                      partIdx % 2 === 1 ? <strong key={partIdx} style={{ color: 'var(--accent-primary)' }}>{part}</strong> : part
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvaluationPage;
