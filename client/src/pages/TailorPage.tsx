import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, Upload, FileText, Sparkles, AlertTriangle, CheckCircle2, 
  ArrowRight, Target, Zap, LayoutTemplate, Palette, Plus, Download, Trash2,
  Image, X, Camera, Wand2, RefreshCw
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import type { ResumeData, ResumeStyle, TemplateId, Experience, Education } from '../types/resume';
import { parseResumeText } from '../utils/resumeParser';
import { parseResumeFile, extractTextFromFile } from '../utils/fileReader';
import { 
  enhanceBulletText, 
  enhanceProfessionalSummary,
  type ATSAnalysisResult 
} from '../utils/resumeEnhancer';
import { getApiUrl } from '../utils/api';

const sampleCurrentResumeText = `Jane Doe
Software Developer
jane.doe@example.com | (555) 123-4567 | San Francisco, CA

SUMMARY
Developer with experience building web applications. Worked on frontend and backend features using JavaScript and React.

EXPERIENCE
Software Developer | Tech Corp | 2021 - Present
- Worked on user interface for company web app using JavaScript and React.
- Responsible for fixing bugs and writing basic features.
- Assisted with database queries and backend API calls.

EDUCATION
B.S. Computer Science | UC Berkeley | 2020

SKILLS
JavaScript, React, HTML, CSS, Git`;

const sampleJobDescription = `Target Role: Senior Full Stack Engineer / Frontend Architect
Company: CloudScale AI Solutions

Job Description:
We are seeking a Senior Full Stack Engineer to lead frontend architecture and microservices integration.

Key Requirements & Responsibilities:
- 5+ years of experience with React 19, TypeScript, and modern state management.
- Proven track record architecting high-throughput REST APIs and GraphQL microservices.
- Expertise in CI/CD automation pipelines and Docker containerization.
- Experience with performance optimization, reducing page load latency by 30%+.
- Strong leadership skills to mentor junior developers and drive Agile sprints.`;

const initialStyle: ResumeStyle = {
  themeColor: '#2563EB',
  fontFamily: 'Inter, sans-serif',
  fontSize: 'medium',
  spacing: 'normal'
};

const TailorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isGenz = theme === 'genz';

  const initialAuditPayload = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('latestAtsAudit');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }, []);

  // Parsed & Analyzed User Data
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysisResult | null>(() => {
    return location.state?.atsAnalysis || initialAuditPayload?.atsAnalysis || null;
  });

  const [userResumeData, setUserResumeData] = useState<ResumeData | null>(() => {
    return location.state?.resume || initialAuditPayload?.userResumeData || initialAuditPayload?.resumeData || null;
  });

  const [jobTitle, setJobTitle] = useState<string>(() => {
    return location.state?.jobTitle || initialAuditPayload?.jobTitle || '';
  });

  const [jobDescription, setJobDescription] = useState<string>(() => {
    return location.state?.jobDescription || initialAuditPayload?.jobDescription || '';
  });

  // Workflow steps: 'upload' -> 'analyzing' -> 'insights' -> 'builder'
  const [step, setStep] = useState<'upload' | 'analyzing' | 'insights' | 'builder'>(() => {
    if (location.state?.atsAnalysis || initialAuditPayload?.atsAnalysis) {
      return 'insights';
    }
    return 'upload';
  });

  // Input states
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeImagePreview, setResumeImagePreview] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [jobImagePreview, setJobImagePreview] = useState<string | null>(null);

  // Scanning progress state
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanMessage, setScanMessage] = useState<string>('Extracting resume content...');

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Builder states (when step === 'builder')
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'templates'>('content');
  const [builderData, setBuilderData] = useState<ResumeData | null>(null);
  const [builderStyle, setBuilderStyle] = useState<ResumeStyle>(initialStyle);
  const [builderTemplate, setBuilderTemplate] = useState<TemplateId>('standard');

  const handleResumeFileSelect = async (file: File) => {
    setResumeFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setResumeImagePreview(url);
      if (!resumeText) {
        setResumeText(sampleCurrentResumeText);
      }
    } else {
      setResumeImagePreview(null);
      const text = await extractTextFromFile(file);
      if (text) {
        setResumeText(text);
      }
    }
  };

  const handleJobFileSelect = async (file: File) => {
    setJobFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setJobImagePreview(url);
      if (!jobDescription) {
        setJobDescription(sampleJobDescription);
      }
    } else {
      setJobImagePreview(null);
      const text = await extractTextFromFile(file);
      if (text) {
        setJobDescription(text);
      }
    }
  };

  const fillSampleData = () => {
    setResumeText(sampleCurrentResumeText);
    setJobTitle('Senior Full Stack Engineer');
    setJobDescription(sampleJobDescription);
  };

  const handleStartAnalysis = async () => {
    if (!resumeText && !resumeFile) {
      alert('Please upload your resume file or paste your resume text to continue.');
      return;
    }
    if (!jobDescription) {
      alert('Please paste or upload the target Job Description.');
      return;
    }

    setStep('analyzing');
    setScanProgress(15);
    setScanMessage('Extracting & parsing resume sections...');

    // Parse user resume text/file
    let parsed: ResumeData;
    if (resumeFile && !resumeText) {
      parsed = await parseResumeFile(resumeFile);
    } else {
      parsed = parseResumeText(resumeText || sampleCurrentResumeText);
    }
    setUserResumeData(parsed);

    setScanProgress(50);
    setScanMessage('Auditing ATS keywords, formatting, and action verbs via AI...');

    try {
      const response = await fetch(getApiUrl('/api/ai/audit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          resumeData: parsed,
          jobTitle,
          jobDescription
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate ATS audit');
      }

      const audit = await response.json();
      setAtsAnalysis(audit);
      localStorage.setItem('latestAtsAudit', JSON.stringify({
        atsAnalysis: audit,
        userResumeData: parsed,
        jobTitle,
        jobDescription
      }));
      setScanProgress(100);
      setStep('insights');
    } catch (err) {
      console.error(err);
      alert('Failed to audit resume using AI. Please try again.');
      setStep('upload');
    }
  };

  const handleCreateImpressiveResume = () => {
    if (!userResumeData) return;
    
    if (atsAnalysis) {
      localStorage.setItem('latestAtsAudit', JSON.stringify({ atsAnalysis, jobTitle, jobDescription }));
    }

    // Route directly to the main Builder Page with all templates, audit insights, and drawer open
    navigate('/create', { 
      state: { 
        resume: userResumeData, 
        atsAnalysis, 
        jobTitle, 
        jobDescription,
        openAuditDrawer: true 
      } 
    });
  };

  // Inline AI Enhancements for Builder tab
  const handleEnhanceSummaryAI = () => {
    if (!builderData) return;
    const missing = atsAnalysis?.missingKeywords || [];
    const newSummary = enhanceProfessionalSummary(builderData.personalInfo.summary, builderData.personalInfo.jobTitle, missing);
    setBuilderData({
      ...builderData,
      personalInfo: { ...builderData.personalInfo, summary: newSummary }
    });
  };

  const handleEnhanceBulletAI = (expId: string) => {
    if (!builderData) return;
    const missing = atsAnalysis?.missingKeywords || [];
    const updatedExperience = builderData.experience.map(exp => {
      if (exp.id === expId) {
        const bullets = exp.description.split('\n').filter(Boolean);
        const enhanced = bullets.map(b => enhanceBulletText(b, exp.role, missing));
        return { ...exp, description: enhanced.join('\n') };
      }
      return exp;
    });
    setBuilderData({ ...builderData, experience: updatedExperience });
  };

  const handleAddMissingKeywordsAI = () => {
    if (!builderData || !atsAnalysis) return;
    const existing = new Set(builderData.skills.map(s => s.name.toLowerCase()));
    const newSkills = [...builderData.skills];

    atsAnalysis.missingKeywords.slice(0, 5).forEach(kw => {
      if (!existing.has(kw.toLowerCase())) {
        newSkills.push({ id: Date.now().toString() + Math.random().toString().slice(2, 6), name: kw });
        existing.add(kw.toLowerCase());
      }
    });

    setBuilderData({ ...builderData, skills: newSkills });
  };

  // Helper functions for Builder
  const addExperience = () => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      experience: [...builderData.experience, { id: Date.now().toString(), company: '', role: '', startDate: '', endDate: '', description: '' }]
    });
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      experience: builderData.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    });
  };

  const removeExperience = (id: string) => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      experience: builderData.experience.filter(exp => exp.id !== id)
    });
  };

  const addEducation = () => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      education: [...builderData.education, { id: Date.now().toString(), institution: '', degree: '', fieldOfStudy: '', graduationDate: '' }]
    });
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      education: builderData.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    });
  };

  const removeEducation = (id: string) => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      education: builderData.education.filter(edu => edu.id !== id)
    });
  };

  const addSkill = () => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      skills: [...builderData.skills, { id: Date.now().toString(), name: '' }]
    });
  };

  const updateSkill = (id: string, name: string) => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      skills: builderData.skills.map(skill => skill.id === id ? { ...skill, name } : skill)
    });
  };

  const removeSkill = (id: string) => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      skills: builderData.skills.filter(skill => skill.id !== id)
    });
  };


  const addTool = () => {
    if(!builderData) return;
    setBuilderData({
      ...builderData,
      tools: [...(builderData.tools || []), { id: Date.now().toString(), name: '', percentage: 50 }]
    });
  };

  const updateTool = (id: string, field: 'name' | 'percentage', value: string | number) => {
    if(!builderData) return;
    setBuilderData({
      ...builderData,
      tools: (builderData.tools || []).map(tool => tool.id === id ? { ...tool, [field]: value } : tool)
    });
  };

  const removeTool = (id: string) => {
    if(!builderData) return;
    setBuilderData({
      ...builderData,
      tools: (builderData.tools || []).filter(tool => tool.id !== id)
    });
  };


  const addProject = () => {
    if(!builderData) return;
    const newProject = { id: Date.now().toString(), name: '', url: '', description: '', startDate: '', endDate: '' };
    setBuilderData({ ...builderData, projects: [...(builderData.projects || []), newProject] });
  };
  const updateProject = (id: string, field: string, value: string) => {
    if(!builderData) return;
    setBuilderData({ ...builderData, projects: (builderData.projects || []).map(p => p.id === id ? { ...p, [field]: value } : p) });
  };
  const removeProject = (id: string) => {
    if(!builderData) return;
    setBuilderData({ ...builderData, projects: (builderData.projects || []).filter(p => p.id !== id) });
  };

  const addSoftSkill = () => {
    if(!builderData) return;
    setBuilderData({ ...builderData, softSkills: [...(builderData.softSkills || []), { id: Date.now().toString(), name: '' }] });
  };
  const updateSoftSkill = (id: string, value: string) => {
    if(!builderData) return;
    setBuilderData({ ...builderData, softSkills: (builderData.softSkills || []).map(s => s.id === id ? { ...s, name: value } : s) });
  };
  const removeSoftSkill = (id: string) => {
    if(!builderData) return;
    setBuilderData({ ...builderData, softSkills: (builderData.softSkills || []).filter(s => s.id !== id) });
  };

  const addLanguage = () => {
    if(!builderData) return;
    setBuilderData({ ...builderData, languages: [...(builderData.languages || []), { id: Date.now().toString(), name: '' }] });
  };
  const updateLanguage = (id: string, value: string) => {
    if(!builderData) return;
    setBuilderData({ ...builderData, languages: (builderData.languages || []).map(l => l.id === id ? { ...l, name: value } : l) });
  };
  const removeLanguage = (id: string) => {
    if(!builderData) return;
    setBuilderData({ ...builderData, languages: (builderData.languages || []).filter(l => l.id !== id) });
  };

  const addCertification = () => {
    if(!builderData) return;
    setBuilderData({ ...builderData, certifications: [...(builderData.certifications || []), { id: Date.now().toString(), name: '' }] });
  };
  const updateCertification = (id: string, value: string) => {
    if(!builderData) return;
    setBuilderData({ ...builderData, certifications: (builderData.certifications || []).map(c => c.id === id ? { ...c, name: value } : c) });
  };
  const removeCertification = (id: string) => {
    if(!builderData) return;
    setBuilderData({ ...builderData, certifications: (builderData.certifications || []).filter(c => c.id !== id) });
  };



  const addReference = () => {
    if(!builderData) return;
    setBuilderData({
      ...builderData,
      references: [...(builderData.references || []), { id: Date.now().toString(), name: '', title: '', company: '', email: '', phone: '' }]
    });
  };

  const updateReference = (id: string, field: 'name' | 'title' | 'company' | 'email' | 'phone', value: string) => {
    if(!builderData) return;
    setBuilderData({
      ...builderData,
      references: (builderData.references || []).map(ref => ref.id === id ? { ...ref, [field]: value } : ref)
    });
  };

  const removeReference = (id: string) => {
    if(!builderData) return;
    setBuilderData({
      ...builderData,
      references: (builderData.references || []).filter(ref => ref.id !== id)
    });
  };
  const addPositionsOfResponsibility = () => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      positionsOfResponsibility: [...(builderData.positionsOfResponsibility || []), { id: Date.now().toString(), organization: '', role: '', duration: '', description: '' }]
    });
  };

  const updatePositionsOfResponsibility = (id: string, field: string, value: string) => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      positionsOfResponsibility: (builderData.positionsOfResponsibility || []).map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const removePositionsOfResponsibility = (id: string) => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      positionsOfResponsibility: (builderData.positionsOfResponsibility || []).filter(p => p.id !== id)
    });
  };

  const addInterest = () => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      interests: [...(builderData.interests || []), { id: Date.now().toString(), name: '' }]
    });
  };

  const updateInterest = (id: string, value: string) => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      interests: (builderData.interests || []).map(i => i.id === id ? { ...i, name: value } : i)
    });
  };

  const removeInterest = (id: string) => {
    if (!builderData) return;
    setBuilderData({
      ...builderData,
      interests: (builderData.interests || []).filter(i => i.id !== id)
    });
  };

  const moveListItem = (section: keyof ResumeData, index: number, direction: 'up' | 'down') => {
    if (!builderData) return;
    const array = [...((builderData[section] || []) as any[])];
    if (direction === 'up' && index > 0) {
      const temp = array[index];
      array[index] = array[index - 1];
      array[index - 1] = temp;
    } else if (direction === 'down' && index < array.length - 1) {
      const temp = array[index];
      array[index] = array[index + 1];
      array[index + 1] = temp;
    }
    setBuilderData({ ...builderData, [section]: array });
  };

  const renderTemplate = () => {
    if (!builderData) return null;
    const fontSizes = { small: '0.85rem', medium: '1rem', large: '1.15rem' };
    const spacingModes = { compact: '12px', normal: '24px', relaxed: '36px' };
    const itemSpacing = { compact: '8px', normal: '16px', relaxed: '24px' };

    const wrapperStyle: React.CSSProperties = {
      fontFamily: builderStyle.fontFamily,
      fontSize: fontSizes[builderStyle.fontSize],
      color: '#333',
      background: '#fff',
      padding: '40px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
      minHeight: '1056px',
      width: '816px',
      margin: '0 auto',
      transformOrigin: 'top center',
      transform: `scale(${isMobile ? Math.max(0.35, Math.min(1.0, (window.innerWidth - 32) / 816)) : 0.85})`,
      borderRadius: '8px',
      boxSizing: 'border-box'
    };

    if (builderTemplate === 'standard') {
      return (
        <div style={wrapperStyle}>
          <div style={{ textAlign: 'center', borderBottom: `2px solid ${builderStyle.themeColor}`, paddingBottom: spacingModes[builderStyle.spacing], marginBottom: spacingModes[builderStyle.spacing] }}>
            <h1 style={{ fontSize: '2.4em', margin: 0, color: '#111' }}>{builderData.personalInfo.fullName}</h1>
            <p style={{ fontSize: '1.2em', color: builderStyle.themeColor, fontWeight: 600, margin: '4px 0' }}>{builderData.personalInfo.jobTitle}</p>
            <p style={{ fontSize: '0.9em', color: '#666', margin: 0 }}>
              {builderData.personalInfo.email} | {builderData.personalInfo.phone} | {builderData.personalInfo.location}
              {builderData.personalInfo.linkedin && ` | ${builderData.personalInfo.linkedin}`}
              {builderData.personalInfo.github && ` | ${builderData.personalInfo.github}`}
              {builderData.personalInfo.website && ` | ${builderData.personalInfo.website}`}
            </p>
          </div>

          {/* Dynamic Sections */}
          {(builderData.sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references']).map(secId => {
            switch(secId) {
              case 'summary':
                return builderData.personalInfo.summary ? (
                  <div key="summary" style={{ marginBottom: spacingModes[builderStyle.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '8px' }}>Professional Summary</h2>
                    <p style={{ margin: 0, lineHeight: 1.6, color: '#444' }}>{builderData.personalInfo.summary}</p>
                  </div>
                ) : null;
              case 'education':
                return builderData.education && builderData.education.length > 0 ? (
                  <div key="education" style={{ marginBottom: spacingModes[builderStyle.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Education</h2>
                    {builderData.education.map((edu, index) => (
                      <div key={edu.id} style={{ marginBottom: index === builderData.education.length - 1 ? 0 : itemSpacing[builderStyle.spacing] }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                          <div style={{ fontWeight: 'bold' }}>{edu.institution}</div>
                          <div style={{ fontSize: '0.9em', color: '#666' }}>
                            {edu.startDate ? `${edu.startDate} - ${edu.endDate || edu.graduationDate}` : (edu.graduationDate ? `Graduated: ${edu.graduationDate}` : '')}
                          </div>
                        </div>
                        <div style={{ color: builderStyle.themeColor, fontWeight: 'bold' }}>{edu.degree}{edu.degree && edu.fieldOfStudy ? ' in ' : ''}{edu.fieldOfStudy}</div>
                      </div>
                    ))}
                  </div>
                ) : null;
              case 'experience':
                return builderData.experience && builderData.experience.length > 0 ? (
                  <div key="experience" style={{ marginBottom: spacingModes[builderStyle.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Work Experience</h2>
                    {builderData.experience.map((exp, index) => (
                      <div key={exp.id} style={{ marginBottom: index === builderData.experience.length - 1 ? 0 : itemSpacing[builderStyle.spacing] }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                          <span>{exp.role}</span>
                          <span style={{ color: '#666' }}>{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <div style={{ color: builderStyle.themeColor, fontWeight: 'bold', marginBottom: '8px' }}>{exp.company}</div>
                        <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line', color: '#444' }}>{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : null;
              case 'projects':
                return builderData.projects && builderData.projects.length > 0 ? (
                  <div key="projects" style={{ marginBottom: spacingModes[builderStyle.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Projects</h2>
                    {builderData.projects.map((proj, index) => (
                      <div key={proj.id} style={{ marginBottom: index === builderData.projects.length - 1 ? 0 : itemSpacing[builderStyle.spacing] }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                          <span>{proj.name}</span>
                          {(proj.url || proj.websiteUrl) && <a href={proj.url || proj.websiteUrl} style={{ color: builderStyle.themeColor, fontSize: '0.9em', textDecoration: 'none' }}>{proj.url || proj.websiteUrl}</a>}
                        </div>
                        {(proj.technologies || proj.techStack) && (
                          <div style={{ fontSize: '0.85em', color: builderStyle.themeColor, fontWeight: 600, marginBottom: '4px' }}>
                            <strong>Technologies:</strong> {proj.technologies || proj.techStack}
                          </div>
                        )}
                        <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line', color: '#444' }}>{proj.description}</p>
                      </div>
                    ))}
                  </div>
                ) : null;
              case 'skills':
                return (builderData.skills.length > 0 || (builderData.tools && builderData.tools.length > 0)) ? (
                  <div key="skills" style={{ marginBottom: spacingModes[builderStyle.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Technical Skills & Tools</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {builderData.skills.map(skill => (
                        <span key={skill.id} style={{ background: '#f5f5f5', padding: '4px 12px', borderRadius: '4px', fontSize: '0.9em', border: '1px solid #e2e8f0' }}>
                          {skill.name}
                        </span>
                      ))}
                      {(builderData.tools || []).map(tool => (
                        <span key={tool.id} style={{ background: '#eff6ff', color: builderStyle.themeColor, padding: '4px 12px', borderRadius: '4px', fontSize: '0.9em', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                          {tool.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'softSkills':
                return builderData.softSkills && builderData.softSkills.length > 0 ? (
                  <div key="softSkills" style={{ marginBottom: spacingModes[builderStyle.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Soft Skills</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {builderData.softSkills.map(skill => (
                        <span key={skill.id} style={{ background: '#faf5ff', color: '#701a75', padding: '4px 12px', borderRadius: '4px', fontSize: '0.9em', border: '1px solid #f5d0fe' }}>
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'languages':
                return builderData.languages && builderData.languages.length > 0 ? (
                  <div key="languages" style={{ marginBottom: spacingModes[builderStyle.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Languages</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                      {builderData.languages.map(lang => (
                        <span key={lang.id} style={{ fontSize: '0.95em', color: '#444' }}>
                          <strong>{lang.name}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'certifications':
                return builderData.certifications && builderData.certifications.length > 0 ? (
                  <div key="certifications" style={{ marginBottom: spacingModes[builderStyle.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Certifications</h2>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#444', lineHeight: 1.6 }}>
                      {builderData.certifications.map(cert => (
                        <li key={cert.id} style={{ marginBottom: '4px' }}>{cert.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              case 'achievements':
                return builderData.achievements && builderData.achievements.length > 0 ? (
                  <div key="achievements" style={{ marginBottom: spacingModes[builderStyle.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Achievements</h2>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#444', lineHeight: 1.6 }}>
                      {builderData.achievements.map(ach => (
                        <li key={ach.id} style={{ marginBottom: '4px' }}>{ach.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              case 'positionsOfResponsibility':
                return builderData.positionsOfResponsibility && builderData.positionsOfResponsibility.length > 0 ? (
                  <div key="positionsOfResponsibility" style={{ marginBottom: spacingModes[builderStyle.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Positions of Responsibility</h2>
                    {builderData.positionsOfResponsibility.map((pos, index) => (
                      <div key={pos.id} style={{ marginBottom: index === builderData.positionsOfResponsibility.length - 1 ? 0 : itemSpacing[builderStyle.spacing] }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                          <span>{pos.role}</span>
                          <span style={{ color: '#666', fontWeight: 500 }}>{pos.duration}</span>
                        </div>
                        <div style={{ color: builderStyle.themeColor, fontWeight: 'bold', marginBottom: '4px' }}>{pos.organization}</div>
                        <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line', color: '#444' }}>{pos.description}</p>
                      </div>
                    ))}
                  </div>
                ) : null;
              case 'interests':
                return builderData.interests && builderData.interests.length > 0 ? (
                  <div key="interests" style={{ marginBottom: spacingModes[builderStyle.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Interests</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {builderData.interests.map(i => (
                        <span key={i.id} style={{ background: '#f8fafc', padding: '4px 12px', borderRadius: '4px', fontSize: '0.9em', border: '1px solid #e2e8f0', color: '#475569' }}>
                          {i.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'references':
                return builderData.references && builderData.references.length > 0 ? (
                  <div key="references" style={{ marginBottom: spacingModes[builderStyle.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>References</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      {builderData.references.map(ref => (
                        <div key={ref.id} style={{ fontSize: '0.9em', color: '#444' }}>
                          <strong>{ref.name}</strong> — {ref.title}, {ref.company}<br/>
                          {ref.email} | {ref.phone}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              default:
                return null;
            }
          })}
        </div>
      );
    }

    if (builderTemplate === 'academic') {
      return (
        <div className="print-container" style={{ ...wrapperStyle, padding: '40px', background: '#fff', color: '#000' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '2.5em', fontWeight: 'bold', margin: '0 0 8px 0', letterSpacing: '1px' }}>{builderData.personalInfo.fullName}</h1>
            <h2 style={{ fontSize: '1.2em', fontWeight: 'normal', margin: '0 0 12px 0', fontStyle: 'italic' }}>{builderData.personalInfo.jobTitle}</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.9em', color: '#333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>✉️</span> {builderData.personalInfo.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>📞</span> {builderData.personalInfo.phone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>📍</span> {builderData.personalInfo.location}
              </div>
              {builderData.personalInfo.linkedin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '14px' }}>🔗</span> {builderData.personalInfo.linkedin}
                </div>
              )}
              {builderData.personalInfo.github && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '14px' }}>🐙</span> {builderData.personalInfo.github}
                </div>
              )}
              {builderData.personalInfo.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '14px' }}>🌐</span> {builderData.personalInfo.website}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Sections */}
          {(builderData.sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references']).map(secId => {
            switch(secId) {
              case 'summary':
                return builderData.personalInfo.summary ? (
                  <div key="summary" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${builderStyle.themeColor}`, paddingBottom: '4px' }}>Summary</h3>
                    <p style={{ margin: 0, fontSize: '0.95em', lineHeight: 1.5 }}>{builderData.personalInfo.summary}</p>
                  </div>
                ) : null;
              case 'education':
                return builderData.education && builderData.education.length > 0 ? (
                  <div key="education" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${builderStyle.themeColor}`, paddingBottom: '4px' }}>Education</h3>
                    {builderData.education.map(edu => (
                      <div key={edu.id} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold', fontSize: '1em', marginBottom: '2px' }}>
                          <span>{edu.degree}{edu.degree && edu.fieldOfStudy ? ' in ' : ''}{edu.fieldOfStudy}</span>
                          <span>{edu.startDate ? `${edu.startDate} - ${edu.endDate || edu.graduationDate}` : edu.graduationDate}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontSize: '0.95em', fontStyle: 'italic' }}>
                          <span>{edu.institution}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null;
              case 'experience':
                return builderData.experience && builderData.experience.length > 0 ? (
                  <div key="experience" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${builderStyle.themeColor}`, paddingBottom: '4px' }}>Work Experience</h3>
                    {builderData.experience.map(exp => (
                      <div key={exp.id} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                          <strong style={{ fontSize: '1em' }}>{exp.company}</strong>
                          <span style={{ fontSize: '0.95em', fontWeight: 'bold' }}>{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <div style={{ fontStyle: 'italic', fontSize: '0.95em', marginBottom: '6px' }}>{exp.role}</div>
                        <div style={{ fontSize: '0.95em', lineHeight: 1.5, paddingLeft: '16px' }}>
                          <ul style={{ margin: 0, padding: 0, listStyleType: 'disc' }}>
                            {exp.description.split('\n').map((line, idx) => {
                              const cleanLine = line.trim().replace(/^[-•]\s*/, '');
                              if (!cleanLine) return null;
                              return <li key={idx} style={{ marginBottom: '4px' }}>{cleanLine}</li>;
                            })}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null;
              case 'projects':
                return builderData.projects && builderData.projects.length > 0 ? (
                  <div key="projects" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${builderStyle.themeColor}`, paddingBottom: '4px' }}>Projects</h3>
                    {builderData.projects.map(proj => (
                      <div key={proj.id} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                          <strong style={{ fontSize: '1em' }}>{proj.name}</strong>
                        </div>
                        {(proj.technologies || proj.techStack) && (
                          <div style={{ fontSize: '0.85em', color: builderStyle.themeColor, fontWeight: 600, marginBottom: '4px' }}>
                            <strong>Technologies:</strong> {proj.technologies || proj.techStack}
                          </div>
                        )}
                        {proj.url && (
                          <div style={{ fontStyle: 'italic', fontSize: '0.95em', marginBottom: '6px' }}>{proj.url}</div>
                        )}
                        {proj.websiteUrl && (
                          <div style={{ fontStyle: 'italic', fontSize: '0.95em', marginBottom: '6px' }}>{proj.websiteUrl}</div>
                        )}
                        <div style={{ fontSize: '0.95em', lineHeight: 1.5, paddingLeft: '16px' }}>
                          <ul style={{ margin: 0, padding: 0, listStyleType: 'disc' }}>
                            {proj.description.split('\n').map((line, idx) => {
                              const cleanLine = line.trim().replace(/^[-•]\s*/, '');
                              if (!cleanLine) return null;
                              return <li key={idx} style={{ marginBottom: '4px' }}>{cleanLine}</li>;
                            })}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null;
              case 'skills':
                return (builderData.skills.length > 0 || (builderData.tools && builderData.tools.length > 0)) ? (
                  <div key="skills" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${builderStyle.themeColor}`, paddingBottom: '4px' }}>Technical Skills</h3>
                    <div style={{ fontSize: '0.95em', lineHeight: 1.5 }}>
                      {builderData.skills.length > 0 && (
                        <div style={{ marginBottom: '4px' }}>
                          <strong style={{ marginRight: '8px' }}>Core Skills:</strong>
                          <span>{builderData.skills.map(s => s.name).join(', ')}</span>
                        </div>
                      )}
                      {builderData.tools && builderData.tools.length > 0 && (
                        <div>
                          <strong style={{ marginRight: '8px' }}>Tools & Software:</strong>
                          <span>{builderData.tools.map(t => t.name).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null;
              case 'softSkills':
                return builderData.softSkills && builderData.softSkills.length > 0 ? (
                  <div key="softSkills" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${builderStyle.themeColor}`, paddingBottom: '4px' }}>Soft Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.95em' }}>
                      {builderData.softSkills.map(skill => (
                        <span key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></span>
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'languages':
                return builderData.languages && builderData.languages.length > 0 ? (
                  <div key="languages" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${builderStyle.themeColor}`, paddingBottom: '4px' }}>Languages</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.95em' }}>
                      {builderData.languages.map(lang => (
                        <span key={lang.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></span>
                          {lang.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'certifications':
                return builderData.certifications && builderData.certifications.length > 0 ? (
                  <div key="certifications" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${builderStyle.themeColor}`, paddingBottom: '4px' }}>Certifications</h3>
                    <ul style={{ margin: 0, padding: 0, paddingLeft: '16px', listStyleType: 'disc', fontSize: '0.95em' }}>
                      {builderData.certifications.map(cert => (
                        <li key={cert.id} style={{ marginBottom: '4px' }}>{cert.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              case 'achievements':
                return builderData.achievements && builderData.achievements.length > 0 ? (
                  <div key="achievements" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${builderStyle.themeColor}`, paddingBottom: '4px' }}>Achievements</h3>
                    <ul style={{ margin: 0, padding: 0, paddingLeft: '16px', listStyleType: 'disc', fontSize: '0.95em' }}>
                      {builderData.achievements.map(ach => (
                        <li key={ach.id} style={{ marginBottom: '4px' }}>{ach.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              case 'positionsOfResponsibility':
                return builderData.positionsOfResponsibility && builderData.positionsOfResponsibility.length > 0 ? (
                  <div key="positionsOfResponsibility" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${builderStyle.themeColor}`, paddingBottom: '4px' }}>Positions of Responsibility</h3>
                    {builderData.positionsOfResponsibility.map(pos => (
                      <div key={pos.id} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 'bold', fontSize: '1em', marginBottom: '2px' }}>
                          <span>{pos.role}</span>
                          <span>{pos.duration}</span>
                        </div>
                        <div style={{ fontStyle: 'italic', fontSize: '0.95em', marginBottom: '6px' }}>{pos.organization}</div>
                        <div style={{ fontSize: '0.95em', lineHeight: 1.5, paddingLeft: '16px' }}>
                          <ul style={{ margin: 0, padding: 0, listStyleType: 'disc' }}>
                            {pos.description.split('\n').map((line, idx) => {
                              const cleanLine = line.trim().replace(/^[-•]\s*/, '');
                              if (!cleanLine) return null;
                              return <li key={idx} style={{ marginBottom: '4px' }}>{cleanLine}</li>;
                            })}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null;
              case 'interests':
                return builderData.interests && builderData.interests.length > 0 ? (
                  <div key="interests" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${builderStyle.themeColor}`, paddingBottom: '4px' }}>Interests</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.95em' }}>
                      {builderData.interests.map(i => (
                        <span key={i.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></span>
                          {i.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'references':
                return builderData.references && builderData.references.length > 0 ? (
                  <div key="references" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${builderStyle.themeColor}`, paddingBottom: '4px' }}>References</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                       {builderData.references.map(ref => (
                         <div key={ref.id} style={{ fontSize: '0.95em' }}>
                           <strong>{ref.name}</strong> — {ref.title}, {ref.company}<br/>
                           {ref.email} | {ref.phone}
                         </div>
                       ))}
                    </div>
                  </div>
                ) : null;
              default:
                return null;
            }
          })}
        </div>
      );
    }

    if (builderTemplate === 'minimalist') {
      return (
        <div className="print-container" style={{ ...wrapperStyle, padding: '40px', background: '#fff', color: '#000', display: 'flex', gap: '40px' }}>
          <div style={{ width: '30%' }}>
            <h1 style={{ fontSize: '2em', fontWeight: 300, margin: '0 0 8px 0', lineHeight: 1.1 }}>{builderData.personalInfo.fullName}</h1>
            <p style={{ color: builderStyle.themeColor, fontWeight: 'bold', marginBottom: '24px' }}>{builderData.personalInfo.jobTitle}</p>
            
            <div style={{ fontSize: '0.9em', color: '#555', marginBottom: '32px' }}>
              <div style={{ marginBottom: '4px' }}>{builderData.personalInfo.email}</div>
              <div style={{ marginBottom: '4px' }}>{builderData.personalInfo.phone}</div>
              <div>{builderData.personalInfo.location}</div>
            </div>

            {/* Soft Skills */}
            {builderData.softSkills && builderData.softSkills.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '12px' }}>Soft Skills</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em', color: '#555' }}>
                  {builderData.softSkills.map(skill => (
                    <li key={skill.id} style={{ marginBottom: '4px' }}>{skill.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages */}
            {builderData.languages && builderData.languages.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '12px' }}>Languages</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em', color: '#555' }}>
                  {builderData.languages.map(lang => (
                    <li key={lang.id} style={{ marginBottom: '4px' }}>{lang.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Interests */}
            {builderData.interests && builderData.interests.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '12px' }}>Interests</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em', color: '#555' }}>
                  {builderData.interests.map(i => (
                    <li key={i.id} style={{ marginBottom: '4px' }}>{i.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div style={{ width: '70%' }}>
            {/* Dynamic Right Column Sections */}
            {(builderData.sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'achievements', 'positionsOfResponsibility', 'references'])
              .filter(secId => ['summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'achievements', 'positionsOfResponsibility', 'references'].includes(secId))
              .map(secId => {
                switch(secId) {
                  case 'summary':
                    return builderData.personalInfo.summary ? (
                      <p key="summary" style={{ fontStyle: 'italic', color: '#666', marginBottom: '32px', lineHeight: 1.6 }}>{builderData.personalInfo.summary}</p>
                    ) : null;
                  case 'experience':
                    return builderData.experience && builderData.experience.length > 0 ? (
                      <div key="experience" style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Experience</h3>
                        {builderData.experience.map(exp => (
                          <div key={exp.id} style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '1.1em' }}>{exp.role}</strong>
                              <span style={{ fontSize: '0.9em', color: '#888' }}>{exp.startDate} - {exp.endDate}</span>
                            </div>
                            <div style={{ color: builderStyle.themeColor, marginBottom: '8px' }}>{exp.company}</div>
                            <p style={{ margin: 0, color: '#444', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : null;
                  case 'projects':
                    return builderData.projects && builderData.projects.length > 0 ? (
                      <div key="projects" style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Projects</h3>
                        {builderData.projects.map(proj => (
                          <div key={proj.id} style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '1.05em' }}>{proj.name}</strong>
                              {(proj.url || proj.websiteUrl) && <a href={proj.url || proj.websiteUrl} style={{ color: builderStyle.themeColor, fontSize: '0.85em', textDecoration: 'none' }}>{proj.url || proj.websiteUrl}</a>}
                            </div>
                            {(proj.technologies || proj.techStack) && (
                              <div style={{ fontSize: '0.85em', color: builderStyle.themeColor, fontWeight: 600, marginBottom: '4px' }}>
                                <strong>Technologies:</strong> {proj.technologies || proj.techStack}
                              </div>
                            )}
                            <p style={{ margin: 0, color: '#444', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{proj.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : null;
                  case 'skills':
                    return (builderData.skills.length > 0 || (builderData.tools && builderData.tools.length > 0)) ? (
                      <div key="skills" style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Technical Skills & Tools</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {builderData.skills.map(skill => (
                            <span key={skill.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85em' }}>
                              {skill.name}
                            </span>
                          ))}
                          {(builderData.tools || []).map(tool => (
                            <span key={tool.id} style={{ background: '#eff6ff', color: builderStyle.themeColor, border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 600 }}>
                              {tool.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  case 'education':
                    return builderData.education && builderData.education.length > 0 ? (
                      <div key="education" style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Education</h3>
                        {builderData.education.map(edu => (
                          <div key={edu.id} style={{ marginBottom: '16px' }}>
                            <strong style={{ display: 'block', fontSize: '1.05em', marginBottom: '4px' }}>{edu.institution}</strong>
                            <div style={{ color: '#444' }}>{edu.degree}{edu.degree && edu.fieldOfStudy ? ' in ' : ''}{edu.fieldOfStudy}</div>
                            <div style={{ color: '#888', fontSize: '0.9em' }}>
                              {edu.startDate ? `${edu.startDate} - ${edu.endDate || edu.graduationDate}` : edu.graduationDate}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null;
                  case 'certifications':
                    return builderData.certifications && builderData.certifications.length > 0 ? (
                      <div key="certifications" style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Certifications</h3>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em', color: '#444' }}>
                          {builderData.certifications.map(cert => (
                            <li key={cert.id} style={{ marginBottom: '4px' }}>{cert.name}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null;
                  case 'achievements':
                    return builderData.achievements && builderData.achievements.length > 0 ? (
                      <div key="achievements" style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Achievements</h3>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em', color: '#444' }}>
                          {builderData.achievements.map(ach => (
                            <li key={ach.id} style={{ marginBottom: '4px' }}>{ach.name}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null;
                  case 'positionsOfResponsibility':
                    return builderData.positionsOfResponsibility && builderData.positionsOfResponsibility.length > 0 ? (
                      <div key="positionsOfResponsibility" style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Positions of Responsibility</h3>
                        {builderData.positionsOfResponsibility.map(pos => (
                          <div key={pos.id} style={{ marginBottom: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '1.05em' }}>{pos.role}</strong>
                              <span style={{ fontSize: '0.9em', color: '#888' }}>{pos.duration}</span>
                            </div>
                            <div style={{ color: builderStyle.themeColor, marginBottom: '6px' }}>{pos.organization}</div>
                            <p style={{ margin: 0, color: '#444', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{pos.description}</p>
                          </div>
                        ))}
                      </div>
                    ) : null;
                  case 'references':
                    return builderData.references && builderData.references.length > 0 ? (
                      <div key="references" style={{ marginBottom: '32px' }}>
                        <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>References</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                          {builderData.references.map(ref => (
                            <div key={ref.id} style={{ fontSize: '0.9em', color: '#444' }}>
                              <strong>{ref.name}</strong> — {ref.title}, {ref.company}<br/>
                              {ref.email} | {ref.phone}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null;
                  default:
                    return null;
                }
              })}
          </div>
        </div>
      );
    }

    return (
      <div className="print-container" style={{ ...wrapperStyle, padding: 0, display: 'flex', background: '#fff' }}>
        {/* Left Column */}
        <div style={{ width: '35%', background: builderStyle.themeColor, color: '#fff', padding: '40px 30px', boxSizing: 'border-box' }}>
          {/* Profile Photo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px' }}>
              {builderData.personalInfo.photoUrl ? (
                <img src={builderData.personalInfo.photoUrl} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#eee' }}></div>
              )}
            </div>
          </div>

          {/* Contact */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>Contact</h3>
            <div style={{ fontSize: '0.9em', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: builderStyle.themeColor, fontSize: '12px' }}>📞</span>
                <span>{builderData.personalInfo.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: builderStyle.themeColor, fontSize: '12px' }}>✉️</span>
                <span style={{ wordBreak: 'break-all' }}>{builderData.personalInfo.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: builderStyle.themeColor, fontSize: '12px' }}>📍</span>
                <span>{builderData.personalInfo.location}</span>
              </div>
            </div>
          </div>

          {/* Soft Skills */}
          {builderData.softSkills && builderData.softSkills.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>Soft Skills</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em' }}>
                {builderData.softSkills.map(skill => (
                  <li key={skill.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></span>
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {builderData.languages && builderData.languages.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>Languages</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em' }}>
                {builderData.languages.map(lang => (
                  <li key={lang.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></span>
                    {lang.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interests */}
          {builderData.interests && builderData.interests.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>Interests</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em' }}>
                {builderData.interests.map(i => (
                  <li key={i.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></span>
                    {i.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{ width: '65%', padding: '40px', boxSizing: 'border-box' }}>
          {/* Header */}
          <div style={{ borderTop: '4px solid #333', borderBottom: '4px solid #333', padding: '20px 0', marginBottom: '30px' }}>
            <h1 style={{ margin: '0', fontSize: '3em', letterSpacing: '2px', color: '#333', textTransform: 'uppercase', lineHeight: 1.1 }}>
              {builderData.personalInfo.fullName.split(' ')[0]} <span style={{ fontWeight: 300 }}>{builderData.personalInfo.fullName.split(' ').slice(1).join(' ')}</span>
            </h1>
            <h2 style={{ margin: '10px 0 0 0', fontSize: '1.4em', letterSpacing: '4px', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>
              {builderData.personalInfo.jobTitle}
            </h2>
          </div>

          {/* Dynamic Right Column Sections */}
          {(builderData.sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'achievements', 'positionsOfResponsibility', 'references'])
            .filter(secId => ['summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'achievements', 'positionsOfResponsibility', 'references'].includes(secId))
            .map(secId => {
              switch(secId) {
                case 'summary':
                  return builderData.personalInfo.summary ? (
                    <div key="summary" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '12px' }}>Profile Info</h3>
                      <p style={{ margin: 0, color: '#555', lineHeight: 1.6, fontSize: '0.95em' }}>
                        {builderData.personalInfo.summary}
                      </p>
                    </div>
                  ) : null;
                case 'education':
                  return builderData.education && builderData.education.length > 0 ? (
                    <div key="education" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Education</h3>
                      {builderData.education.map(edu => (
                        <div key={edu.id} style={{ marginBottom: '16px', display: 'flex', gap: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '20px', height: '20px', background: '#333', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>&gt;</div>
                              <strong style={{ fontSize: '1.1em', color: '#333' }}>{edu.degree}{edu.degree && edu.fieldOfStudy ? ' in ' : ''}{edu.fieldOfStudy}</strong>
                            </div>
                            <div style={{ color: '#666', marginLeft: '28px', fontStyle: 'italic', fontSize: '0.9em' }}>{edu.institution}</div>
                          </div>
                          <div style={{ width: '140px', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>
                            {edu.startDate ? `${edu.startDate} - ${edu.endDate || edu.graduationDate}` : edu.graduationDate}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null;
                case 'experience':
                  return builderData.experience && builderData.experience.length > 0 ? (
                    <div key="experience" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Experience</h3>
                      {builderData.experience.map(exp => (
                        <div key={exp.id} style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', gap: '16px', marginBottom: '8px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '20px', height: '20px', background: '#333', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>&gt;</div>
                                <strong style={{ fontSize: '1.1em', color: '#333' }}>{exp.role}</strong>
                              </div>
                              <div style={{ color: '#666', marginLeft: '28px', fontStyle: 'italic', fontSize: '0.9em' }}>{exp.company}</div>
                            </div>
                            <div style={{ width: '140px', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>{exp.startDate} - {exp.endDate}</div>
                          </div>
                          <div style={{ marginLeft: '28px', color: '#555', fontSize: '0.9em', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                            {exp.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null;
                case 'projects':
                  return builderData.projects && builderData.projects.length > 0 ? (
                    <div key="projects" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Projects</h3>
                      {builderData.projects.map(proj => (
                        <div key={proj.id} style={{ marginBottom: '18px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '1.05em', color: '#333' }}>{proj.name}</strong>
                            {(proj.url || proj.websiteUrl) && <a href={proj.url || proj.websiteUrl} style={{ color: builderStyle.themeColor, fontSize: '0.85em', textDecoration: 'none' }}>{proj.url || proj.websiteUrl}</a>}
                          </div>
                          {(proj.technologies || proj.techStack) && (
                            <div style={{ fontSize: '0.85em', color: builderStyle.themeColor, fontWeight: 600, marginBottom: '4px' }}>
                              <strong>Technologies:</strong> {proj.technologies || proj.techStack}
                            </div>
                          )}
                          <p style={{ margin: 0, color: '#555', fontSize: '0.9em', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : null;
                case 'skills':
                  return (builderData.skills.length > 0 || (builderData.tools && builderData.tools.length > 0)) ? (
                    <div key="skills" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Technical Skills & Tools</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {builderData.skills.map(skill => (
                          <span key={skill.id} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 500 }}>
                            {skill.name}
                          </span>
                        ))}
                        {(builderData.tools || []).map(tool => (
                          <span key={tool.id} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: builderStyle.themeColor, padding: '4px 10px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 600 }}>
                            {tool.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                case 'certifications':
                  return builderData.certifications && builderData.certifications.length > 0 ? (
                    <div key="certifications" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Certifications</h3>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em', color: '#555', lineHeight: 1.6 }}>
                        {builderData.certifications.map(cert => (
                          <li key={cert.id} style={{ marginBottom: '4px' }}>{cert.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                case 'achievements':
                  return builderData.achievements && builderData.achievements.length > 0 ? (
                    <div key="achievements" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Achievements</h3>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em', color: '#555', lineHeight: 1.6 }}>
                        {builderData.achievements.map(ach => (
                          <li key={ach.id} style={{ marginBottom: '4px' }}>{ach.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                case 'positionsOfResponsibility':
                  return builderData.positionsOfResponsibility && builderData.positionsOfResponsibility.length > 0 ? (
                    <div key="positionsOfResponsibility" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Positions of Responsibility</h3>
                      {builderData.positionsOfResponsibility.map(pos => (
                        <div key={pos.id} style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '1.05em', color: '#333' }}>{pos.role}</strong>
                            <span style={{ fontSize: '0.9em', color: '#888', fontWeight: 'bold' }}>{pos.duration}</span>
                          </div>
                          <div style={{ color: builderStyle.themeColor, fontStyle: 'italic', marginBottom: '6px' }}>{pos.organization}</div>
                          <p style={{ margin: 0, color: '#555', fontSize: '0.95em', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{pos.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : null;
                case 'references':
                  return builderData.references && builderData.references.length > 0 ? (
                    <div key="references" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Reference</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {builderData.references.map(ref => (
                          <div key={ref.id} style={{ flex: '1 1 calc(50% - 10px)', display: 'flex', gap: '8px', fontSize: '0.9em' }}>
                            <div style={{ width: '6px', height: '6px', background: '#333', borderRadius: '50%', marginTop: '6px' }}></div>
                            <div>
                              <strong style={{ display: 'block', color: '#333' }}>{ref.name} - {ref.title}, {ref.company}</strong>
                              <div style={{ color: '#666' }}>{ref.email}</div>
                              <div style={{ color: '#666' }}>{ref.phone}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                default:
                  return null;
              }
            })}
        </div>
      </div>
    );
  };

  // IF IN BUILDER MODE -> RENDER FULL BUILDER INTERFACE
  if (step === 'builder' && builderData) {
    return (
      <div className="print-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--bg-primary)', color: 'var(--text-primary)', overflow: 'hidden' }}>
        {isMobile && (
          <div className="no-print" style={{
            display: 'flex',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-color)',
            padding: '8px',
            gap: '8px',
            zIndex: 100,
            width: '100%'
          }}>
            <button
              onClick={() => setMobileTab('editor')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: mobileTab === 'editor' ? 'var(--text-primary)' : 'transparent',
                color: mobileTab === 'editor' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              📝 Edit Content
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: mobileTab === 'preview' ? 'var(--text-primary)' : 'transparent',
                color: mobileTab === 'preview' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              📄 Live PDF Preview
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flex: 1, width: '100%', overflow: 'hidden', position: 'relative' }}>
          <style>{`
            @media print {
              .no-print { display: none !important; }
              .a4-page-break-line { display: none !important; }
              body { 
                background: white !important; 
                margin: 0 !important; 
                padding: 0 !important;
                -webkit-print-color-adjust: exact; 
              }
              @page {
                size: A4 portrait;
                margin: 0;
              }
              .print-container { 
                transform: none !important;
                margin: 0 auto !important;
                padding: 12mm 15mm !important;
                box-shadow: none !important;
                width: 210mm !important;
                min-height: 297mm !important;
                box-sizing: border-box !important;
                page-break-after: always;
                break-after: page;
              }
              .print-wrapper {
                background: white !important;
                padding: 0 !important;
                overflow: visible !important;
                height: auto !important;
              }
            }
          `}</style>
        
          {/* Left Sidebar - Controls */}
          <div className="no-print" style={{ 
            width: isMobile ? (mobileTab === 'editor' ? '100%' : '0px') : '420px', 
            minWidth: isMobile ? (mobileTab === 'editor' ? '100%' : '0px') : '420px',
            overflow: 'hidden',
            height: '100%', 
            background: 'var(--bg-secondary)', 
            borderRight: isMobile ? 'none' : '1px solid var(--border-color)',
            display: isMobile ? (mobileTab === 'editor' ? 'flex' : 'none') : 'flex',
            flexDirection: 'column',
            zIndex: 20
          }}>
          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => setStep('insights')} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <ChevronLeft size={22} />
              </button>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Tailored Resume Builder</h2>
                <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={12} /> {atsAnalysis?.atsScore || 90}% ATS Match
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => setActiveTab('content')}
              style={{
                flex: 1,
                padding: '12px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'content' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === 'content' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FileText size={18} /> Content
            </button>
            <button 
              onClick={() => setActiveTab('style')}
              style={{
                flex: 1,
                padding: '12px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'style' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === 'style' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Palette size={18} /> Style
            </button>
            <button 
              onClick={() => setActiveTab('templates')}
              style={{
                flex: 1,
                padding: '12px',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'templates' ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: activeTab === 'templates' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <LayoutTemplate size={18} /> Templates
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            {activeTab === 'content' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Section Ordering Panel */}
                <h3 style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Section Layout Order</h3>
                <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Customize the order in which sections appear on your resume.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(builderData.sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references']).map((secId, index) => {
                      const sectionLabels: Record<string, string> = {
                        summary: 'Summary',
                        education: 'Education',
                        experience: 'Work Experience',
                        projects: 'Projects',
                        skills: 'Technical Skills',
                        softSkills: 'Soft Skills',
                        languages: 'Languages',
                        certifications: 'Certifications',
                        achievements: 'Achievements',
                        positionsOfResponsibility: 'Positions of Responsibility',
                        interests: 'Interests',
                        references: 'References'
                      };
                      const moveSection = (fromIndex: number, direction: 'up' | 'down') => {
                        const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
                        const order = [...(builderData.sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references'])];
                        if (toIndex < 0 || toIndex >= order.length) return;
                        const temp = order[fromIndex];
                        order[fromIndex] = order[toIndex];
                        order[toIndex] = temp;
                        setBuilderData({ ...builderData, sectionOrder: order });
                      };
                      return (
                        <div key={secId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{sectionLabels[secId] || secId}</span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              disabled={index === 0}
                              onClick={() => moveSection(index, 'up')}
                              style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              ▲
                            </button>
                            <button 
                              disabled={index === 11}
                              onClick={() => moveSection(index, 'down')}
                              style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Personal Info */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-primary)' }}>Personal Info</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={builderData.personalInfo.fullName} 
                      onChange={e => setBuilderData({...builderData, personalInfo: {...builderData.personalInfo, fullName: e.target.value}})}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                    />
                    <input 
                      type="text" 
                      placeholder="Target Job Title" 
                      value={builderData.personalInfo.jobTitle} 
                      onChange={e => setBuilderData({...builderData, personalInfo: {...builderData.personalInfo, jobTitle: e.target.value}})}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--accent-primary)', color: 'var(--text-primary)', borderRadius: '8px', fontWeight: 600 }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Email" 
                        value={builderData.personalInfo.email} 
                        onChange={e => setBuilderData({...builderData, personalInfo: {...builderData.personalInfo, email: e.target.value}})}
                        style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                      />
                      <input 
                        type="text" 
                        placeholder="Phone" 
                        value={builderData.personalInfo.phone} 
                        onChange={e => setBuilderData({...builderData, personalInfo: {...builderData.personalInfo, phone: e.target.value}})}
                        style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                      <input 
                        type="text" 
                        placeholder="Location" 
                        value={builderData.personalInfo.location || ''} 
                        onChange={e => setBuilderData({...builderData, personalInfo: {...builderData.personalInfo, location: e.target.value}})}
                        style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                      />
                      <input 
                        type="text" 
                        placeholder="LinkedIn URL" 
                        value={builderData.personalInfo.linkedin || ''} 
                        onChange={e => setBuilderData({...builderData, personalInfo: {...builderData.personalInfo, linkedin: e.target.value}})}
                        style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                      />
                      
                  <input 
                    type="text" 
                    placeholder="GitHub URL" 
                    className="premium-input"
                    value={builderData.personalInfo.github || ''}
                    onChange={e => setBuilderData({...builderData, personalInfo: {...builderData.personalInfo, github: e.target.value}})}
                    style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                  />

                  <input 
                    type="text" 
                    placeholder="GitHub URL" 
                    className="premium-input"
                    value={builderData.personalInfo.github || ''}
                    onChange={e => setBuilderData({...builderData, personalInfo: {...builderData.personalInfo, github: e.target.value}})}
                    style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                  />
<input 
                        type="text" 
                        placeholder="Portfolio URL" 
                        value={builderData.personalInfo.website || ''} 
                        onChange={e => setBuilderData({...builderData, personalInfo: {...builderData.personalInfo, website: e.target.value}})}
                        style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                      <textarea 
                        placeholder="Professional Summary" 
                        rows={3}
                        value={builderData.personalInfo.summary} 
                        onChange={e => setBuilderData({...builderData, personalInfo: {...builderData.personalInfo, summary: e.target.value}})}
                        style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', resize: 'vertical', minHeight: '100px' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={handleEnhanceSummaryAI}
                          style={{
                            background: 'var(--accent-glow)',
                            color: 'var(--accent-primary)',
                            border: '1px solid var(--accent-primary)',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'var(--transition-smooth)'
                          }}
                        >
                          <Wand2 size={12} /> ✨ Enhance Summary
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Work Experience</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
                  {builderData.experience.map((exp, index) => (
                    <div key={exp.id} className="premium-card" style={{ padding: '20px', marginBottom: '16px', position: 'relative' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{index + 1}</div>
                        {exp.company ? exp.company : 'New Experience'}
                      </div>
                      <button onClick={() => removeExperience(exp.id)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={15} />
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input type="text" placeholder="Company" style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} />
                        <input type="text" placeholder="Role" style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} />
                        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                          <input type="text" placeholder="Start Date" style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} />
                          <input type="text" placeholder="End Date" style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <textarea 
                            rows={4}
                            placeholder="Bullet Points & Accomplishments..." 
                            value={exp.description} 
                            onChange={e => updateExperience(exp.id, 'description', e.target.value)} 
                            style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', minHeight: '100px', resize: 'vertical' }} 
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button disabled={index === 0} onClick={() => moveListItem('experience', index, 'up')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer' }}>▲ Move Up</button>
                              <button disabled={index === builderData.experience.length - 1} onClick={() => moveListItem('experience', index, 'down')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer' }}>▼ Move Down</button>
                            </div>
                            <button 
                              onClick={() => handleEnhanceBulletAI(exp.id)}
                              style={{
                                background: 'var(--accent-glow)',
                                color: 'var(--accent-primary)',
                                border: '1px solid var(--accent-primary)',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Wand2 size={12} /> ✨ Improve Bullets
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div onClick={addExperience} style={{ padding: '12px', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, marginBottom: '20px' }}>
                  <Plus size={16} style={{ marginRight: '6px' }} /> Add Experience
                </div>

                {/* Education */}
                <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Education</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
                  {builderData.education.map((edu, index) => (
                    <div key={edu.id} className="premium-card" style={{ padding: '20px', marginBottom: '16px', position: 'relative' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{index + 1}</div>
                        {edu.institution ? edu.institution : 'New Education'}
                      </div>
                      <button onClick={() => removeEducation(edu.id)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={15} />
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input type="text" placeholder="Institution" style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} />
                        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                          <input type="text" placeholder="Degree" style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} />
                          <input type="text" placeholder="Field of Study" style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={edu.fieldOfStudy} onChange={e => updateEducation(edu.id, 'fieldOfStudy', e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                          <input type="text" placeholder="Start Date (e.g. 2020)" style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={edu.startDate || ''} onChange={e => updateEducation(edu.id, 'startDate', e.target.value)} />
                          <input type="text" placeholder="End / Grad Date (e.g. 2024)" style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={edu.endDate || edu.graduationDate || ''} onChange={e => {
                            updateEducation(edu.id, 'endDate', e.target.value);
                            updateEducation(edu.id, 'graduationDate', e.target.value);
                          }} />
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          <button disabled={index === 0} onClick={() => moveListItem('education', index, 'up')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer' }}>▲ Move Up</button>
                          <button disabled={index === builderData.education.length - 1} onClick={() => moveListItem('education', index, 'down')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer' }}>▼ Move Down</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div onClick={addEducation} style={{ padding: '12px', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, marginBottom: '20px' }}>
                  <Plus size={16} style={{ marginRight: '6px' }} /> Add Education
                </div>

                {/* Skills */}
                <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                  {builderData.skills.map(skill => (
                    <div key={skill.id} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '4px 12px' }}>
                      <input type="text" value={skill.name} onChange={e => updateSkill(skill.id, e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '80px', fontSize: '0.85rem' }} />
                      <button onClick={() => removeSkill(skill.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '4px', padding: '0', display: 'flex' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <div onClick={addSkill} style={{ padding: '8px 16px', border: '1px dashed var(--border-color)', borderRadius: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '20px' }}>
                  <Plus size={14} style={{ marginRight: '4px' }} /> Add Skill
                </div>

                {/* Tools & Software */}
                <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Tools & Software</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {(builderData.tools || []).map((tool, index) => (
                    <div key={tool.id} className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
                      <input type="text" placeholder="Tool Name" style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={tool.name} onChange={e => updateTool(tool.id, 'name', e.target.value)} />
                      <input type="number" placeholder="80" style={{ width: '80px', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={tool.percentage} onChange={e => updateTool(tool.id, 'percentage', parseInt(e.target.value) || 0)} min="0" max="100" />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>%</span>
                      <button onClick={() => removeTool(tool.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button disabled={index === 0} onClick={() => moveListItem('tools', index, 'up')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                        <button disabled={index === builderData.tools.length - 1} onClick={() => moveListItem('tools', index, 'down')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div onClick={addTool} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '20px' }}>
                  <Plus size={14} style={{ marginRight: '6px' }} /> Add Tool
                </div>

                {/* References */}
                <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>References</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
                  {(builderData.references || []).map((ref, index) => (
                    <div key={ref.id} className="premium-card" style={{ padding: '16px', position: 'relative' }}>
                      <button onClick={() => removeReference(ref.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" placeholder="Name" style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={ref.name} onChange={e => updateReference(ref.id, 'name', e.target.value)} />
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="text" placeholder="Title" style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={ref.title} onChange={e => updateReference(ref.id, 'title', e.target.value)} />
                          <input type="text" placeholder="Company" style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={ref.company} onChange={e => updateReference(ref.id, 'company', e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <input type="email" placeholder="Email" style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={ref.email} onChange={e => updateReference(ref.id, 'email', e.target.value)} />
                          <input type="text" placeholder="Phone" style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={ref.phone} onChange={e => updateReference(ref.id, 'phone', e.target.value)} />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <button disabled={index === 0} onClick={() => moveListItem('references', index, 'up')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲ Move Up</button>
                          <button disabled={index === builderData.references.length - 1} onClick={() => moveListItem('references', index, 'down')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼ Move Down</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div onClick={addReference} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '20px' }}>
                  <Plus size={14} style={{ marginRight: '6px' }} /> Add Reference
                </div>

                {/* Projects */}
                <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Projects</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
                  {(builderData.projects || []).map((proj, index) => (
                    <div key={proj.id} className="premium-card" style={{ padding: '16px', position: 'relative' }}>
                      <button onClick={() => removeProject(proj.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" placeholder="Project Name" style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={proj.name} onChange={e => updateProject(proj.id, 'name', e.target.value)} />
                        <input type="text" placeholder="Technologies Used" style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={proj.technologies || proj.techStack || ''} onChange={e => updateProject(proj.id, 'technologies', e.target.value)} />
                        <input type="text" placeholder="GitHub URL" style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={proj.url || ''} onChange={e => updateProject(proj.id, 'url', e.target.value)} />
                        <input type="text" placeholder="Portfolio URL" style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={proj.websiteUrl || ''} onChange={e => updateProject(proj.id, 'websiteUrl', e.target.value)} />
                        <textarea rows={3} placeholder="Description..." value={proj.description} onChange={e => updateProject(proj.id, 'description', e.target.value)} style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }} />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button disabled={index === 0} onClick={() => moveListItem('projects', index, 'up')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲ Move Up</button>
                          <button disabled={index === builderData.projects.length - 1} onClick={() => moveListItem('projects', index, 'down')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼ Move Down</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div onClick={addProject} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '20px' }}>
                  <Plus size={14} style={{ marginRight: '6px' }} /> Add Project
                </div>

                {/* Achievements */}
                <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Achievements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {(builderData.achievements || []).map((ach, index) => (
                    <div key={ach.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="text"
                        value={ach.name}
                        onChange={(e) => {
                          const newAchs = [...builderData.achievements];
                          newAchs[index].name = e.target.value;
                          setBuilderData({ ...builderData, achievements: newAchs });
                        }}
                        style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                        placeholder="E.g. Placed Top 10 in Hackathon"
                      />
                      <button
                        onClick={() => {
                          setBuilderData({
                            ...builderData,
                            achievements: builderData.achievements.filter(a => a.id !== ach.id)
                          });
                        }}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button disabled={index === 0} onClick={() => moveListItem('achievements', index, 'up')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                        <button disabled={index === builderData.achievements.length - 1} onClick={() => moveListItem('achievements', index, 'down')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div 
                  onClick={() => {
                    setBuilderData({
                      ...builderData,
                      achievements: [...(builderData.achievements || []), { id: Date.now().toString(), name: '' }]
                    });
                  }} 
                  style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '20px' }}
                >
                  <Plus size={14} style={{ marginRight: '6px' }} /> Add Achievement
                </div>

                {/* Soft Skills */}
                <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Soft Skills</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {(builderData.softSkills || []).map((skill, index) => (
                    <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="text" placeholder="Communication, Teamwork..." style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={skill.name} onChange={e => updateSoftSkill(skill.id, e.target.value)} />
                      <button onClick={() => removeSoftSkill(skill.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button disabled={index === 0} onClick={() => moveListItem('softSkills', index, 'up')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                        <button disabled={index === builderData.softSkills.length - 1} onClick={() => moveListItem('softSkills', index, 'down')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div onClick={addSoftSkill} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '20px' }}>
                  <Plus size={14} style={{ marginRight: '6px' }} /> Add Soft Skill
                </div>

                {/* Languages */}
                <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Languages</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {(builderData.languages || []).map((lang, index) => (
                    <div key={lang.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="text" placeholder="English, Spanish..." style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={lang.name} onChange={e => updateLanguage(lang.id, e.target.value)} />
                      <button onClick={() => removeLanguage(lang.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button disabled={index === 0} onClick={() => moveListItem('languages', index, 'up')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                        <button disabled={index === builderData.languages.length - 1} onClick={() => moveListItem('languages', index, 'down')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div onClick={addLanguage} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '20px' }}>
                  <Plus size={14} style={{ marginRight: '6px' }} /> Add Language
                </div>

                {/* Certifications */}
                <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Certifications</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {(builderData.certifications || []).map((cert, index) => (
                    <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="text" placeholder="AWS Certified, CSM..." style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={cert.name} onChange={e => updateCertification(cert.id, e.target.value)} />
                      <button onClick={() => removeCertification(cert.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button disabled={index === 0} onClick={() => moveListItem('certifications', index, 'up')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                        <button disabled={index === builderData.certifications.length - 1} onClick={() => moveListItem('certifications', index, 'down')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div onClick={addCertification} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '20px' }}>
                  <Plus size={14} style={{ marginRight: '6px' }} /> Add Certification
                </div>

                {/* Positions of Responsibility */}
                <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Positions of Responsibility</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
                  {(builderData.positionsOfResponsibility || []).map((pos, index) => (
                    <div key={pos.id} className="premium-card" style={{ padding: '16px', position: 'relative' }}>
                      <button onClick={() => removePositionsOfResponsibility(pos.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                        <Trash2 size={16} />
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input type="text" placeholder="Organization" style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={pos.organization} onChange={e => updatePositionsOfResponsibility(pos.id, 'organization', e.target.value)} />
                        <input type="text" placeholder="Role / Position" style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={pos.role} onChange={e => updatePositionsOfResponsibility(pos.id, 'role', e.target.value)} />
                        <input type="text" placeholder="Duration" style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={pos.duration} onChange={e => updatePositionsOfResponsibility(pos.id, 'duration', e.target.value)} />
                        <textarea rows={3} placeholder="Description..." value={pos.description} onChange={e => updatePositionsOfResponsibility(pos.id, 'description', e.target.value)} style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', minHeight: '80px', resize: 'vertical' }} />
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button disabled={index === 0} onClick={() => moveListItem('positionsOfResponsibility', index, 'up')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲ Move Up</button>
                          <button disabled={index === (builderData.positionsOfResponsibility || []).length - 1} onClick={() => moveListItem('positionsOfResponsibility', index, 'down')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼ Move Down</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div onClick={addPositionsOfResponsibility} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '20px' }}>
                  <Plus size={14} style={{ marginRight: '6px' }} /> Add Position of Responsibility
                </div>

                {/* Interests */}
                <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Interests</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {(builderData.interests || []).map((interest, index) => (
                    <div key={interest.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input type="text" placeholder="Reading, Coding, Chess..." style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }} value={interest.name} onChange={e => updateInterest(interest.id, e.target.value)} />
                      <button onClick={() => removeInterest(interest.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button disabled={index === 0} onClick={() => moveListItem('interests', index, 'up')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                        <button disabled={index === (builderData.interests || []).length - 1} onClick={() => moveListItem('interests', index, 'down')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div onClick={addInterest} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '20px' }}>
                  <Plus size={14} style={{ marginRight: '6px' }} /> Add Interest
                </div>

              </div>
            )}

            {activeTab === 'style' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '8px' }}>Theme Accent Color</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['#000000', '#2563EB', '#059669', '#7C3AED', '#DC2626', '#D97706', '#00e599', '#ec4899', '#14b8a6', '#64748b'].map(c => (
                      <div 
                        key={c}
                        onClick={() => setBuilderStyle({...builderStyle, themeColor: c})}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, cursor: 'pointer', border: builderStyle.themeColor === c ? '3px solid var(--text-primary)' : 'none' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div 
                  onClick={() => setBuilderTemplate('standard')}
                  style={{ padding: '16px', borderRadius: '12px', border: builderTemplate === 'standard' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', background: 'var(--bg-primary)', cursor: 'pointer' }}
                >
                  <h4 style={{ margin: '0 0 4px 0' }}>Classic ATS Standard</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Clean single column layout designed for 100% ATS parser compatibility.</p>
                </div>
                <div 
                  onClick={() => setBuilderTemplate('creative')}
                  style={{ padding: '16px', borderRadius: '12px', border: builderTemplate === 'creative' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', background: 'var(--bg-primary)', cursor: 'pointer' }}
                >
                  <h4 style={{ margin: '0 0 4px 0' }}>Executive Modern</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Two-column split view with prominent skill tags and header accent.</p>
                </div>
                <div 
                  onClick={() => setBuilderTemplate('academic')}
                  style={{ padding: '16px', borderRadius: '12px', border: builderTemplate === 'academic' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', background: 'var(--bg-primary)', cursor: 'pointer' }}
                >
                  <h4 style={{ margin: '0 0 4px 0' }}>Academic ATS</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Structured, classic academic styling with full width sections.</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => window.print()}
              style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'var(--accent-primary)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>

        {/* Right Preview */}
        <div style={{ 
          flex: 1, 
          height: '100%', 
          overflowY: 'auto', 
          background: '#e2e8f0', 
          padding: isMobile ? '16px 8px 80px 8px' : '40px 20px',
          display: isMobile ? (mobileTab === 'preview' ? 'flex' : 'none') : 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <div style={{ 
            maxWidth: '850px', 
            width: '100%',
            margin: '0 auto',
            height: isMobile ? `${1056 * Math.max(0.35, Math.min(1.0, (window.innerWidth - 32) / 816))}px` : 'auto',
            overflow: isMobile ? 'hidden' : 'visible'
          }}>
            {renderTemplate()}
          </div>
        </div>

      </div>
      </div>
    );
  }

  // STANDARD TAILORING WIZARD STEPS ('upload', 'analyzing', 'insights')
  return (
    <div style={{
      minHeight: '100vh',
      padding: '120px 24px 60px 24px',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      position: 'relative'
    }}>
      <div className="container" style={{ maxWidth: '960px', margin: '0 auto' }}>
        
        {/* Top Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '36px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button 
                onClick={() => navigate('/dashboard')}
                style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', cursor: 'pointer', padding: '8px 12px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 600 }}
              >
                <ChevronLeft size={18} /> Dashboard
              </button>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: 'var(--accent-glow)', color: 'var(--accent-primary)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                <Sparkles size={14} /> Full ATS Audit Report Page
              </div>
            </div>

            {step === 'insights' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setStep('upload')}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    padding: '8px 14px',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={14} /> Start New Scan
                </button>
                <button
                  onClick={handleCreateImpressiveResume}
                  style={{
                    background: 'var(--accent-primary)',
                    color: isGenz ? '#000' : '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={15} /> Open Resume Builder 🚀
                </button>
              </div>
            )}
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
            {step === 'insights' ? 'Full ATS Audit Insights' : 'Tailor Resume for Target Role'}
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
            {step === 'insights' 
              ? 'Comprehensive breakdown of ATS keyword match rates, content issues, and AI bullet point upgrades.'
              : 'Upload your existing resume & target Job Description. Our AI will audit errors, identify missing keywords, and build your tailored resume.'}
          </p>
        </motion.div>

        {/* STEP 1: UPLOAD RESUME & JOB DESCRIPTION */}
        {step === 'upload' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
          >
            {/* Demo prefill button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                onClick={fillSampleData}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px dashed var(--accent-primary)',
                  color: 'var(--accent-primary)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Zap size={15} /> Auto-Fill Sample Resume & Job Description
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* Card 1: Upload Existing Resume */}
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--accent-primary)' }}>
                    <Upload size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>1. Upload Your Resume</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>PDF, DOCX, Text, or Photo</span>
                  </div>
                </div>

                <div 
                  onClick={() => document.getElementById('resume-file-input')?.click()}
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: '14px',
                    padding: resumeImagePreview ? '16px' : '24px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--bg-primary)',
                    position: 'relative'
                  }}
                >
                  <input 
                    id="resume-file-input"
                    type="file" 
                    accept="image/*,.pdf,.docx,.txt,.png,.jpeg,.jpg,.webp"
                    onChange={e => e.target.files?.[0] && handleResumeFileSelect(e.target.files[0])}
                    style={{ display: 'none' }}
                  />

                  {resumeImagePreview ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <div style={{ position: 'relative', maxWidth: '200px', maxHeight: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img src={resumeImagePreview} alt="Resume Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button 
                          onClick={(evt) => {
                            evt.stopPropagation();
                            setResumeImagePreview(null);
                            setResumeFile(null);
                          }}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Camera size={14} /> Photo Resume Loaded
                      </span>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FileText size={26} color="var(--text-secondary)" />
                        <Image size={26} color="var(--accent-primary)" />
                      </div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: '0 0 4px 0' }}>
                        {resumeFile ? resumeFile.name : 'Click to Upload Resume File or Photo'}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Supports PDF, Word, PNG, JPG photos, text</span>
                    </>
                  )}
                </div>

                <textarea 
                  rows={5}
                  placeholder="Or paste your existing resume content here..."
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.85rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Card 2: Target Job Description */}
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '20px',
                padding: '24px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--accent-primary)' }}>
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>2. Target Job Description</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Role details, text, or JD photo</span>
                  </div>
                </div>

                <input 
                  type="text"
                  placeholder="Target Job Title (e.g. Senior Software Engineer)"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                />

                <div 
                  onClick={() => document.getElementById('jd-file-input')?.click()}
                  style={{
                    border: '1px dashed var(--border-color)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <input 
                    id="jd-file-input"
                    type="file" 
                    accept="image/*,.pdf,.docx,.txt,.png,.jpeg,.jpg,.webp"
                    onChange={e => e.target.files?.[0] && handleJobFileSelect(e.target.files[0])}
                    style={{ display: 'none' }}
                  />
                  <Camera size={16} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {jobImagePreview ? '📸 JD Photo Loaded' : jobFile ? jobFile.name : 'Upload JD Document or Screenshot'}
                  </span>
                </div>

                <textarea 
                  rows={6}
                  placeholder="Paste the target Job Description (responsibilities, required skills, key requirements)..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '0.85rem',
                    resize: 'vertical'
                  }}
                />
              </div>

            </div>

            <button 
              onClick={handleStartAnalysis}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                background: 'var(--accent-primary)',
                color: isGenz ? '#000' : '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 10px 30px rgba(37,99,235,0.25)',
                marginTop: '12px'
              }}
            >
              <Sparkles size={20} /> Analyze & Audit Resume Compatibility
            </button>
          </motion.div>
        )}

        {/* STEP 2: SCANNING / ANALYZING ANIMATION */}
        {step === 'analyzing' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              padding: '60px 40px',
              border: '1px solid var(--border-color)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px'
            }}
          >
            <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                style={{ width: '100%', height: '100%', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', position: 'absolute' }}
              />
              <Sparkles size={32} color="var(--accent-primary)" />
            </div>

            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Auditing Resume & Job Requirements</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{scanMessage}</p>
            </div>

            <div style={{ width: '100%', maxWidth: '400px', height: '8px', background: 'var(--bg-primary)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <motion.div 
                style={{ height: '100%', background: 'var(--accent-primary)', borderRadius: '4px' }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* STEP 3: DETAILED MISTAKES & MISSING KEYWORDS AUDIT */}
        {step === 'insights' && atsAnalysis && userResumeData && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}
          >
            {/* Header Score Overview */}
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: '24px',
              padding: '28px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px'
            }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {userResumeData.personalInfo.fullName}
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block' }}>Current ATS Score</span>
                  <strong style={{ fontSize: '2.5rem', fontWeight: 900, color: atsAnalysis.atsScore >= 80 ? '#10B981' : '#F59E0B' }}>
                    {atsAnalysis.atsScore}%
                  </strong>
                </div>
                <button 
                  onClick={handleCreateImpressiveResume}
                  style={{
                    background: 'var(--accent-primary)',
                    color: isGenz ? '#000' : '#fff',
                    border: 'none',
                    padding: '14px 24px',
                    borderRadius: '14px',
                    fontWeight: 700,
                    fontSize: '1rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 24px rgba(37,99,235,0.25)'
                  }}
                >
                  <Sparkles size={18} /> Open Resume Builder <ArrowRight size={18} />
                </button>
              </div>
            </div>

            {/* Identified Content Mistakes */}
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <AlertTriangle size={20} color="#F59E0B" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Identified Mistakes & Areas for Improvement</h3>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {atsAnalysis.contentMistakes.map((m, idx) => (
                  <div key={idx} style={{ flex: '1 1 calc(50% - 16px)', minWidth: '280px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: m.type === 'critical' ? '#EF4444' : '#F59E0B', fontWeight: 700 }}>
                      {m.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {m.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing vs Matching Keywords */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: '#EF4444' }}>
                  Missing Target Job Keywords ({atsAnalysis.missingKeywords.length})
                </h3>
                <p style={{ margin: '0 0 14px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Recommended areas to insert these missing keywords for maximum ATS selection chance:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {atsAnalysis.missingKeywords.map((kw, i) => {
                    const guidance = atsAnalysis.missingKeywordGuidance?.find(g => g.keyword.toLowerCase() === kw.toLowerCase());
                    const targetArea = guidance?.targetSection || 'Technical Skills';
                    const advice = guidance?.placementAdvice || `Add "${kw}" to ${targetArea} for maximum score impact.`;

                    return (
                      <div key={i} style={{ background: 'var(--bg-primary)', padding: '10px 14px', borderRadius: '10px', border: '1px solid #FECACA', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '3px 8px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                            + {kw}
                          </span>
                          <span style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', padding: '2px 8px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700 }}>
                            🎯 Target Area: {targetArea}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                          💡 {advice}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: 'var(--bg-secondary)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: '#10B981' }}>
                  Matching Keywords Found ({atsAnalysis.matchingKeywords.length})
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {atsAnalysis.matchingKeywords.map((kw, i) => (
                    <span key={i} style={{ background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {/* Unnecessary / Irrelevant Keywords & Fluff to Remove */}
            {atsAnalysis.unnecessaryKeywords && atsAnalysis.unnecessaryKeywords.length > 0 && (
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '20px', padding: '24px', border: '1px solid #FCA5A5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#DC2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ⚠️ Unnecessary / Irrelevant Keywords & Fluff to Remove ({atsAnalysis.unnecessaryKeywords.length})
                  </h3>
                  <span style={{ fontSize: '0.75rem', background: '#FEE2E2', color: '#991B1B', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                    ATS Density Cleaner
                  </span>
                </div>
                
                <p style={{ margin: '0 0 16px 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Our AI scanner pinpointed these terms in your resume. They are either overused clichés, weak passive phrases, or skills irrelevant to this target role. Removing them will sharpen your ATS focus.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {atsAnalysis.unnecessaryKeywords.map((item, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '3px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'line-through' }}>
                          ❌ {item.term}
                        </span>
                        {item.category && (
                          <span style={{ fontSize: '0.7rem', color: '#DC2626', background: '#FEE2E2', padding: '2px 8px', borderRadius: '10px', fontWeight: 600, textTransform: 'uppercase' }}>
                            {item.category.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        💡 {item.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Bullet Enhancements */}
            {atsAnalysis.bulletImprovements && atsAnalysis.bulletImprovements.filter(b => b.improved && b.improved.trim()).length > 0 && (
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    ✨ High-Impact Bullet Point Upgrades
                  </h3>
                  <span style={{ fontSize: '0.75rem', background: 'var(--accent-glow)', color: 'var(--accent-primary)', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                    ATS Optimized & Metric-Driven
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {atsAnalysis.bulletImprovements.filter(b => b.improved && b.improved.trim()).map((b, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-primary)', padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                      {b.original && b.original.trim() && (
                        <div style={{ marginBottom: '10px' }}>
                          <div style={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Original Input:</div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{b.original}"</p>
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.78rem', color: '#10B981', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Enhanced Version:</div>
                          <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>"{b.improved}"</p>
                          {b.reason && (
                            <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--accent-primary)', background: 'var(--accent-glow)', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', fontWeight: 500 }}>
                              💡 {b.reason}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(b.improved);
                            alert('Copied enhanced bullet point to clipboard!');
                          }}
                          style={{
                            background: 'var(--accent-glow)',
                            color: 'var(--accent-primary)',
                            border: '1px solid var(--accent-primary)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          📋 Copy Bullet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom CTA */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
              <button 
                onClick={handleCreateImpressiveResume}
                style={{
                  padding: '16px 36px',
                  borderRadius: '16px',
                  background: 'var(--accent-primary)',
                  color: isGenz ? '#000' : '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 10px 30px rgba(37,99,235,0.3)'
                }}
              >
                <Sparkles size={20} /> Open Builder to Edit & Save Resume
              </button>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
};

export default TailorPage;
