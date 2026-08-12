import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { ArrowRight, ArrowLeft, Home, User, Mail, Lock, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getApiUrl } from '../utils/api';

const API_BASE_URL = getApiUrl('/api/auth');

const AuthPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Status State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const endpoint = isLoginMode ? `${API_BASE_URL}/login` : `${API_BASE_URL}/signup`;
      const body = isLoginMode
        ? { email, password }
        : { username: username || email.split('@')[0], email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed. Please check your details.');
      }

      // Save token and user details upon successful auth
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('email', data.user.email);

      // Trigger custom storage event for live UI update across components
      window.dispatchEvent(new Event('authChange'));

      // Redirect to target path or dashboard
      const from = location.state?.from;
      if (from) {
        if (typeof from === 'string') {
          navigate(from, { replace: true });
        } else {
          navigate(from.pathname + (from.search || ''), { state: from.state, replace: true });
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'Failed to connect to authentication server.');
    } finally {
      setLoading(false);
    }
  };

  const isGenz = theme === 'genz';

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '16px' : '24px',
        background: 'var(--bg-primary)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Left Return Home Button */}
      <motion.button
        whileHover={{ x: -4 }}
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: isMobile ? '16px' : '24px',
          left: isMobile ? '16px' : '24px',
          zIndex: 30,
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
          padding: isMobile ? '8px 14px' : '10px 18px',
          borderRadius: '30px',
          fontSize: isMobile ? '0.8rem' : '0.9rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <ArrowLeft size={isMobile ? 16 : 18} />
        <span>Return Home</span>
      </motion.button>

      {/* Background Effects */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(var(--text-primary) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.05,
          pointerEvents: 'none'
        }}
      />

      {isGenz && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(0,255,204,0.15) 0%, rgba(0,0,0,0) 70%)',
            top: '-20%',
            right: '-10%',
            filter: 'blur(60px)',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Auth Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-secondary)',
          borderRadius: '24px',
          padding: isMobile ? '24px 16px' : '40px',
          marginTop: isMobile ? '64px' : '0',
          boxShadow: isGenz ? '0 0 40px rgba(0,255,204,0.1)' : '0 20px 40px rgba(0,0,0,0.05)',
          border: '1px solid var(--border-color)',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            {isGenz ? (
              <Sparkles color="var(--accent-primary)" size={28} />
            ) : (
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{ width: '12px', height: '12px', background: '#fff', borderRadius: '2px' }} />
              </div>
            )}
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              ResuAI
            </span>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {isLoginMode ? 'Welcome back' : 'Create an account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {isLoginMode ? 'Enter your credentials to access your account.' : 'Start building your ATS-optimized resume today.'}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <AnimatePresence mode="popLayout">
            {!isLoginMode && (
              <motion.div
                initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
              >
                <div style={{ position: 'relative' }}>
                  <User
                    size={20}
                    style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
                  />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLoginMode}
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) =>
                      isGenz
                        ? (e.target.style.boxShadow = '0 0 15px rgba(0,255,204,0.3)')
                        : (e.target.style.borderColor = 'var(--accent-primary)')
                    }
                    onBlur={(e) => {
                      e.target.style.boxShadow = 'none';
                      e.target.style.borderColor = 'var(--border-color)';
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ position: 'relative' }}>
            <Mail
              size={20}
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '16px 16px 16px 48px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) =>
                isGenz
                  ? (e.target.style.boxShadow = '0 0 15px rgba(0,255,204,0.3)')
                  : (e.target.style.borderColor = 'var(--accent-primary)')
              }
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = 'var(--border-color)';
              }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock
              size={20}
              style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}
            />
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '16px 16px 16px 48px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) =>
                isGenz
                  ? (e.target.style.boxShadow = '0 0 15px rgba(0,255,204,0.3)')
                  : (e.target.style.borderColor = 'var(--accent-primary)')
              }
              onBlur={(e) => {
                e.target.style.boxShadow = 'none';
                e.target.style.borderColor = 'var(--border-color)';
              }}
            />
          </div>

          {isLoginMode && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a href="#" style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </a>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              background: isGenz ? 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' : 'var(--accent-primary)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              opacity: loading ? 0.7 : 1,
              boxShadow: isGenz ? '0 0 20px rgba(0,255,204,0.4)' : 'none'
            }}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {isLoginMode ? 'Sign In' : 'Sign Up'}
                <ArrowRight size={20} />
              </>
            )}
          </motion.button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
            <span
              onClick={() => {
                setErrorMsg(null);
                setIsLoginMode(!isLoginMode);
              }}
              style={{
                color: 'var(--text-primary)',
                fontWeight: 600,
                cursor: 'pointer',
                borderBottom: '1px solid var(--accent-primary)'
              }}
            >
              {isLoginMode ? 'Sign up' : 'Sign in'}
            </span>
          </p>

          <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
            <span
              onClick={() => navigate('/')}
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <Home size={14} /> Back to Homepage
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
