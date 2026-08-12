import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Zap, Upload, Target, Briefcase, Star, MousePointer2, Mail, ExternalLink } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import LaptopScrollShowcase from '../components/LaptopScrollShowcase';
import { useNavigate } from 'react-router-dom';

const templates = [
  '/templates/resume_modern.png',
  '/templates/resume_creative.png',
  '/templates/resume_corporate.png',
  '/templates/resume_tech.png',
];

const accordionData = [
  {
    title: "Senior professionals and executives",
    desc: "ResuAI is built for experienced professionals. Highlight leadership, team performance, awards, and key achievements, then use features like Improve Text to eliminate vague wording and buzzwords.",
    bullets: ["Managers", "Directors and VPs", "Senior individual contributors"],
    image: "/templates/resume_corporate.png"
  },
  {
    title: "Traditional industries",
    desc: "Built for finance, healthcare, law, and education. Ensure ATS compliance with clean, single-column formats that emphasize credentials and work history without flashy distractions.",
    bullets: ["Finance & Banking", "Healthcare Professionals", "Legal & Education"],
    image: "/templates/resume_modern.png"
  },
  {
    title: "Tech and high-growth roles",
    desc: "Stand out in a competitive tech market. Use modern, bold formats that highlight your tech stack, GitHub projects, and quantifiable impact on product metrics.",
    bullets: ["Software Engineers", "Product Managers", "UX/UI Designers"],
    image: "/templates/resume_tech.png"
  }
];

