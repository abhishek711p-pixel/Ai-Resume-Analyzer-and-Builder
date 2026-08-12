import React, { useState, useEffect } from 'react';
import { Star, Globe, ChevronDown, Code2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface FooterProps {
  onOpenTechStack?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenTechStack }) => {
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' | 'warn' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSimulatedLink = (destination: string, message: string) => {
    setToast({ message, type: 'info' });
    if (destination && destination !== '#') {
      setTimeout(() => {
        navigate(destination);
      }, 1800);
    }
  };

  const footerLinks = {
    toolsAndFeatures: [
      { name: 'Create Resume', href: '/create', type: 'route' },
      { name: 'AI Resume Builder', href: '/create', type: 'route' },
      { name: 'ATS Resume Checker', href: '/tailor', type: 'route' },
      { name: 'One-click Resume Tailor', href: '/tailor', type: 'route' },
      { name: 'Resume Translation', href: '/create', type: 'simulated', message: 'Opening the AI Resume Builder workspace where you can translate elements!' },
      { name: 'Interview Help', href: '/tailor', type: 'simulated', message: 'Opening the AI Tailor workspace where interview helper is integrated!' },
      { name: 'Job Application Tracker', href: '/dashboard', type: 'route' },
      { name: 'Cover Letter Generator', href: '/tailor', type: 'simulated', message: 'Opening the AI Tailor workspace where Cover Letter tailoring is integrated!' },
      { name: 'Objective Generator', href: '/create', type: 'simulated', message: 'Opening the AI Resume Builder to generate objectives!' },
      { name: 'Summary Generator', href: '/create', type: 'simulated', message: 'Opening the AI Resume Builder to generate summaries!' },
      { name: 'AI Job Board', href: '/dashboard', type: 'simulated', message: 'AI Job Board features are simulated on your dashboard!' },
      { name: 'Resume Feedback', href: '/tailor', type: 'simulated', message: 'Opening the AI Tailor workspace to get feedback on your resume!' },
      { name: 'LinkedIn Resume Builder', href: '/create', type: 'simulated', message: 'Import your resume to optimize details for LinkedIn!' },
      { name: 'Chrome Extension', href: '#', type: 'simulated', message: 'Our Chrome Extension is coming soon! Feel free to build and tailor resumes here.' },
    ],
    resume: [
      { name: 'Resume Examples', href: '/create', type: 'simulated', message: 'Opening the AI Resume Builder to view example sections!' },
      { name: 'Resume Templates', href: '/create', type: 'simulated', message: 'Opening the AI Resume Builder to view active templates!' },
      { name: 'Resume Skills', href: '/create', type: 'simulated', message: 'Opening the AI Resume Builder to manage and add skills!' },
    ],
    coverLetters: [
      { name: 'Cover Letter Examples', href: '/tailor', type: 'simulated', message: 'Opening the AI Tailor workspace to view letter templates!' },
      { name: 'Cover Letter Templates', href: '/tailor', type: 'simulated', message: 'Opening the AI Tailor workspace to view letter templates!' },
      { name: 'Cover Letter Format', href: '/tailor', type: 'simulated', message: 'Opening the AI Tailor workspace to format cover letters!' },
    ],
    resources: [
      { name: 'Original Studies & Research', href: '#', type: 'simulated', message: 'Research data is integrated directly into our real-time ATS scoring models!' },
      { name: 'Help Desk', href: '#', type: 'simulated', message: 'Need help? Click the "Tech Stack & Architecture" panel for project details!' },
      { name: 'Blog', href: '#', type: 'simulated', message: 'Our official blog is launching soon. Get started with building your resume today!' },
      { name: 'Resume Help', href: '#', type: 'simulated', message: 'Interactive tips are built right into the sidebar panels in the Resume Builder!' },
      { name: 'Cover Letter Help', href: '#', type: 'simulated', message: 'Interactive tips are built right into the sidebar panels in the AI Tailor workspace!' },
      { name: 'ATS Resource Hub', href: '#', type: 'simulated', message: 'ATS keyword optimization resources are integrated into the ATS Insights drawer!' },
    ],
    compare: [
      { name: 'Best Resume Builders', href: '#', type: 'simulated', message: 'ResuAI provides advanced real-time AI tuning and dual-mode styling workspaces!' },
      { name: 'ResuAI vs Zety', href: '#', type: 'simulated', message: 'Unlike Zety, ResuAI offers a fully local in-memory DB and free AI generation tools!' },
      { name: 'ResuAI vs Canva', href: '#', type: 'simulated', message: 'Unlike Canva, ResuAI ensures 100% ATS parser compatibility with clean structured grids!' },
      { name: 'ResuAI vs Resume.io', href: '#', type: 'simulated', message: 'ResuAI offers advanced Pro & GenZ theme switches with unlimited free edits!' },
      { name: 'ResuAI vs Teal', href: '#', type: 'simulated', message: 'ResuAI provides real-time in-line AI tuning with zero monthly subscription blocks!' },
      { name: 'ResuAI vs Novoresume', href: '#', type: 'simulated', message: 'ResuAI allows instant PDF parsing and generation with single-click AI optimization!' },
      { name: 'ResuAI vs ResumeGenius', href: '#', type: 'simulated', message: 'ResuAI uses advanced Groq SDK models for smarter keyword matching suggestions!' },
      { name: 'ResuAI vs Kickresume', href: '#', type: 'simulated', message: 'ResuAI features zero paywalls for downloading your fully structured resumes!' },
    ]
  };

  const renderFooterLink = (
    link: { name: string; href: string; type: string; message?: string },
    idx: number,
    isFirstAccent: boolean = false
  ) => {
    const isAccent = isFirstAccent && idx === 0;
    const defaultColor = isAccent ? 'var(--accent-primary)' : 'var(--text-secondary)';
    
    if (link.type === 'route') {
      return (
        <Link
          key={idx}
          to={link.href}
          style={{
            color: defaultColor,
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = defaultColor}
        >
          {link.name}
        </Link>
      );
    }

    return (
      <span
        key={idx}
        onClick={() => handleSimulatedLink(link.href, link.message || '')}
        style={{
          color: defaultColor,
          textDecoration: 'none',
          fontSize: '0.9rem',
          cursor: 'pointer',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = defaultColor}
      >
        {link.name}
      </span>
    );
  };

  return (
    <footer style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)', padding: '64px 24px 32px' }}>
      <div className="container">
        {/* Top Links Section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'space-between', marginBottom: '64px' }}>
          
          {/* Tools & Features */}
          <div style={{ flex: '2 1 300px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>Tools & Features</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {footerLinks.toolsAndFeatures.map((link, idx) => renderFooterLink(link, idx, true))}
            </div>
          </div>

          {/* Resume & Cover Letters */}
          <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>Resume</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {footerLinks.resume.map((link, idx) => renderFooterLink(link, idx))}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>Cover Letters</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {footerLinks.coverLetters.map((link, idx) => renderFooterLink(link, idx))}
              </div>
            </div>
          </div>

          {/* Resources */}
          <div style={{ flex: '1 1 150px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>Resources</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span
                onClick={onOpenTechStack}
                style={{ color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Code2 size={15} /> Tech Stack & Architecture
              </span>
              {footerLinks.resources.map((link, idx) => renderFooterLink(link, idx))}
            </div>
          </div>

          {/* Compare */}
          <div style={{ flex: '1 1 150px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)' }}>Compare ResuAI</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {footerLinks.compare.map((link, idx) => renderFooterLink(link, idx))}
            </div>
          </div>
          
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'var(--border-color)', margin: '40px 0' }} />

        {/* Reviews and Language */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{ background: '#10B981', color: '#fff', borderRadius: '4px', padding: '4px', display: 'flex' }}>
                  <Star size={16} fill="#fff" strokeWidth={0} />
                </div>
              ))}
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>5,309 reviews on <span onClick={() => handleSimulatedLink('#', 'Review integration page is under development.')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Reviews.io</span></span>
          </div>

        </div>


        {/* Copyright & Social */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Made with love by people who care. <strong style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginLeft: '4px', marginRight: '4px' }}>∞</strong> © 2026. All rights reserved.
          </div>
        </div>

        {/* reCAPTCHA note */}
        <div style={{ textAlign: 'right', marginTop: '24px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          This site is protected by reCAPTCHA and the Google <span onClick={() => handleSimulatedLink('#', 'Google Privacy Policy applies.')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span> and <span onClick={() => handleSimulatedLink('#', 'Google Terms of Service apply.')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span> apply.
        </div>
      </div>

      {/* Global Interactive Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(16px)',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '380px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <span style={{ fontSize: '1.2rem' }}>✨</span>
          <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500, lineHeight: 1.4 }}>
            {toast.message}
          </div>
          <button 
            onClick={() => setToast(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '1.2rem',
              padding: '0 4px',
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      )}
    </footer>
  );
};

export default Footer;
