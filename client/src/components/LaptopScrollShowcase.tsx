import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CheckCircle2, Sparkles, Zap, Award, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export const LaptopScrollShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Scroll progress for the sticky showcase section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });

  // 1. Title Animations (Fades gracefully as user scrolls down)
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25, 0.45], [1, 0.5, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.25, 0.45], [0, -15, -40]);
  const titleScale = useTransform(scrollYProgress, [0, 0.25, 0.45], [1, 0.95, 0.88]);

  // 2. Laptop Screen Detachment & Elevation (NO SLANT / TILT - Always 100% straight and crisp)
  const screenScale = useTransform(scrollYProgress, [0, 0.4, 0.75, 1], [0.72, 0.95, 1.15, 1.25]);
  const screenY = useTransform(scrollYProgress, [0, 0.4, 0.75, 1], [30, -10, -50, -90]);
  const screenShadow = useTransform(
    scrollYProgress,
    [0, 0.4, 0.75, 1],
    [
      '0 15px 35px rgba(0, 0, 0, 0.25)',
      '0 25px 50px rgba(0, 0, 0, 0.35)',
      '0 35px 70px rgba(37, 99, 235, 0.25)',
      '0 45px 90px rgba(0, 0, 0, 0.5)'
    ]
  );

  // 3. Laptop Keyboard Deck Animations (Retreats down & fades into background like in reference image)
  const keyboardY = useTransform(scrollYProgress, [0, 0.4, 0.75, 1], [0, 70, 150, 220]);
  const keyboardRotateX = useTransform(scrollYProgress, [0, 0.4, 0.75, 1], [35, 45, 55, 65]);
  const keyboardScale = useTransform(scrollYProgress, [0, 0.4, 0.75, 1], [0.88, 0.78, 0.68, 0.58]);
  const keyboardOpacity = useTransform(scrollYProgress, [0, 0.35, 0.7, 1], [0.95, 0.6, 0.15, 0]);

  // 4. Floating UI Overlay Badges
  const badgeOpacity = useTransform(scrollYProgress, [0.35, 0.65, 0.95], [0, 1, 1]);
  const badgeScale = useTransform(scrollYProgress, [0.35, 0.65, 0.95], [0.8, 1, 1]);

  // 5. Floating Bottom Action Bar
  const ctaOpacity = useTransform(scrollYProgress, [0.65, 0.85, 1], [0, 0.95, 1]);
  const ctaY = useTransform(scrollYProgress, [0.65, 0.85, 1], [50, 10, 0]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        height: '250vh',
        backgroundColor: theme === 'genz' ? '#050507' : '#f1f5f9',
        color: 'var(--text-primary)',
        transition: 'background-color 0.4s ease'
      }}
    >
      {/* Sticky Viewport */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          perspective: '1200px'
        }}
      >
        {/* Background Radial Glow */}
        <div
          style={{
            position: 'absolute',
            width: '70vw',
            height: '70vw',
            maxWidth: '850px',
            maxHeight: '850px',
            borderRadius: '50%',
            background: theme === 'genz'
              ? 'radial-gradient(circle, rgba(0, 255, 204, 0.12) 0%, rgba(176, 38, 255, 0.08) 50%, transparent 75%)'
              : 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, rgba(99, 102, 241, 0.10) 50%, transparent 75%)',
            filter: 'blur(90px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* 1. Header Title (Positioned comfortably above laptop) */}
        <motion.div
          style={{
            opacity: titleOpacity,
            y: titleY,
            scale: titleScale,
            textAlign: 'center',
            zIndex: 2,
            position: 'absolute',
            top: '5vh',
            padding: '0 24px'
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4.2vw, 3.2rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: theme === 'genz' ? '#ffffff' : '#0f172a'
            }}
          >
            ResuAI by <span style={{ color: 'var(--accent-primary)' }}>AI Builder</span>
          </h2>
          <p
            style={{
              marginTop: '6px',
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              fontWeight: 500
            }}
          >
            Scroll to see your resume come to life in full screen
          </p>
        </motion.div>

        {/* LAPTOP SHOWCASE WRAPPER */}
        <div
          style={{
            position: 'relative',
            width: '88%',
            maxWidth: '680px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transformStyle: 'preserve-3d',
            zIndex: 5,
            marginTop: '2vh'
          }}
        >
          {/* A. LAPTOP SCREEN (100% Straight, Non-Slanted, Elevates & Scales up on scroll) */}
          <motion.div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16 / 10.2',
              background: '#09090b',
              borderRadius: '16px',
              border: theme === 'genz' ? '3px solid #27272a' : '3px solid #1e293b',
              boxShadow: screenShadow,
              scale: screenScale,
              y: screenY,
              rotateX: 0, // ALWAYS STRAIGHT & NON-SLANTED
              zIndex: 30,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Camera Notch Top Lid Bar */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '130px',
                height: '14px',
                background: '#18181b',
                borderBottomLeftRadius: '8px',
                borderBottomRightRadius: '8px',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#09090b', border: '1px solid #3f3f46' }} />
              <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#10b981' }} />
            </div>

            {/* SCREEN VIEWPORT */}
            <div
              style={{
                width: '100%',
                height: '100%',
                background: theme === 'genz' ? '#09090b' : '#ffffff',
                color: theme === 'genz' ? '#f4f4f5' : '#0f172a',
                overflowY: 'auto',
                position: 'relative',
                fontFamily: 'Inter, sans-serif'
              }}
            >
              {/* Browser Header Bar */}
              <div
                style={{
                  height: '34px',
                  background: theme === 'genz' ? '#18181b' : '#f8fafc',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 14px',
                  justifyContent: 'space-between',
                  position: 'sticky',
                  top: 0,
                  zIndex: 40
                }}
              >
                <div style={{ display: 'flex', gap: '5px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                </div>

                <div
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    background: theme === 'genz' ? '#27272a' : '#ffffff',
                    padding: '2px 12px',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <ShieldCheck size={11} color="#10b981" /> resu.ai/preview/alex-morgan-principal-engineer
                </div>

                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    background: '#10b98122',
                    color: '#10b981',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: '1px solid #10b98144'
                  }}
                >
                  ATS Score: 98%
                </span>
              </div>

              {/* RESUME CONTENT */}
              <div style={{ padding: '20px 28px', maxWidth: '720px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '2px solid var(--border-color)', paddingBottom: '14px', marginBottom: '16px' }}>
                  <div>
                    <h1 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', color: theme === 'genz' ? '#ffffff' : '#0f172a' }}>
                      Alex Morgan
                    </h1>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '2px' }}>
                      Principal AI & Full-Stack Systems Engineer
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px', fontSize: '0.72rem', opacity: 0.85 }}>
                      <span>📍 San Francisco, CA</span>
                      <span>•</span>
                      <span>✉️ alex.morgan@dev.io</span>
                      <span>•</span>
                      <span>🌐 alexmorgan.dev</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '4px 10px', borderRadius: '14px', fontSize: '0.68rem', fontWeight: 700 }}>
                      <Award size={11} /> Executive Verified
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Updated via ResuAI</span>
                  </div>
                </div>

                {/* Summary */}
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-primary)', marginBottom: '5px' }}>
                    Executive Summary
                  </h3>
                  <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: theme === 'genz' ? '#d4d4d8' : '#334155' }}>
                    Results-driven Principal Engineer with 8+ years architecting distributed AI workflows and micro-frontend platforms serving 10M+ DAU. Recognized for reducing query latency by 45% and leading cross-functional engineering teams to ship enterprise LLM products.
                  </p>
                </div>

                {/* Core Competencies */}
                <div style={{ marginBottom: '18px' }}>
                  <h3 style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-primary)', marginBottom: '6px' }}>
                    Core Competencies & AI Skills
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {['React 19', 'TypeScript', 'Node.js', 'PyTorch & LLMs', 'Distributed Systems', 'PostgreSQL', 'GraphQL', 'Docker / Kubernetes', 'System Architecture'].map((skill, idx) => (
                      <span
                        key={idx}
                        style={{
                          padding: '3px 7px',
                          borderRadius: '5px',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          background: theme === 'genz' ? '#18181b' : '#f1f5f9',
                          border: '1px solid var(--border-color)',
                          color: theme === 'genz' ? '#e4e4e7' : '#1e293b',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <CheckCircle2 size={10} color="var(--accent-primary)" /> {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h3 style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-primary)', marginBottom: '8px' }}>
                    Work Experience
                  </h3>

                  <div style={{ marginBottom: '12px', paddingLeft: '10px', borderLeft: '2px solid var(--accent-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 700 }}>Lead AI Infrastructure Architect</h4>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, opacity: 0.7 }}>2022 — Present</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Apex Cloud Technologies • San Francisco, CA
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '0.75rem', lineHeight: 1.4, color: theme === 'genz' ? '#cbd5e1' : '#475569' }}>
                      <li style={{ marginBottom: '2px' }}>Spearheaded real-time indexing pipeline processing 25,000 requests/sec with 99.99% uptime.</li>
                      <li>Optimized vector database queries reducing search latency by 120ms across global data nodes.</li>
                    </ul>
                  </div>

                  <div style={{ paddingLeft: '10px', borderLeft: '2px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 700 }}>Senior Full-Stack Engineer</h4>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, opacity: 0.7 }}>2019 — 2022</span>
                    </div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      Scale Dynamics • Palo Alto, CA
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '0.75rem', lineHeight: 1.4, color: theme === 'genz' ? '#cbd5e1' : '#475569' }}>
                      <li>Architected customer-facing analytics dashboard generating $4.2M in net new ARR within 6 months.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* OVERLAY AI BADGES */}
              <motion.div
                style={{
                  opacity: badgeOpacity,
                  scale: badgeScale,
                  position: 'absolute',
                  top: '15%',
                  right: '3%',
                  background: 'rgba(15, 23, 42, 0.92)',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  maxWidth: '210px',
                  zIndex: 45
                }}
              >
                <div style={{ background: '#10b98122', padding: '5px', borderRadius: '6px' }}>
                  <Zap size={15} color="#10b981" />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#10b981' }}>ATS Semantic Match</div>
                  <div style={{ fontSize: '0.64rem', opacity: 0.8 }}>98% match for Tech Lead roles</div>
                </div>
              </motion.div>

              <motion.div
                style={{
                  opacity: badgeOpacity,
                  scale: badgeScale,
                  position: 'absolute',
                  bottom: '10%',
                  left: '3%',
                  background: 'rgba(15, 23, 42, 0.92)',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(37, 99, 235, 0.4)',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  maxWidth: '210px',
                  zIndex: 45
                }}
              >
                <div style={{ background: '#2563eb22', padding: '5px', borderRadius: '6px' }}>
                  <Sparkles size={15} color="#3b82f6" />
                </div>
                <div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#60a5fa' }}>AI Action Verbs</div>
                  <div style={{ fontSize: '0.64rem', opacity: 0.8 }}>Quantified impact metrics applied</div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* B. METALLIC LAPTOP KEYBOARD DECK (Pushes downward & fades out on scroll) */}
          <motion.div
            style={{
              opacity: keyboardOpacity,
              y: keyboardY,
              scale: keyboardScale,
              rotateX: keyboardRotateX,
              transformOrigin: 'top center',
              width: '104%',
              marginTop: '-4px',
              background: theme === 'genz' ? '#18181b' : '#cbd5e1',
              borderRadius: '0 0 20px 20px',
              padding: '12px 20px 20px 20px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
              border: theme === 'genz' ? '2px solid #27272a' : '2px solid #94a3b8',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Speaker Deck & Key Well */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '8px'
              }}
            >
              {/* Left Speaker */}
              <div
                style={{
                  width: '28px',
                  height: '90px',
                  backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
                  backgroundSize: '4px 4px',
                  opacity: 0.6
                }}
              />

              {/* Keyboard Grid */}
              <div
                style={{
                  flex: 1,
                  background: '#09090b',
                  borderRadius: '10px',
                  padding: '8px',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                {/* Row 1 */}
                <div style={{ display: 'flex', gap: '3px', height: '12px' }}>
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} style={{ flex: 1, background: '#18181b', borderRadius: '2px', border: '1px solid #27272a' }} />
                  ))}
                </div>
                {/* Row 2 */}
                <div style={{ display: 'flex', gap: '3px', height: '15px' }}>
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} style={{ flex: i === 0 || i === 13 ? 1.4 : 1, background: '#18181b', borderRadius: '2px', border: '1px solid #27272a' }} />
                  ))}
                </div>
                {/* Row 3 */}
                <div style={{ display: 'flex', gap: '3px', height: '15px' }}>
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} style={{ flex: i === 0 ? 1.5 : 1, background: '#18181b', borderRadius: '2px', border: '1px solid #27272a' }} />
                  ))}
                </div>
                {/* Row 4 */}
                <div style={{ display: 'flex', gap: '3px', height: '15px' }}>
                  {Array.from({ length: 13 }).map((_, i) => (
                    <div key={i} style={{ flex: i === 0 || i === 12 ? 1.8 : 1, background: '#18181b', borderRadius: '2px', border: '1px solid #27272a' }} />
                  ))}
                </div>
                {/* Row 5 */}
                <div style={{ display: 'flex', gap: '3px', height: '15px' }}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={{ flex: i === 0 || i === 11 ? 2.3 : 1, background: '#18181b', borderRadius: '2px', border: '1px solid #27272a' }} />
                  ))}
                </div>
                {/* Row 6 */}
                <div style={{ display: 'flex', gap: '3px', height: '16px' }}>
                  <div style={{ flex: 1.2, background: '#18181b', borderRadius: '2px' }} />
                  <div style={{ flex: 1, background: '#18181b', borderRadius: '2px' }} />
                  <div style={{ flex: 1.2, background: '#18181b', borderRadius: '2px' }} />
                  <div style={{ flex: 5, background: '#18181b', borderRadius: '2px', border: '1px solid #27272a' }} />
                  <div style={{ flex: 1.2, background: '#18181b', borderRadius: '2px' }} />
                  <div style={{ flex: 1, background: '#18181b', borderRadius: '2px' }} />
                  <div style={{ flex: 1.5, background: '#18181b', borderRadius: '2px' }} />
                </div>
              </div>

              {/* Right Speaker */}
              <div
                style={{
                  width: '28px',
                  height: '90px',
                  backgroundImage: 'radial-gradient(#475569 1px, transparent 1px)',
                  backgroundSize: '4px 4px',
                  opacity: 0.6
                }}
              />
            </div>

            {/* Trackpad */}
            <div
              style={{
                width: '150px',
                height: '80px',
                borderRadius: '10px',
                border: theme === 'genz' ? '1px solid #3f3f46' : '1px solid #94a3b8',
                background: theme === 'genz' ? '#27272a' : '#e2e8f0',
                marginTop: '10px',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
              }}
            />

            {/* Bottom Lip */}
            <div
              style={{
                width: '60px',
                height: '4px',
                background: theme === 'genz' ? '#09090b' : '#64748b',
                borderRadius: '0 0 5px 5px',
                marginTop: '8px'
              }}
            />
          </motion.div>
        </div>

        {/* BOTTOM ACTION FLOATING BAR */}
        <motion.div
          style={{
            opacity: ctaOpacity,
            y: ctaY,
            position: 'absolute',
            bottom: '28px',
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '10px 22px',
            borderRadius: '40px',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
            <Star size={16} fill="#f59e0b" color="#f59e0b" />
            <span>Ready to stand out? Build your ATS-optimized resume now.</span>
          </div>

          <button
            onClick={() => {
              const token = localStorage.getItem('token');
              if (token) {
                navigate('/create');
              } else {
                navigate('/auth');
              }
            }}
            className="btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Create My Resume <ArrowRight size={15} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default LaptopScrollShowcase;
