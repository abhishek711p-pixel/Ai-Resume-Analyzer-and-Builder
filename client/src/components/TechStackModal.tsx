import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cpu, Database, Layers, Sparkles, Send, Terminal, Check, Copy, HelpCircle, Zap, Code2 } from 'lucide-react';
import { getApiUrl } from '../utils/api';

interface TechStackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TechStackModal: React.FC<TechStackModalProps> = ({ isOpen, onClose }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const samplePrompts = [
    "What AI model powers ResuAI?",
    "Why Vite + Express over Next.js?",
    "How is MongoDB & Mongoose configured?",
    "How does PDF resume parsing work?",
    "What handles security and JWT auth?",
    "What design system and themes are used?"
  ];

  const handleAsk = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim()) return;

    setIsLoading(true);
    setAnswer(null);
    if (queryText) setQuestion(queryText);

    try {
      const response = await fetch(getApiUrl('/api/ai/tech-stack-qa'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      setAnswer(data.answer || 'No response received.');
    } catch (err) {
      console.error('Error asking tech stack QA:', err);
      setAnswer(`**ResuAI Tech Stack Overview:**\n- ⚛️ **Frontend:** React 19, TypeScript, Vite 8, Framer Motion, Lucide Icons, Custom CSS Theme Engine.\n- 🚀 **Backend:** Node.js, Express.js 5, TypeScript.\n- 💾 **Database:** MongoDB & Mongoose ORM.\n- 🧠 **AI Engine:** Groq SDK (Llama 3 8B Instant).\n- 📄 **Parsers:** \`pdf-parse\` & \`multer\`.\n- 🔒 **Security:** JWT Auth & \`bcryptjs\`.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(10px)'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            color: 'var(--text-primary)',
            position: 'relative'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <X size={18} />
          </button>

          {/* Header */}
          <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div
                style={{
                  background: 'rgba(0, 255, 204, 0.15)',
                  color: 'var(--accent-primary)',
                  padding: '10px',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Code2 size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Resu<span className="text-gradient">AI</span> Tech Stack & Architecture
                </h2>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Explore the technology stack powering this project or ask our AI assistant any technical question!
                </p>
              </div>
            </div>
          </div>

          {/* Tech Stack Cards Overview */}
          <div style={{ padding: '24px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            
            {/* Frontend */}
            <div style={{ background: 'var(--bg-primary)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--accent-primary)' }}>
                <Layers size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Frontend</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>React 19</strong> + TypeScript</li>
                <li><strong>Vite 8</strong> (Lightning fast HMR)</li>
                <li><strong>Framer Motion</strong> (Micro-animations)</li>
                <li><strong>Lucide React</strong> (Modern SVG icons)</li>
                <li><strong>Dual Theme System</strong> (Pro & GenZ mode)</li>
              </ul>
            </div>

            {/* Backend */}
            <div style={{ background: 'var(--bg-primary)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#3b82f6' }}>
                <Terminal size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Backend Server</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>Node.js</strong> + Express.js v5</li>
                <li><strong>TypeScript</strong> with <code>tsx watch</code></li>
                <li><strong>CORS & Dotenv</strong> environment isolation</li>
                <li><strong>RESTful API Architecture</strong></li>
              </ul>
            </div>

            {/* Database */}
            <div style={{ background: 'var(--bg-primary)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#10b981' }}>
                <Database size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Database & Models</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>MongoDB</strong> Document Storage</li>
                <li><strong>Mongoose ORM</strong> (Schemas & Validation)</li>
                <li><strong>MongoDB Memory Server</strong> (Isolated dev DB)</li>
              </ul>
            </div>

            {/* AI & File Processing */}
            <div style={{ background: 'var(--bg-primary)', padding: '18px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: '#a855f7' }}>
                <Cpu size={18} />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>AI Engine & Files</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li><strong>Groq SDK</strong> (Llama 3 8B Instant)</li>
                <li><strong>ATS Resume Scanner Engine</strong></li>
                <li><strong><code>pdf-parse</code></strong> PDF Text Extraction</li>
                <li><strong><code>multer</code></strong> Upload Manager</li>
              </ul>
            </div>

          </div>

          {/* Ask AI Section */}
          <div style={{ padding: '0 32px 32px' }}>
            <div style={{ background: 'var(--bg-primary)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border-color)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <Sparkles size={20} color="var(--accent-primary)" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>Ask AI About This Project's Tech Stack</h3>
              </div>

              {/* Sample Prompt Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                {samplePrompts.map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAsk(promptText)}
                    disabled={isLoading}
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      padding: '6px 12px',
                      borderRadius: '16px',
                      fontSize: '0.78rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                  >
                    <HelpCircle size={12} color="var(--accent-primary)" />
                    {promptText}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAsk();
                }}
                style={{ display: 'flex', gap: '10px', marginBottom: answer ? '16px' : '0' }}
              >
                <input
                  type="text"
                  placeholder="e.g. How does ResuAI handle AI resume auditing?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    padding: '12px 16px',
                    borderRadius: '14px',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !question.trim()}
                  style={{
                    background: 'var(--accent-primary)',
                    color: '#000',
                    border: 'none',
                    padding: '12px 20px',
                    borderRadius: '14px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: isLoading || !question.trim() ? 'not-allowed' : 'pointer',
                    opacity: isLoading || !question.trim() ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  {isLoading ? <Zap size={16} className="animate-spin" /> : <Send size={16} />}
                  {isLoading ? 'Asking...' : 'Ask AI'}
                </button>
              </form>

              {/* Answer Output */}
              {answer && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--accent-primary)',
                    borderRadius: '16px',
                    padding: '20px',
                    marginTop: '16px',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
                      <Sparkles size={14} /> AI Architect Response
                    </div>
                    <button
                      onClick={handleCopy}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem'
                      }}
                    >
                      {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div
                    style={{
                      fontSize: '0.875rem',
                      lineHeight: '1.6',
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {answer}
                  </div>
                </motion.div>
              )}

            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TechStackModal;