const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 1024);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* 1. HERO SECTION (Dark & Cinematic like the RevOOT reference) */}
      <section style={{
        position: 'relative',
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme === 'genz' 
          ? 'radial-gradient(circle at center, #18181b 0%, #09090b 100%)' 
          : 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
        color: '#ffffff',
        overflow: 'hidden',
        padding: '0 24px'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vw',
          height: '60vw',
          background: 'var(--accent-glow)',
          filter: 'blur(100px)',
          borderRadius: '50%',
          opacity: 0.5,
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              marginBottom: '32px',
              fontSize: '0.875rem'
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }}></span>
              Now accepting early access users
            </div>
            
            <h1 style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              marginBottom: '24px'
            }}>
              {theme === 'genz' ? (
                <>
                  {(() => {
                    let charCount = 0;
                    return "Your career story, ".split(" ").map((word, wIdx) => (
                      <span key={`w1-${wIdx}`} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                        {Array.from(word).map((letter) => {
                          const idx = charCount++;
                          return (
                            <motion.span
                              key={`l1-${idx}`}
                              initial={{ opacity: 0, y: -50, rotateX: 90, filter: "blur(15px)", scale: 1.5 }}
                              animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", scale: 1 }}
                              transition={{ duration: 1.5, delay: idx * 0.05, type: "spring", bounce: 0.5 }}
                              style={{ display: 'inline-block' }}
                            >
                              {letter}
                            </motion.span>
                          );
                        })}
                        <span>&nbsp;</span>
                      </span>
                    ));
                  })()}
                  <br/>
                  {(() => {
                    let charCount = "Your career story, ".replace(/ /g, "").length;
                    return "engineered for ".split(" ").map((word, wIdx) => (
                      <span key={`w2-${wIdx}`} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                        {Array.from(word).map((letter) => {
                          const idx = charCount++;
                          return (
                            <motion.span
                              key={`l2-${idx}`}
                              initial={{ opacity: 0, y: 50, rotateX: -90, filter: "blur(15px)", scale: 0.8 }}
                              animate={{ opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)", scale: 1 }}
                              transition={{ duration: 1.5, delay: idx * 0.05, type: "spring", bounce: 0.5 }}
                              style={{ display: 'inline-block' }}
                            >
                              {letter}
                            </motion.span>
                          );
                        })}
                        <span>&nbsp;</span>
                      </span>
                    ));
                  })()}
                  <motion.span 
                    initial={{ opacity: 0, scale: 3, filter: "blur(20px)", y: 100 }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                    transition={{ duration: 2, delay: ("Your career story, engineered for ".length) * 0.1, type: "spring", bounce: 0.7 }}
                    style={{ fontWeight: 400, color: 'var(--accent-primary)', display: 'inline-block', fontStyle: 'italic', textShadow: '0 0 40px var(--accent-primary)' }}
                  >
                    Impact.
                  </motion.span>
                </>
              ) : (
                <>Your career story, <br/>engineered for <i style={{ fontWeight: 400, color: 'var(--accent-primary)' }}>Impact.</i></>
              )}
            </h1>
            
            <p style={{
              fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
              maxWidth: '800px',
              margin: '0 auto',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.5,
              marginBottom: '32px'
            }}>
              Transform your scattered experience into a beautifully structured, ATS-optimized masterpiece that commands attention and lands the interview.
            </p>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '48px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => navigate('/create')}
                className="btn-primary" 
                style={{ 
                  background: 'var(--accent-primary)', 
                  color: theme === 'genz' ? '#000' : '#fff',
                  border: 'none', 
                  fontSize: '1.05rem',
                  padding: '12px 28px',
                  boxShadow: theme === 'genz' ? '0 0 20px var(--accent-glow)' : 'none'
                }}
              >
                Build Your Resume ⚡
              </button>
              <button 
                onClick={() => navigate('/tailor')}
                className="btn-outline" 
                style={{ 
                  color: '#fff', 
                  borderColor: 'rgba(255,255,255,0.4)',
                  fontSize: '1.05rem',
                  padding: '12px 28px'
                }}
              >
                Tailor a Resume 🎯
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              display: 'flex',
              gap: '40px',
              justifyContent: 'center',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700 }}>12K+</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Monthly earning<br/>potential unlocked</div>
            </div>
            
            {/* Divider */}
            <div style={{ width: '1px', height: '60px', background: 'rgba(255,255,255,0.2)' }} />
            
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '3rem', fontWeight: 700 }}>ATS</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Semantic AI<br/>discovery layer</div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Fade Gradient blending into next section */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '200px',
          background: `linear-gradient(to bottom, transparent, var(--bg-primary))`
        }} />
      </section>

      {/* 3D SCROLL-ANIMATED LAPTOP RESUME SHOWCASE */}
      <LaptopScrollShowcase />

      {/* 2. THE BROKEN SYSTEM SECTION (Like the 3 colored cards reference) */}
      <section className="container" style={{ padding: '100px 24px', textAlign: 'center' }}>
        <h2 className="heading-2" style={{ marginBottom: '64px', maxWidth: '800px', margin: '0 auto 64px auto' }}>
          Job applications are broken when <span style={{ fontWeight: 400 }}>ATS rejects 75% of candidates.</span>
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {/* Card 1 */}
          <motion.div 
            initial={{ opacity: 0, scale: theme === 'genz' ? 0.5 : 0.9, y: theme === 'genz' ? 100 : 50, rotate: theme === 'genz' ? -10 : 0 }}
            whileInView={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, type: theme === 'genz' ? "spring" : "tween", bounce: 0.6 }}
            whileHover={ theme === 'genz' ? { scale: 1.05, rotate: 2, y: -10, boxShadow: '0 0 30px var(--accent-primary)' } : { scale: 1.02 } }
            viewport={{ once: true, margin: "-50px" }}
            style={{
            background: theme === 'genz' ? '#3f3f46' : '#FF8F8F',
            color: theme === 'genz' ? '#fff' : '#18181b',
            padding: '48px 32px',
            borderRadius: '24px',
            textAlign: 'left',
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
          }}>
            <div style={{ background: '#fff', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
              <Briefcase size={32} color="#000" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '16px' }}>Monetize what already exists</h3>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>Your past experience becomes a hiring asset instead of sunk cost sitting idle in old PDFs.</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            initial={{ opacity: 0, scale: theme === 'genz' ? 0.5 : 0.9, y: theme === 'genz' ? 100 : 50, rotate: theme === 'genz' ? 10 : 0 }}
            whileInView={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.1, type: theme === 'genz' ? "spring" : "tween", bounce: 0.6 }}
            whileHover={ theme === 'genz' ? { scale: 1.05, rotate: -2, y: -10, boxShadow: '0 0 30px var(--accent-primary)' } : { scale: 1.02 } }
            viewport={{ once: true, margin: "-50px" }}
            style={{
            background: theme === 'genz' ? '#27272a' : '#8BA89F',
            color: theme === 'genz' ? '#fff' : '#fff',
            padding: '48px 32px',
            borderRadius: '24px',
            textAlign: 'left',
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
          }}>
            <div style={{ background: '#fff', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
              <Target size={32} color="#000" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '16px' }}>Every user is their own recruiter</h3>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>No heavy formatting flows. Real data showcased in a more trustworthy and ATS-friendly way.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            initial={{ opacity: 0, scale: theme === 'genz' ? 0.5 : 0.9, y: theme === 'genz' ? 100 : 50, rotate: theme === 'genz' ? -10 : 0 }}
            whileInView={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: theme === 'genz' ? "spring" : "tween", bounce: 0.6 }}
            whileHover={ theme === 'genz' ? { scale: 1.05, rotate: 2, y: -10, boxShadow: '0 0 30px var(--accent-primary)' } : { scale: 1.02 } }
            viewport={{ once: true, margin: "-50px" }}
            style={{
            background: theme === 'genz' ? '#18181b' : '#F6C15B',
            color: theme === 'genz' ? '#fff' : '#18181b',
            padding: '48px 32px',
            borderRadius: '24px',
            textAlign: 'left',
            boxShadow: '0 20px 40px rgba(0,0,0,0.05)'
          }}>
            <div style={{ background: '#fff', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
              <Zap size={32} color="#000" />
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '16px' }}>Interview by default</h3>
            <p style={{ opacity: 0.9, lineHeight: 1.6 }}>Higher ATS scores mean less rejection, smarter applying behavior, and stronger career storytelling.</p>
          </motion.div>
        </div>
      </section>

      {/* 3. CALCULATOR / STATS SECTION */}
      <section className="container" style={{ padding: isMobile ? '40px 16px' : '80px 24px' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: theme === 'genz' ? "spring" : "tween", bounce: 0.4 }}
          whileHover={ theme === 'genz' ? { scale: 1.02, boxShadow: '0 0 50px rgba(176, 38, 255, 0.4)' } : {}}
          viewport={{ once: true, margin: "-100px" }}
          className="glass-panel" style={{
          padding: isMobile ? '40px 20px' : '80px 40px',
          borderRadius: isMobile ? '24px' : '40px',
          textAlign: 'center',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Resume Earning Estimator
          </div>
          <h2 className="heading-1" style={{ marginBottom: '24px' }}>How much is your <br/>experience hiding?</h2>
          <p className="text-body" style={{ maxWidth: '600px', margin: '0 auto 48px auto' }}>
            Move past the fantasy. Your career has recoverable value. This simple AI analysis shows the kind of interview potential locked inside bad formatting.
          </p>
          
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: isMobile ? '32px' : '64px',
            flexWrap: 'wrap'
          }}>
            <div>
              <div style={{ fontSize: isMobile ? '3rem' : '4rem', fontWeight: 800, color: 'var(--text-primary)' }}>85<span style={{ color: 'var(--accent-primary)' }}>%</span></div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>ATS Match Score</div>
            </div>
            <div>
              <div style={{ fontSize: isMobile ? '3rem' : '4rem', fontWeight: 800, color: 'var(--text-primary)' }}>3<span style={{ color: 'var(--accent-primary)' }}>x</span></div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Interview Rate</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. THREE STEPS. NO FLUFF. */}
      <section className="container" style={{ padding: isMobile ? '60px 16px' : '100px 24px' }}>
        <div className="responsive-grid-2" style={{ display: 'grid', gap: isMobile ? '40px' : '80px', alignItems: 'center' }}>
          
          <div>
            <div style={{ display: 'inline-block', padding: '8px 16px', background: 'var(--bg-secondary)', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, marginBottom: '24px' }}>
              How it works
            </div>
            <h2 style={{ fontSize: isMobile ? '2.5rem' : '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '32px' }}>
              THREE STEPS.<br/>NO FLUFF.
            </h2>
            <p className="text-body" style={{ marginBottom: '48px', fontSize: '1.25rem' }}>
              Your experience becomes hyperlocal to the job description. Follow trending keyword requirements, explore semantic matches, and discover your true rank.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Upload size={28} color="var(--accent-primary)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>1. Upload your best pieces</h4>
                  <p className="text-body">List your experience with strong visuals, skill tags, and metrics so recruiters instantly understand what is available.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Zap size={28} color="var(--accent-primary)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>2. Get discovered locally</h4>
                  <p className="text-body">Your resume surfaces in top-level ATS discovery, creating relevance and faster trust with hiring managers.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={28} color="var(--accent-primary)" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>3. Earn while you apply</h4>
                  <p className="text-body">Approve interviews, manage offers, and keep your career moving instead of letting it die in the inbox.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Mockup (Placeholder for the big phone UI) */}
          <div style={{ 
            background: 'var(--bg-secondary)', 
            borderRadius: '40px', 
            padding: isMobile ? '24px 16px' : '40px',
            minHeight: isMobile ? '500px' : '800px',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Glowing background behind mockup */}
            <div style={{
              position: 'absolute',
              width: '300px',
              height: '300px',
              background: 'var(--accent-primary)',
              filter: 'blur(100px)',
              opacity: 0.2,
              borderRadius: '50%'
            }} />
            
            {/* The Mockup itself */}
            <div style={{
              width: '320px',
              height: '650px',
              background: 'var(--bg-primary)',
              borderRadius: '40px',
              border: '8px solid #18181b',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative',
              zIndex: 10,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Fake App Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ width: '120px', height: '24px', background: 'var(--bg-secondary)', borderRadius: '12px' }} />
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-glow)' }} />
              </div>
              
              {/* Fake Score Card */}
              <div style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)', borderRadius: '24px', padding: '24px' }}>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '8px', textTransform: 'uppercase' }}>ATS Match Score</div>
                <div style={{ display: 'flex', alignItems: 'end', gap: '8px' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>9.4</div>
                  <div style={{ color: '#059669', fontSize: '0.9rem', fontWeight: 600, paddingBottom: '6px' }}>+0.2 this week</div>
                </div>
              </div>

              {/* Fake Missing Keywords */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>Missing Keywords Found</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: '16px', fontSize: '0.8rem' }}>React</span>
                  <span style={{ padding: '6px 12px', background: 'var(--bg-secondary)', borderRadius: '16px', fontSize: '0.8rem' }}>Node.js</span>
                  <span style={{ padding: '6px 12px', background: 'var(--accent-glow)', color: 'var(--accent-primary)', borderRadius: '16px', fontSize: '0.8rem' }}>+ Add System Design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TEMPLATES SHOWCASE SECTION */}
      <section className="container" style={{ padding: '100px 24px', textAlign: 'center' }}>
        <h2 className="heading-2" style={{ marginBottom: '64px' }}>
          Pick a template and build your resume in minutes!
        </h2>
        
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', padding: '20px 0' }}>
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 25 }}
            style={{ display: 'inline-flex', gap: '32px' }}
          >
            {/* Double the array for seamless infinite looping */}
            {[...templates, ...templates, ...templates].map((src, i) => (
              <div key={i} style={{
                width: '340px',
                height: '480px',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                flexShrink: 0,
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                background: 'var(--bg-secondary)',
                position: 'relative'
              }}>
                <img src={src} alt="Resume Template" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 6. TESTIMONIALS SECTION (With Abstract Blob Background) */}
      <section style={{ 
        position: 'relative', 
        padding: '120px 24px', 
        overflow: 'hidden',
        background: 'var(--bg-primary)'
      }}>
        {/* Abstract Blob Background */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120vw',
          height: '100%',
          background: 'radial-gradient(ellipse at center, rgba(236,72,153,0.15) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)',
          filter: 'blur(60px)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '64px', maxWidth: '600px', lineHeight: 1.2 }}>
            Trusted by executives & senior professionals
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px',
            alignItems: 'stretch'
          }}>
            {/* Review Card 1 */}
            <div className="testimonial-card">
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={20} fill="#10B981" color="#10B981" />)}
              </div>
              <p className="text-body" style={{ marginBottom: '24px', fontStyle: 'italic' }}>"Excellent practical tips for ATS optimization. Landed a senior director role within 3 weeks of rewriting my resume here."</p>
              <div style={{ fontWeight: 600 }}>— Jonathan P.</div>
            </div>

            {/* Review Card 2 */}
            <div className="testimonial-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={20} fill="#10B981" color="#10B981" />)}
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>4.9 Rating</span>
              </div>
              <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px' }}>12,400+ happy professionals shared their experience.</p>
              <div style={{ fontWeight: 600 }}>— Community Review</div>
            </div>

            {/* Review Card 3 */}
            <div className="testimonial-card">
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={20} fill="#10B981" color="#10B981" />)}
              </div>
              <p className="text-body" style={{ marginBottom: '24px', fontStyle: 'italic' }}>"Simple product to use but incredibly powerful AI insights. The keyword suggestions were spot on for tech roles."</p>
              <div style={{ fontWeight: 600 }}>— Sarah M.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ACCORDION / AUDIENCE SECTION (With Node Network styling) */}
      <section style={{ 
        padding: '120px 24px', 
        position: 'relative',
        background: 'var(--bg-secondary)',
        backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        backgroundPosition: '-19px -19px'
      }}>
        {/* Node Network decorative lines (simulated) */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: '300px',
          height: '300px',
          borderTop: '2px solid var(--accent-primary)',
          borderRight: '2px solid var(--accent-primary)',
          opacity: 0.2,
          transform: 'skew(-20deg)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '900px' }}>
          <h2 className="heading-2" style={{ fontWeight: 800, textAlign: 'center', marginBottom: '48px', backgroundColor: 'var(--bg-secondary)', display: 'inline-block', padding: '0 24px', left: '50%', transform: 'translateX(-50%)', position: 'relative' }}>
            Built for professionals in every field
          </h2>

          <div className="responsive-grid-2" style={{ 
            display: 'grid', 
            gap: '24px',
            alignItems: 'stretch'
          }}>
            {/* Senior Professionals - Large Card spanning full width on desktop */}
            <motion.div 
              whileHover={{ y: -5 }}
              style={{ 
                gridColumn: '1 / -1',
                background: 'var(--bg-primary)',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                padding: '40px',
                display: 'flex',
                gap: '40px',
                alignItems: 'center',
                flexWrap: 'wrap',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ flex: '1 1 300px' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
                  {accordionData[0].title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6, fontSize: '1.1rem' }}>
                  {accordionData[0].desc}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {accordionData[0].bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                      <CheckCircle size={20} color="var(--accent-primary)" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{ flex: '1 1 300px', height: '350px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <img src={accordionData[0].image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              </div>
            </motion.div>

            {/* Traditional Industries - Half Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              style={{ 
                background: 'var(--bg-primary)',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ height: '240px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <img src={accordionData[1].image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>{accordionData[1].title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>{accordionData[1].desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {accordionData[1].bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                      <CheckCircle size={20} color="var(--accent-primary)" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Tech Roles - Half Card */}
            <motion.div 
              whileHover={{ y: -5 }}
              style={{ 
                background: 'var(--bg-primary)',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                padding: '40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ height: '240px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                <img src={accordionData[2].image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>{accordionData[2].title}</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>{accordionData[2].desc}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {accordionData[2].bullets.map((b, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500 }}>
                      <CheckCircle size={20} color="var(--accent-primary)" /> {b}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. SUPPORT / CTA SECTION (Enhancv Style) */}
      <section style={{ 
        position: 'relative', 
        padding: '160px 24px', 
        background: 'var(--bg-secondary)', 
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Background Dots */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.1,
          pointerEvents: 'none'
        }} />

        {/* Floating Elements (Background) */}
        
        {/* Left Resume */}
        <motion.div
          className="hide-on-mobile"
          initial={{ opacity: 0, x: -150, y: 0, rotate: -20 }}
          whileInView={{ opacity: 0.8, x: 0, y: ["-15px", "15px"], rotate: -8 }}
          transition={{ 
            opacity: { duration: 1.5 },
            x: { duration: 1.5, type: "spring", bounce: 0.3 },
            rotate: { duration: 1.5, type: "spring", bounce: 0.3 },
            y: { repeat: Infinity, repeatType: "reverse", duration: 4, ease: "easeInOut", delay: 1.5 } 
          }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ position: 'absolute', left: '-5%', top: '10%', width: '350px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}
        >
          <img src="/templates/resume_tech.png" alt="Resume Left" style={{ width: '100%', display: 'block' }} />
        </motion.div>

        {/* Right Resume */}
        <motion.div
          className="hide-on-mobile"
          initial={{ opacity: 0, x: 150, y: 0, rotate: 20 }}
          whileInView={{ opacity: 0.8, x: 0, y: ["15px", "-15px"], rotate: 5 }}
          transition={{ 
            opacity: { duration: 1.5 },
            x: { duration: 1.5, type: "spring", bounce: 0.3 },
            rotate: { duration: 1.5, type: "spring", bounce: 0.3 },
            y: { repeat: Infinity, repeatType: "reverse", duration: 4.5, ease: "easeInOut", delay: 1.5 } 
          }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ position: 'absolute', right: '-5%', bottom: '10%', width: '350px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}
        >
          <img src="/templates/resume_creative.png" alt="Resume Right" style={{ width: '100%', display: 'block' }} />
        </motion.div>

        {/* Top Right Coffee Cup Element (CSS Art) */}
        <motion.div
          className="hide-on-mobile"
          initial={{ opacity: 0, scale: 0, rotate: -45 }}
          whileInView={{ opacity: 1, scale: 1, rotate: [-5, 5], y: ["-10px", "10px"] }}
          transition={{ 
            opacity: { duration: 1.5 },
            scale: { duration: 1.5, type: "spring", bounce: 0.4 },
            rotate: { repeat: Infinity, repeatType: "reverse", duration: 5, ease: "easeInOut", delay: 1.5 },
            y: { repeat: Infinity, repeatType: "reverse", duration: 5, ease: "easeInOut", delay: 1.5 } 
          }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ position: 'absolute', right: '15%', top: '15%', width: '120px', height: '120px', borderRadius: '50%', background: '#fff', border: '8px solid #5C4B41', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
        >
          <div style={{ width: '80%', height: '80%', borderRadius: '50%', background: '#795C46', position: 'relative' }}>
             {/* Coffee Swirl */}
             <div style={{ position: 'absolute', width: '40%', height: '60%', border: '2px solid #5C4B41', borderRadius: '50%', top: '20%', left: '30%', opacity: 0.5 }} />
          </div>
          {/* Pen across the cup */}
          <div style={{ position: 'absolute', width: '160px', height: '12px', background: '#10B981', transform: 'rotate(-15deg)', borderRadius: '6px', top: '70%', left: '-20px', border: '2px solid #fff' }} />
        </motion.div>

        {/* Left Pointing Hand */}
        <motion.div
          className="hide-on-mobile"
          initial={{ opacity: 0, x: -100, y: 100, scale: 0.5 }}
          whileInView={{ opacity: 1, x: ["-10px", "10px"], y: ["5px", "-5px"], scale: 1 }}
          transition={{ 
            opacity: { duration: 1.2 },
            scale: { duration: 1.2, type: "spring", bounce: 0.4 },
            x: { repeat: Infinity, repeatType: "reverse", duration: 3, ease: "easeInOut", delay: 1.2 },
            y: { repeat: Infinity, repeatType: "reverse", duration: 3, ease: "easeInOut", delay: 1.2 }
          }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ position: 'absolute', left: '20%', bottom: '5%', color: '#D97757' }}
        >
           <MousePointer2 size={120} fill="#E28B6A" strokeWidth={1} style={{ transform: 'rotate(20deg)' }} />
        </motion.div>
        
        {/* Right Pointing Hand */}
        <motion.div
          className="hide-on-mobile"
          initial={{ opacity: 0, x: 100, y: 100, scale: 0.5 }}
          whileInView={{ opacity: 1, x: ["10px", "-10px"], y: ["-5px", "5px"], scale: 1 }}
          transition={{ 
            opacity: { duration: 1.2 },
            scale: { duration: 1.2, type: "spring", bounce: 0.4 },
            x: { repeat: Infinity, repeatType: "reverse", duration: 3.5, ease: "easeInOut", delay: 1.2 },
            y: { repeat: Infinity, repeatType: "reverse", duration: 3.5, ease: "easeInOut", delay: 1.2 }
          }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ position: 'absolute', right: '25%', bottom: '0%', color: '#D97757' }}
        >
           <MousePointer2 size={100} fill="#E28B6A" strokeWidth={1} style={{ transform: 'rotate(-40deg) scaleX(-1)' }} />
        </motion.div>

        {/* Central Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{
          position: 'relative',
          zIndex: 10,
          background: '#2A2C32',
          borderRadius: '24px',
          padding: isMobile ? '32px 20px' : '64px 48px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
          color: '#ffffff'
        }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 600, marginBottom: '24px' }}>
            Support that helps
          </h2>
          <p style={{ fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '24px', color: '#E5E7EB' }}>
            Stuck with something? Our team is here Monday to Friday to answer your questions and solve issues reliably.
          </p>
          <p style={{ fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '40px', color: '#E5E7EB' }}>
            No scripts. No endless loops with chatbots. Just real answers from experts who know the product.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ background: '#6366F1', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Visit Help Center <ExternalLink size={18} />
            </button>
            <button className="btn-outline" style={{ color: '#fff', borderColor: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={18} /> Contact Us
            </button>
          </div>
        </motion.div>

      </section>

    </div>
  );
};

export default LandingPage;
