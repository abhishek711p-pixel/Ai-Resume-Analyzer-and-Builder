import React, { useState, useEffect } from 'react';
import { FileText, Calendar, FilePlus2, FileEdit, Sparkles, ChevronRight, Upload, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getApiUrl } from '../utils/api';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isGenz = theme === 'genz';

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Profile Settings state
  const [profileUsername, setProfileUsername] = useState(localStorage.getItem('username') || '');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileFullName, setProfileFullName] = useState('');
  const [profileLocation, setProfileLocation] = useState('');
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsUsername, setSettingsUsername] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsFullName, setSettingsFullName] = useState('');
  const [settingsLocation, setSettingsLocation] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const openSettingsModal = () => {
    setSettingsUsername(profileUsername);
    setSettingsEmail(profileEmail);
    setSettingsFullName(profileFullName);
    setSettingsLocation(profileLocation);
    setSettingsPassword('');
    setShowSettingsModal(true);
  };

  const handleUpdateProfile = async () => {
    if (!settingsUsername.trim() || !settingsEmail.trim()) {
      alert('Username and Email are required.');
      return;
    }
    setUpdatingProfile(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/auth/update-profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: settingsUsername,
          email: settingsEmail,
          fullName: settingsFullName,
          location: settingsLocation,
          password: settingsPassword || undefined
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      localStorage.setItem('username', data.user.username);
      setProfileUsername(data.user.username);
      setProfileEmail(data.user.email);
      setProfileFullName(data.user.fullName || '');
      setProfileLocation(data.user.location || '');
      
      setShowSettingsModal(false);
      alert('Profile updated successfully!');
    } catch (err: any) {
      alert(err.message || 'An error occurred during profile update.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Generate AI Resume state
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genJobTitle, setGenJobTitle] = useState('');
  const [genJobDescription, setGenJobDescription] = useState('');
  const [genLevel, setGenLevel] = useState<'entry' | 'mid' | 'senior'>('mid');
  const [genKeySkills, setGenKeySkills] = useState('');
  const [generating, setGenerating] = useState(false);

  const rolePresets = [
    {
      title: 'Full Stack Software Engineer',
      skills: 'TypeScript, React 19, Node.js, Next.js, PostgreSQL, Docker, AWS',
      desc: 'Looking for a Full Stack Engineer to architect high-throughput microservices, design scalable React/Next.js client applications, optimize database queries, and automate CI/CD release pipelines.'
    },
    {
      title: 'Frontend React Developer',
      skills: 'React 19, TypeScript, Tailwind CSS, Next.js, Redux/Zustand, WebSockets, Jest',
      desc: 'Seeking a Frontend Engineer to build responsive, accessible, high-performance web applications. Expertise in state management, Core Web Vitals optimization, and modern component systems required.'
    },
    {
      title: 'Backend Node / Cloud Engineer',
      skills: 'Node.js, Express, TypeScript, Redis, PostgreSQL, Docker, Kubernetes, AWS',
      desc: 'Seeking a Backend Engineer to design RESTful & GraphQL microservices, implement distributed Redis caching, optimize relational schema queries, and manage containerized cloud workloads.'
    },
    {
      title: 'Data Analyst & BI Specialist',
      skills: 'SQL, Python, PostgreSQL, Snowflake, dbt, Tableau, PowerBI, ETL',
      desc: 'Seeking a Data Analyst to build automated ETL pipelines, design executive business intelligence dashboards in Tableau/PowerBI, and translate complex data sets into actionable revenue optimizations.'
    },
    {
      title: 'Technical SEO Specialist',
      skills: 'Technical SEO, Google Search Console, Google Analytics 4, Core Web Vitals, HTML5 Semantic Markup, Keyword Strategy',
      desc: 'Seeking a Technical SEO Specialist to drive organic search traffic growth, audit website architecture, optimize Core Web Vitals (LCP, INP), and execute keyword clustering strategies.'
    },
    {
      title: 'DevOps & SRE Engineer',
      skills: 'AWS, Kubernetes, Docker, Terraform, GitHub Actions, Prometheus, Grafana, Linux',
      desc: 'Looking for a DevOps Engineer to maintain 99.99% system availability, automate multi-region cloud infrastructure with Terraform, and streamline CI/CD pipelines.'
    }
  ];

  const handleSelectPreset = (preset: typeof rolePresets[0]) => {
    setGenJobTitle(preset.title);
    setGenKeySkills(preset.skills);
    setGenJobDescription(preset.desc);
  };

  const handleGenerateResumeFromJD = async () => {
    if (!genJobTitle.trim() && !genJobDescription.trim()) {
      alert('Please select a role preset or provide a Job Title / Description!');
      return;
    }
    
    setGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/ai/generate-from-jd'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          jobTitle: genJobTitle || 'Full Stack Engineer',
          jobDescription: genJobDescription || genJobTitle,
          experienceLevel: genLevel,
          keySkills: genKeySkills
        })
      });
      
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to generate resume.');
      }
      
      if (resData.resume) {
        const generated = {
          ...resData.resume,
          templateId: 'academic'
        };
        
        navigate('/create', { 
          state: { 
            resume: generated,
            atsAnalysis: null,
            jobTitle: genJobTitle,
            jobDescription: genJobDescription
          } 
        });
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'An error occurred during resume generation.');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }
        
        const response = await fetch(getApiUrl('/api/resumes'), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSavedResumes(data.resumes || []);
        }
      } catch (err) {
        console.error('Failed to fetch resumes', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch(getApiUrl('/api/auth/me'), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setProfileUsername(data.user.username || '');
          setProfileEmail(data.user.email || '');
          setProfileFullName(data.user.fullName || '');
          setProfileLocation(data.user.location || '');
        }
      } catch (err) {
        console.error('Failed to fetch profile info', err);
      }
    };
    
    fetchResumes();
    fetchProfile();
  }, []);
  
  const handleOpenResume = (resume: any) => {
    navigate('/create', { state: { resume } });
  };

  const handleDeleteResume = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this saved resume from your database?')) return;

    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/resumes/${id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setSavedResumes(prev => prev.filter(r => r._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete resume', err);
    } finally {
      setDeletingId(null);
    }
  };

  // Extract username from localStorage, fallback to 'Creator'
  const username = localStorage.getItem('username') || 'Creator';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, bounce: 0.4 } }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: isMobile ? '100px 16px 60px 16px' : '120px 24px 60px 24px',
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background decorations */}
      {isGenz && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: '5%',
              width: '40vw',
              height: '40vw',
              background: 'radial-gradient(circle, rgba(0,255,204,0.1) 0%, rgba(0,0,0,0) 70%)',
              filter: 'blur(80px)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '10%',
              right: '5%',
              width: '50vw',
              height: '50vw',
              background: 'radial-gradient(circle, rgba(204,0,255,0.05) 0%, rgba(0,0,0,0) 70%)',
              filter: 'blur(100px)',
              pointerEvents: 'none'
            }}
          />
        </>
      )}

      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ marginBottom: isMobile ? '36px' : '64px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                background: 'var(--bg-secondary)',
                borderRadius: '20px',
                border: '1px solid var(--border-color)',
              }}
            >
              <Sparkles size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Workspace Active</span>
            </div>
            
            <button 
              onClick={openSettingsModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: 'var(--premium-shadow)',
                backdropFilter: 'blur(10px)',
                transition: 'var(--transition-smooth)'
              }}
            >
              ⚙️ Profile Settings
            </button>
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5.5vw, 3rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            Welcome, {profileUsername || username}.
          </h1>
          {(profileFullName || profileLocation) && (
            <p style={{ fontSize: '1.1rem', color: 'var(--accent-primary)', marginBottom: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
              {profileFullName && <span>👤 {profileFullName}</span>}
              {profileLocation && <span>📍 {profileLocation}</span>}
            </p>
          )}
          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            What are we building today? Choose your path below.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: isMobile ? '20px' : '32px'
          }}
        >
          {/* Card 1: Create New */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => navigate('/create')}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              padding: isMobile ? '24px 16px' : '40px',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: isMobile ? '280px' : '320px',
              boxShadow: isGenz ? '0 10px 40px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ zIndex: 2 }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}
              >
                <FilePlus2 size={32} color="var(--accent-primary)" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>
                Create ATS Resume
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Start from scratch. Build a pristine, highly-structured resume guaranteed to parse perfectly in any major ATS system.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '32px', zIndex: 2 }}>
              Start Building <ChevronRight size={18} />
            </div>

            {isGenz && (
              <motion.div
                whileHover={{ scale: 1.5, opacity: 0.15 }}
                style={{
                  position: 'absolute',
                  bottom: '-20%',
                  right: '-10%',
                  width: '200px',
                  height: '200px',
                  background: 'var(--accent-primary)',
                  filter: 'blur(50px)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}
              />
            )}
          </motion.div>

          {/* Card 2: Update Existing */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => navigate('/tailor')}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              padding: isMobile ? '24px 16px' : '40px',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: isMobile ? '280px' : '320px',
              boxShadow: isGenz ? '0 10px 40px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ zIndex: 2 }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}
              >
                <FileEdit size={32} color="var(--accent-primary)" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>
                Tailor Existing Resume
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Upload your current resume and paste a Job Description. Our AI will restructure and keyword-optimize it for that specific role.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '32px', zIndex: 2 }}>
              Start Tailoring <Upload size={18} />
            </div>

            {isGenz && (
              <motion.div
                whileHover={{ scale: 1.5, opacity: 0.15 }}
                style={{
                  position: 'absolute',
                  bottom: '-20%',
                  right: '-10%',
                  width: '200px',
                  height: '200px',
                  background: 'var(--accent-primary)',
                  filter: 'blur(50px)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}
              />
            )}
          </motion.div>

          {/* Card 3: Generate Custom AI Resume */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => setShowGenerateModal(true)}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              padding: '40px',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '320px',
              boxShadow: isGenz ? '0 10px 40px rgba(0,0,0,0.2)' : '0 10px 30px rgba(0,0,0,0.05)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ zIndex: 2 }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '24px'
                }}
              >
                <Sparkles size={32} color="var(--accent-primary)" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '12px' }}>
                AI Generate Resume
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Paste a Job Description, and our AI will build a tailored, high-scoring resume in the Academic template packed with all relevant keywords.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '32px', zIndex: 2 }}>
              Generate Resume <Sparkles size={18} />
            </div>

            {isGenz && (
              <motion.div
                whileHover={{ scale: 1.5, opacity: 0.15 }}
                style={{
                  position: 'absolute',
                  bottom: '-20%',
                  right: '-10%',
                  width: '200px',
                  height: '200px',
                  background: 'var(--accent-primary)',
                  filter: 'blur(50px)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease'
                }}
              />
            )}
          </motion.div>
        </motion.div>

        {/* Saved Resumes Section */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginTop: '64px' }}
          >
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Your Saved Resumes
            </h3>
            {savedResumes.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>You don't have any saved resumes yet. Create one to see it here!</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {savedResumes.map((resume: any) => (
                <motion.div
                  key={resume._id}
                  whileHover={{ y: -4, scale: 1.02 }}
                  onClick={() => handleOpenResume(resume)}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    position: 'relative'
                  }}
                >
                  <button
                    onClick={(e) => handleDeleteResume(e, resume._id)}
                    disabled={deletingId === resume._id}
                    title="Delete Resume"
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: deletingId === resume._id ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      borderRadius: '6px',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
                  >
                    {deletingId === resume._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingRight: '24px' }}>
                    <div style={{ padding: '10px', background: 'var(--bg-primary)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                      <FileText size={20} />
                    </div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {resume.title || 'Untitled Resume'}
                    </h4>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} /> {resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : 'Recent'}
                    </span>
                    <span style={{ fontWeight: 600, color: (resume.atsScore || 85) >= 80 ? '#059669' : '#D97706' }}>
                      {resume.atsScore || 85}% Score
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Generate AI Resume Modal */}
        {showGenerateModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            overflowY: 'auto'
          }}>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: isMobile ? '24px 16px' : '32px',
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    background: 'var(--accent-glow)',
                    padding: '8px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={22} color="var(--accent-primary)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800 }}>AI ATS Resume Builder</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Google X-Y-Z Formula • High ATS Pass Rate</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowGenerateModal(false)} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.3rem', padding: '4px' }}
                >
                  ✕
                </button>
              </div>

              {/* Role Presets */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  🎯 Quick Role Presets (Click to autofill)
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {rolePresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      style={{
                        background: genJobTitle === preset.title ? 'var(--accent-primary)' : 'var(--bg-primary)',
                        color: genJobTitle === preset.title ? '#fff' : 'var(--text-secondary)',
                        border: '1px solid var(--border-color)',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  ⚡ Seniority & Career Stage
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'entry', label: '🌱 Entry (0-2 yrs)', desc: 'Projects & Fundamentals' },
                    { id: 'mid', label: '🚀 Mid-Level (3-5 yrs)', desc: 'Scale & Latency Metrics' },
                    { id: 'senior', label: '👑 Senior / Lead (5+ yrs)', desc: 'Architecture & Mentorship' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setGenLevel(lvl.id as any)}
                      style={{
                        background: genLevel === lvl.id ? 'var(--accent-glow)' : 'var(--bg-primary)',
                        border: genLevel === lvl.id ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        color: genLevel === lvl.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        padding: '8px 10px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{lvl.label}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Job Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={genJobTitle}
                    onChange={e => setGenJobTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Priority Skills (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. React 19, TypeScript, AWS, Docker"
                    value={genKeySkills}
                    onChange={e => setGenKeySkills(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Description / Key Requirements</label>
                <textarea
                  rows={5}
                  placeholder="Paste the target job description or requirements to extract relevant keywords..."
                  value={genJobDescription}
                  onChange={e => setGenJobDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={generating}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    padding: '10px 18px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerateResumeFromJD}
                  disabled={generating}
                  style={{
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: generating ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: generating ? 0.7 : 1,
                    boxShadow: '0 4px 15px var(--accent-glow)'
                  }}
                >
                  {generating && <Loader2 size={16} className="animate-spin" />}
                  {generating ? 'Constructing Resume...' : 'Generate ATS Resume'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Settings Modal */}
        {showSettingsModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: isMobile ? '24px 16px' : '32px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.5rem' }}>⚙️</span>
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Profile Settings</h3>
                </div>
                <button 
                  onClick={() => setShowSettingsModal(false)} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={settingsFullName}
                  onChange={e => setSettingsFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={settingsLocation}
                  onChange={e => setSettingsLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Username</label>
                <input
                  type="text"
                  placeholder="Username"
                  value={settingsUsername}
                  onChange={e => setSettingsUsername(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={settingsEmail}
                  onChange={e => setSettingsEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Change Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={settingsPassword}
                  onChange={e => setSettingsPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  disabled={updatingProfile}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={updatingProfile}
                  style={{
                    background: 'var(--accent-primary)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    cursor: updatingProfile ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: updatingProfile ? 0.7 : 1
                  }}
                >
                  {updatingProfile && <Loader2 size={16} className="animate-spin" />}
                  {updatingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardPage;
