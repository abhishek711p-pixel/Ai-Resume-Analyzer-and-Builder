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
  const [generating, setGenerating] = useState(false);

  const handleGenerateResumeFromJD = async () => {
    if (!genJobTitle.trim() || !genJobDescription.trim()) {
      alert('Please fill out both Job Title and Job Description!');
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
          jobTitle: genJobTitle,
          jobDescription: genJobDescription
        })
      });
      
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to generate resume.');
      }
      
      if (resData.resume) {
        // Enforce Academic template by default
        const generated = {
          ...resData.resume,
          templateId: 'academic'
        };
        
        // Save generate context in state so Builder Page can display tailoring results if desired
        navigate('/create', { 
          state: { 
            resume: generated,
            atsAnalysis: null, // Clear past audits
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
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '24px',
              padding: isMobile ? '24px 16px' : '32px',
              width: '100%',
              maxWidth: '560px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles size={24} color="var(--accent-primary)" />
                  <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>AI Resume Generator</h3>
                </div>
                <button 
                  onClick={() => setShowGenerateModal(false)} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Paste the target Job Title and Description. Our AI model will construct a high-scoring, fully-completed custom resume with all required keywords pre-aligned in the Academic layout.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Target Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={genJobTitle}
                  onChange={e => setGenJobTitle(e.target.value)}
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
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Job Description</label>
                <textarea
                  rows={8}
                  placeholder="Paste the job requirements, responsibilities, and qualifications..."
                  value={genJobDescription}
                  onChange={e => setGenJobDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  disabled={generating}
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
                    opacity: generating ? 0.7 : 1
                  }}
                >
                  {generating && <Loader2 size={16} className="animate-spin" />}
                  {generating ? 'Constructing Resume...' : 'Generate Tailored Resume'}
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
