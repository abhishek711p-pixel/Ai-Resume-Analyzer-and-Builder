import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Briefcase, User, LogOut, Code2, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onOpenTechStack?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenTechStack }) => {

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isAuth, setIsAuth] = useState(localStorage.getItem('isAuthenticated') === 'true');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNavbar, setShowNavbar] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
        setShowNavbar(false);
        setIsMenuOpen(false); // Close mobile drawer when scrolling down
      } else {
        setShowNavbar(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuth(localStorage.getItem('isAuthenticated') === 'true');
      setUsername(localStorage.getItem('username') || '');
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    setIsAuth(false);
    setUsername('');
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px 0',
        zIndex: 50,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--glass-border)',
        transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s, backdrop-filter 0.3s'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Brand Logo */}
        <div
          onClick={() => { navigate('/'); setIsMenuOpen(false); }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800, fontSize: '1.3rem', cursor: 'pointer' }}
        >
          {theme === 'genz' ? (
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
              <Sparkles color="var(--accent-primary)" size={26} />
            </motion.div>
          ) : (
            <Briefcase color="var(--accent-primary)" size={26} />
          )}
          <span>
            Resu<span className="text-gradient">AI</span>
          </span>
        </div>

        {/* Right Section (Desktop only via class) */}
        {!isMobile && (
          <div className="desktop-flex" style={{ alignItems: 'center', gap: '20px' }}>
          {/* Theme Selector */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              borderRadius: '30px',
              padding: '3px',
              border: '1px solid var(--border-color)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => theme !== 'professional' && toggleTheme()}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '24px',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
                fontWeight: 600,
                fontSize: '0.825rem',
                outline: 'none'
              }}
            >
              {theme === 'professional' && (
                <motion.div
                  layoutId="theme-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--text-primary)',
                    borderRadius: '24px',
                    zIndex: -1
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span
                style={{
                  position: 'relative',
                  zIndex: 2,
                  color: theme === 'professional' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  transition: 'color 0.3s ease'
                }}
              >
                💼 Pro
              </span>
            </button>

            <button
              onClick={() => theme !== 'genz' && toggleTheme()}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '24px',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
                fontWeight: 600,
                fontSize: '0.825rem',
                outline: 'none'
              }}
            >
              {theme === 'genz' && (
                <motion.div
                  layoutId="theme-pill"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--accent-primary)',
                    borderRadius: '24px',
                    zIndex: -1,
                    boxShadow: '0 0 20px rgba(0, 255, 204, 0.4)'
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <span
                style={{
                  position: 'relative',
                  zIndex: 2,
                  color: theme === 'genz' ? '#000' : 'var(--text-secondary)',
                  transition: 'color 0.3s ease'
                }}
              >
                ⚡ GenZ
              </span>
            </button>
          </div>

          {/* Auth Button State */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {isAuth ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    padding: '8px 16px',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <User size={16} color="var(--accent-primary)" /> {username || 'Dashboard'}
                </button>

                <button
                  onClick={handleLogout}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    padding: '8px 14px',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <LogOut size={14} /> Log Out
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => navigate('/auth')}>
                Get Started
              </button>
            )}
          </div>
          </div>
        )}

        {/* Mobile Menu Hamburger Button */}
        {isMobile && (
          <div className="mobile-only" style={{ zIndex: 100 }}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px'
              }}
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobile && isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(16px)',
              borderBottom: '1px solid var(--border-color)',
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              zIndex: 49,
              overflow: 'hidden'
            }}
          >
            {/* Theme Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Choose Theme</span>
              <div
                style={{
                  display: 'flex',
                  background: 'var(--bg-secondary)',
                  borderRadius: '30px',
                  padding: '3px',
                  border: '1px solid var(--border-color)',
                  width: 'fit-content'
                }}
              >
                <button
                  onClick={() => { if (theme !== 'professional') toggleTheme(); }}
                  style={{
                    background: theme === 'professional' ? 'var(--text-primary)' : 'transparent',
                    color: theme === 'professional' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  💼 Pro
                </button>
                <button
                  onClick={() => { if (theme !== 'genz') toggleTheme(); }}
                  style={{
                    background: theme === 'genz' ? 'var(--accent-primary)' : 'transparent',
                    color: theme === 'genz' ? '#000' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '24px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    boxShadow: theme === 'genz' ? '0 0 15px var(--accent-glow)' : 'none'
                  }}
                >
                  ⚡ GenZ
                </button>
              </div>
            </div>

            {/* Horizontal Divider */}
            <div style={{ height: '1px', background: 'var(--border-color)' }} />

            {/* Auth / Workspace Navigation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>


              {isAuth ? (
                <>
                  <button
                    onClick={() => { navigate('/dashboard'); setIsMenuOpen(false); }}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '12px',
                      borderRadius: '24px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <User size={18} color="var(--accent-primary)" /> {username || 'Dashboard'}
                  </button>

                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      padding: '12px',
                      borderRadius: '24px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => { navigate('/auth'); setIsMenuOpen(false); }}
                  style={{ width: '100%', padding: '12px' }}
                >
                  Get Started
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
