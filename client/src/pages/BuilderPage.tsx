import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronLeft, LayoutTemplate, Palette, FileText, Plus, Download, Trash2, 
  Upload, Wand2, CheckCircle2, FileUp, Save, Database, Loader2, Check, AlertCircle, X, Code2, AlertTriangle, Layers, Sparkles, Sliders, ExternalLink, Menu
} from 'lucide-react';
import type { ResumeData, ResumeStyle, TemplateId } from '../types/resume';
import { parseResumeText } from '../utils/resumeParser';
import { parseResumeFile } from '../utils/fileReader';
import { enhanceBulletText, enhanceProfessionalSummary, auditResumeLocally } from '../utils/resumeEnhancer';
import { getApiUrl } from '../utils/api';
import { generateDomainResume } from '../utils/domainResumeGenerator';

const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: 'Jane Doe',
    jobTitle: 'Senior Software Engineer',
    email: 'jane.doe@example.com',
    phone: '(555) 123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/janedoe',
    website: 'janedoe.dev',
    summary: 'Results-driven software engineer with 5+ years of experience architecting scalable web applications, optimizing performance, and delivering high-quality products.'
  },
  experience: [
    {
      id: '1',
      company: 'Tech Innovators Inc.',
      role: 'Lead Developer',
      startDate: '2020',
      endDate: 'Present',
      description: '• Spearheaded a team of 5 engineers to rebuild the core SaaS platform, reducing page latency by 40%.\n• Architected RESTful microservices and GraphQL APIs serving 100k+ active daily users.'
    }
  ],
  education: [
    {
      id: '1',
      institution: 'University of California, Berkeley',
      degree: 'B.S.',
      fieldOfStudy: 'Computer Science',
      graduationDate: '2016'
    }
  ],
  skills: [
    { id: '1', name: 'React' },
    { id: '2', name: 'TypeScript' },
    { id: '3', name: 'Node.js' }
  ],
  tools: [
    { id: '1', name: 'Photoshop', percentage: 90 },
    { id: '2', name: 'Illustrator', percentage: 85 }
  ],
  references: [
    { id: '1', name: 'Kyrie Petrakis', title: 'VP, Liceria & Co.', company: 'Liceria & Co.', email: 'hello@reallygreatsite.com', phone: '+123-456-7890' }
  ],
  projects: [],
  softSkills: [],
  languages: [],
  certifications: [],
  achievements: [],
  positionsOfResponsibility: [],
  interests: [],
  sectionOrder: ['summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references']
};

const initialStyle: ResumeStyle = {
  themeColor: '#00e599',
  fontFamily: 'Inter, sans-serif',
  fontSize: 'medium',
  spacing: 'normal',
  letterSpacing: 0,
  lineHeight: 1.4,
  sectionGap: 24,
  pagePadding: 40,
  headingWeight: '700',
  headingTransform: 'none',
  textAlign: 'left'
};

const BuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const savedResume = location.state?.resume;
  const isTailoringMode = Boolean(location.state?.atsAnalysis || location.state?.openAuditDrawer);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'templates'>('content');
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setIsLeftSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [data, setData] = useState<ResumeData>(savedResume ? {
    personalInfo: savedResume.personalInfo || initialResumeData.personalInfo,
    experience: savedResume.experience || [],
    education: savedResume.education || [],
    skills: savedResume.skills || [],
    tools: savedResume.tools || [],
    references: savedResume.references || [],
    projects: savedResume.projects || [],
    softSkills: savedResume.softSkills || [],
    languages: savedResume.languages || [],
    certifications: savedResume.certifications || [],
    achievements: savedResume.achievements || [],
    positionsOfResponsibility: savedResume.positionsOfResponsibility || [],
    interests: savedResume.interests || [],
    sectionOrder: savedResume.sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references']
  } : initialResumeData);
  const [style, setStyle] = useState<ResumeStyle>(savedResume?.style || initialStyle);
  const [template, setTemplate] = useState<TemplateId>(savedResume?.templateId || 'standard');

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');

  // MongoDB Save State
  const [resumeId, setResumeId] = useState<string | null>(savedResume?._id || null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  // A4 Sizing & Overflow Detection State
  const resumeContainerRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [estimatedPages, setEstimatedPages] = useState(1);
  const [isMultiPageMode, setIsMultiPageMode] = useState(false);

  const measureA4Overflow = () => {
    if (resumeContainerRef.current) {
      const scrollH = resumeContainerRef.current.scrollHeight;
      setContentHeight(scrollH);
      // Standard A4 single page height limit is ~1080px (including margins)
      const A4_PAGE_LIMIT = 1080;
      if (scrollH > A4_PAGE_LIMIT) {
        setIsOverflowing(true);
        setEstimatedPages(Math.ceil(scrollH / 1020));
      } else {
        setIsOverflowing(false);
        setEstimatedPages(1);
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      measureA4Overflow();
    }, 150);
    return () => clearTimeout(timer);
  }, [data, style, template]);

  const handleAutoFitToOnePage = () => {
    setStyle(prev => ({
      ...prev,
      fontSize: 'small',
      spacing: 'compact'
    }));
    setTimeout(() => {
      measureA4Overflow();
    }, 200);
  };


  const handleSaveToMongoDB = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please sign in or create an account to save your resume to MongoDB.');
      navigate('/auth');
      return;
    }

    setIsSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    try {
      const endpoint = resumeId
        ? getApiUrl(`/api/resumes/${resumeId}`)
        : getApiUrl('/api/resumes');
      const method = resumeId ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `${data.personalInfo.fullName || 'Untitled'} - ${data.personalInfo.jobTitle || 'Resume'}`,
          personalInfo: data.personalInfo,
          experience: data.experience,
          education: data.education,
          skills: data.skills,
          tools: data.tools,
          references: data.references,
          projects: data.projects,
          softSkills: data.softSkills,
          languages: data.languages,
          certifications: data.certifications,
          style: style,
          templateId: template,
          atsScore: qualityScore
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to save resume.');
      }

      if (resData.resume?._id) {
        setResumeId(resData.resume._id);
      }

      setSaveSuccessMsg('Resume Saved!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Save Resume Error:', err);
      setSaveErrorMsg(err.message || 'Failed to save resume.');
      setTimeout(() => setSaveErrorMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportText = () => {
    if (!importText.trim()) return;
    const parsed = parseResumeText(importText);
    setData(parsed);
    setShowImportModal(false);
    setImportText('');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const parsed = await parseResumeFile(file);
    setData(parsed);
    setShowImportModal(false);
  };


  const [isEnhancingSummary, setIsEnhancingSummary] = useState(false);
  const [enhancingBulletId, setEnhancingBulletId] = useState<string | null>(null);

  const initialAuditPayload = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('latestAtsAudit');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const [isAtsDrawerOpen, setIsAtsDrawerOpen] = useState<boolean>(() => {
    return Boolean(location.state?.openAuditDrawer || location.state?.atsAnalysis);
  });
  const [targetJobDescription, setTargetJobDescription] = useState<string>(() => {
    return location.state?.jobDescription || initialAuditPayload?.jobDescription || '';
  });
  const [isAuditing, setIsAuditing] = useState(false);
  const [atsAuditData, setAtsAuditData] = useState<any>(() => {
    return location.state?.atsAnalysis || initialAuditPayload?.atsAnalysis || null;
  });
  const [needsAudit, setNeedsAudit] = useState(false);

  const handleAddKeywordToSkills = (keyword: string) => {
    if (!keyword) return;
    if (data.skills.some(s => s.name.toLowerCase() === keyword.toLowerCase())) {
      alert(`"${keyword}" is already in your skills list!`);
      return;
    }
    const newSkill = { id: Date.now().toString(), name: keyword };
    setData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
    alert(`Added "${keyword}" to your Skills section!`);
    setNeedsAudit(true);
  };

  const handleAtsScan = async () => {
    if (!targetJobDescription) {
      alert('Please paste a Job Description first!');
      return;
    }
    setIsAuditing(true);
    let audit: any = null;
    try {
      const response = await fetch(getApiUrl('/api/ai/audit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          resumeData: data,
          jobTitle: data.personalInfo?.jobTitle || 'Professional',
          jobDescription: targetJobDescription
        })
      });
      if (response.ok) {
        audit = await response.json();
      }
    } catch (err) {
      console.warn('API error during ATS audit, using client engine:', err);
    }

    if (!audit) {
      audit = auditResumeLocally(data, data.personalInfo?.jobTitle || 'Professional', targetJobDescription);
    }

    setAtsAuditData(audit);
    localStorage.setItem('latestAtsAudit', JSON.stringify({
      atsAnalysis: audit,
      userResumeData: data,
      jobTitle: data.personalInfo?.jobTitle || 'Professional',
      jobDescription: targetJobDescription
    }));
    setIsAuditing(false);
  };

  useEffect(() => {
    if (needsAudit) {
      handleAtsScan();
      setNeedsAudit(false);
    }
  }, [needsAudit]);

  useEffect(() => {
    if (targetJobDescription && !atsAuditData && isTailoringMode) {
      handleAtsScan();
    }
  }, []);

  const handleOpenFullAuditPage = (inNewTab = false) => {
    const auditPayload = {
      atsAnalysis: atsAuditData,
      userResumeData: data,
      jobTitle: data.personalInfo?.jobTitle || 'Target Role',
      jobDescription: targetJobDescription
    };
    localStorage.setItem('latestAtsAudit', JSON.stringify(auditPayload));
    if (inNewTab) {
      window.open('/tailor', '_blank');
    } else {
      navigate('/tailor', { state: { atsAnalysis: atsAuditData, resume: data, jobTitle: data.personalInfo?.jobTitle || 'Target Role', jobDescription: targetJobDescription } });
    }
  };


  const handleEnhanceSummaryAI = async () => {
    if (!data?.personalInfo.summary) return;
    setIsEnhancingSummary(true);
    let enhanced = '';

    try {
      const response = await fetch(getApiUrl('/api/ai/enhance/summary'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          currentSummary: data.personalInfo.summary,
          jobTitle: data.personalInfo.jobTitle
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.enhancedSummary) {
          enhanced = result.enhancedSummary;
        }
      }
    } catch (err) {
      console.warn('API error in summary enhancement, using client engine:', err);
    }

    if (!enhanced) {
      enhanced = enhanceProfessionalSummary(
        data.personalInfo.summary,
        data.personalInfo.jobTitle,
        atsAuditData?.missingKeywords || []
      );
    }

    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, summary: enhanced }
    }));
    setIsEnhancingSummary(false);
  };

  const [enhancingProjectId, setEnhancingProjectId] = useState<string | null>(null);

  const handleEnhanceProjectAI = async (projId: string) => {
    const proj = data?.projects.find(p => p.id === projId);
    if (!proj) return;
    
    setEnhancingProjectId(projId);
    let enhanced = '';

    try {
      const response = await fetch(getApiUrl('/api/ai/enhance/bullet'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          bulletText: proj.description,
          role: proj.name // pass the project name as context
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.enhancedBullet) {
          enhanced = result.enhancedBullet;
        }
      }
    } catch (error) {
      console.warn('API error in project bullet enhancement, using client engine:', error);
    }

    if (!enhanced) {
      const bullets = (proj.description || '').split('\n').filter(Boolean);
      if (bullets.length === 0) {
        enhanced = enhanceBulletText(proj.name, proj.name, []);
      } else {
        enhanced = bullets.map(b => enhanceBulletText(b, proj.name, [])).join('\n');
      }
    }

    const updatedProj = data!.projects.map(p => 
      p.id === projId ? { ...p, description: enhanced } : p
    );
    setData(prev => ({ ...prev, projects: updatedProj }));
    setEnhancingProjectId(null);
  };

  const [suggestingTechProjectId, setSuggestingTechProjectId] = useState<string | null>(null);

  const handleSuggestProjectTechStack = async (projId: string) => {
    const proj = data?.projects.find(p => p.id === projId);
    if (!proj) return;

    setSuggestingTechProjectId(projId);
    let techStack = '';

    try {
      const response = await fetch(getApiUrl('/api/ai/suggest-project-techstack'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: proj.name,
          description: proj.description
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.techStack) {
          techStack = Array.isArray(result.techStack) ? result.techStack.join(', ') : result.techStack;
        }
      }
    } catch (error) {
      console.warn('API error in tech stack suggestion, using client engine:', error);
    }

    if (!techStack) {
      const name = (proj.name || '').toLowerCase();
      if (name.includes('data') || name.includes('analytics') || name.includes('dashboard') || name.includes('bi')) {
        techStack = 'SQL, Snowflake, dbt, Tableau, Python';
      } else if (name.includes('ios') || name.includes('swift') || name.includes('apple')) {
        techStack = 'Swift, SwiftUI, Combine, CoreData, Fastlane';
      } else if (name.includes('security') || name.includes('soc') || name.includes('bot')) {
        techStack = 'Python, Splunk, Wireshark, Docker, Linux';
      } else if (name.includes('seo') || name.includes('marketing') || name.includes('web')) {
        techStack = 'Technical SEO, GA4, Search Console, Lighthouse, Schema.org';
      } else {
        techStack = 'TypeScript, React 19, Node.js, PostgreSQL, Docker';
      }
    }

    const updatedProj = data!.projects.map(p => 
      p.id === projId ? { ...p, technologies: techStack, techStack } : p
    );
    setData(prev => ({ ...prev, projects: updatedProj }));
    setSuggestingTechProjectId(null);
  };


  const handleEnhanceBulletAI = async (expId: string) => {
    const exp = data?.experience.find(e => e.id === expId);
    if (!exp) return;
    
    setEnhancingBulletId(expId);
    let enhanced = '';

    try {
      const response = await fetch(getApiUrl('/api/ai/enhance/bullet'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          bulletText: exp.description,
          role: exp.role
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result.enhancedBullet) {
          enhanced = result.enhancedBullet;
        }
      }
    } catch (err) {
      console.warn('API error in bullet enhancement, using client engine:', err);
    }

    if (!enhanced) {
      const bullets = (exp.description || '').split('\n').filter(Boolean);
      if (bullets.length === 0) {
        enhanced = enhanceBulletText('', exp.role, atsAuditData?.missingKeywords || []);
      } else {
        enhanced = bullets.map(b => enhanceBulletText(b, exp.role, atsAuditData?.missingKeywords || [])).join('\n');
      }
    }

    const updatedExp = data!.experience.map(e => 
      e.id === expId ? { ...e, description: enhanced } : e
    );
    setData(prev => ({ ...prev, experience: updatedExp }));
    setEnhancingBulletId(null);
  };


  const addExperience = () => {
    setData({
      ...data,
      experience: [...data.experience, { id: Date.now().toString(), company: '', role: '', startDate: '', endDate: '', description: '' }]
    });
  };

  const updateExperience = (id: string, field: keyof typeof data.experience[0], value: string) => {
    setData({
      ...data,
      experience: data.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    });
  };

  const removeExperience = (id: string) => {
    setData({
      ...data,
      experience: data.experience.filter(exp => exp.id !== id)
    });
  };

  const addEducation = () => {
    setData({
      ...data,
      education: [...data.education, { id: Date.now().toString(), institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', graduationDate: '' }]
    });
  };

  const updateEducation = (id: string, field: keyof typeof data.education[0], value: string) => {
    setData({
      ...data,
      education: data.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    });
  };

  const removeEducation = (id: string) => {
    setData({
      ...data,
      education: data.education.filter(edu => edu.id !== id)
    });
  };

  const addSkill = () => {
    setData({
      ...data,
      skills: [...data.skills, { id: Date.now().toString(), name: '' }]
    });
  };

  const updateSkill = (id: string, name: string) => {
    setData({
      ...data,
      skills: data.skills.map(skill => skill.id === id ? { ...skill, name } : skill)
    });
  };

  const removeSkill = (id: string) => {
    setData({
      ...data,
      skills: data.skills.filter(skill => skill.id !== id)
    });
  };


  const addTool = () => {
    setData({
      ...data,
      tools: [...(data.tools || []), { id: Date.now().toString(), name: '', percentage: 50 }]
    });
  };

  const updateTool = (id: string, field: 'name' | 'percentage', value: string | number) => {
    setData({
      ...data,
      tools: (data.tools || []).map(tool => tool.id === id ? { ...tool, [field]: value } : tool)
    });
  };

  const removeTool = (id: string) => {
    setData({
      ...data,
      tools: (data.tools || []).filter(tool => tool.id !== id)
    });
  };


  const addProject = () => {
    if(!data) return;
    const newProject = { id: Date.now().toString(), name: '', url: '', description: '', startDate: '', endDate: '' };
    setData({ ...data, projects: [...(data.projects || []), newProject] });
  };
  const updateProject = (id: string, field: string, value: string) => {
    if(!data) return;
    setData({ ...data, projects: (data.projects || []).map(p => p.id === id ? { ...p, [field]: value } : p) });
  };
  const removeProject = (id: string) => {
    if(!data) return;
    setData({ ...data, projects: (data.projects || []).filter(p => p.id !== id) });
  };

  const addSoftSkill = () => {
    if(!data) return;
    setData({ ...data, softSkills: [...(data.softSkills || []), { id: Date.now().toString(), name: '' }] });
  };
  const updateSoftSkill = (id: string, value: string) => {
    if(!data) return;
    setData({ ...data, softSkills: (data.softSkills || []).map(s => s.id === id ? { ...s, name: value } : s) });
  };
  const removeSoftSkill = (id: string) => {
    if(!data) return;
    setData({ ...data, softSkills: (data.softSkills || []).filter(s => s.id !== id) });
  };

  const addLanguage = () => {
    if(!data) return;
    setData({ ...data, languages: [...(data.languages || []), { id: Date.now().toString(), name: '' }] });
  };
  const updateLanguage = (id: string, value: string) => {
    if(!data) return;
    setData({ ...data, languages: (data.languages || []).map(l => l.id === id ? { ...l, name: value } : l) });
  };
  const removeLanguage = (id: string) => {
    if(!data) return;
    setData({ ...data, languages: (data.languages || []).filter(l => l.id !== id) });
  };

  const addCertification = () => {
    if(!data) return;
    setData({ ...data, certifications: [...(data.certifications || []), { id: Date.now().toString(), name: '' }] });
  };
  const updateCertification = (id: string, value: string) => {
    if(!data) return;
    setData({ ...data, certifications: (data.certifications || []).map(c => c.id === id ? { ...c, name: value } : c) });
  };
  const removeCertification = (id: string) => {
    if(!data) return;
    setData({ ...data, certifications: (data.certifications || []).filter(c => c.id !== id) });
  };



  const addReference = () => {
    setData({
      ...data,
      references: [...(data.references || []), { id: Date.now().toString(), name: '', title: '', company: '', email: '', phone: '' }]
    });
  };

  const updateReference = (id: string, field: 'name' | 'title' | 'company' | 'email' | 'phone', value: string) => {
    setData({
      ...data,
      references: (data.references || []).map(ref => ref.id === id ? { ...ref, [field]: value } : ref)
    });
  };

  const removeReference = (id: string) => {
    setData({
      ...data,
      references: (data.references || []).filter(ref => ref.id !== id)
    });
  };

  const addPositionsOfResponsibility = () => {
    if (!data) return;
    setData({
      ...data,
      positionsOfResponsibility: [...(data.positionsOfResponsibility || []), { id: Date.now().toString(), role: '', organization: '', duration: '', description: '' }]
    });
  };

  const updatePositionsOfResponsibility = (id: string, field: 'role' | 'organization' | 'duration' | 'description', value: string) => {
    if (!data) return;
    setData({
      ...data,
      positionsOfResponsibility: (data.positionsOfResponsibility || []).map(pos => pos.id === id ? { ...pos, [field]: value } : pos)
    });
  };

  const removePositionsOfResponsibility = (id: string) => {
    if (!data) return;
    setData({
      ...data,
      positionsOfResponsibility: (data.positionsOfResponsibility || []).filter(pos => pos.id !== id)
    });
  };

  const addInterest = () => {
    if (!data) return;
    setData({ ...data, interests: [...(data.interests || []), { id: Date.now().toString(), name: '' }] });
  };

  const updateInterest = (id: string, value: string) => {
    if (!data) return;
    setData({ ...data, interests: (data.interests || []).map(i => i.id === id ? { ...i, name: value } : i) });
  };

  const removeInterest = (id: string) => {
    if (!data) return;
    setData({ ...data, interests: (data.interests || []).filter(i => i.id !== id) });
  };

  const moveListItem = (section: keyof ResumeData, index: number, direction: 'up' | 'down') => {
    if (!data) return;
    const array = [...(data[section] as any[])];
    if (direction === 'up' && index > 0) {
      const temp = array[index];
      array[index] = array[index - 1];
      array[index - 1] = temp;
    } else if (direction === 'down' && index < array.length - 1) {
      const temp = array[index];
      array[index] = array[index + 1];
      array[index + 1] = temp;
    }
    setData({ ...data, [section]: array });
  };

  const qualityScore = atsAuditData?.atsScore || 0;

  const renderTemplate = () => {
    const fontSizes = { small: '0.8rem', medium: '1rem', large: '1.2rem' };
    const effectiveFontSize = style.customFontSize ? `${style.customFontSize}px` : fontSizes[style.fontSize];
    const spacingModes = { compact: '12px', normal: `${style.sectionGap ?? 24}px`, relaxed: '36px' };
    const itemSpacing = { compact: '8px', normal: '16px', relaxed: '24px' };
    
    const wrapperStyle: React.CSSProperties = {
      fontFamily: style.fontFamily,
      fontSize: effectiveFontSize,
      letterSpacing: `${style.letterSpacing ?? 0}px`,
      lineHeight: style.lineHeight ?? 1.4,
      textAlign: (style.textAlign as any) || 'left',
      color: '#333',
      background: '#fff',
      padding: `${style.pagePadding ?? 40}px`,
      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      minHeight: '1123px',
      width: '794px',
      margin: '0 auto',
      transformOrigin: 'top center',
      transform: `scale(${isMobile ? Math.max(0.35, Math.min(1.0, (window.innerWidth - 32) / 794)) : 0.8})`,
      position: 'relative',
      boxSizing: 'border-box'
    };

    const renderPageBreakMarker = () => (
      (isOverflowing || isMultiPageMode) ? (
        <div
          className="a4-page-break-line no-print"
          style={{
            position: 'absolute',
            top: '1050px',
            left: 0,
            right: 0,
            borderTop: '2px dashed #ef4444',
            textAlign: 'center',
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
          <span style={{
            background: '#ef4444',
            color: '#fff',
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '4px 12px',
            borderRadius: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            ✂️ A4 Page 1 Max Limit — Page 2 Continues Below
          </span>
        </div>
      ) : null
    );

    if (template === 'standard') {
      return (
        <div className="print-container" ref={resumeContainerRef} style={wrapperStyle}>
          {renderPageBreakMarker()}
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: `2px solid ${style.themeColor}`, paddingBottom: spacingModes[style.spacing], marginBottom: spacingModes[style.spacing] }}>
            <h1 style={{ fontSize: '2.5em', margin: 0, color: '#111' }}>{data.personalInfo.fullName}</h1>
            <p style={{ fontSize: '1.2em', color: style.themeColor, margin: '4px 0', fontWeight: 600 }}>{data.personalInfo.jobTitle}</p>
            <p style={{ fontSize: '0.9em', color: '#666', margin: 0 }}>
              {data.personalInfo.email} | {data.personalInfo.phone} | {data.personalInfo.location}
            </p>
          </div>
          
          {/* Dynamic Sections */}
          {(data.sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references']).map(secId => {
            switch(secId) {
              case 'summary':
                return data.personalInfo.summary ? (
                  <div key="summary" style={{ marginBottom: spacingModes[style.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '8px' }}>Professional Summary</h2>
                    <p style={{ margin: 0, lineHeight: 1.6, color: '#444' }}>{data.personalInfo.summary}</p>
                  </div>
                ) : null;
              case 'education':
                return data.education && data.education.length > 0 ? (
                  <div key="education" style={{ marginBottom: spacingModes[style.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Education</h2>
                    {data.education.map((edu, index) => (
                      <div key={edu.id} style={{ marginBottom: index === data.education.length - 1 ? 0 : itemSpacing[style.spacing] }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                          <div style={{ fontWeight: 'bold' }}>{edu.institution}</div>
                          <div style={{ fontSize: '0.9em', color: '#666' }}>
                            {edu.startDate ? `${edu.startDate} - ${edu.endDate || edu.graduationDate}` : (edu.graduationDate ? `Graduated: ${edu.graduationDate}` : '')}
                          </div>
                        </div>
                        <div style={{ color: style.themeColor, fontWeight: 'bold' }}>{edu.degree}{edu.degree && edu.fieldOfStudy ? ' in ' : ''}{edu.fieldOfStudy}</div>
                      </div>
                    ))}
                  </div>
                ) : null;
              case 'experience':
                return data.experience && data.experience.length > 0 ? (
                  <div key="experience" style={{ marginBottom: spacingModes[style.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Work Experience</h2>
                    {data.experience.map((exp, index) => (
                      <div key={exp.id} style={{ marginBottom: index === data.experience.length - 1 ? 0 : itemSpacing[style.spacing] }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                          <span>{exp.role}</span>
                          <span style={{ color: '#666' }}>{exp.startDate} - {exp.endDate}</span>
                        </div>
                        <div style={{ color: style.themeColor, fontWeight: 'bold', marginBottom: '8px' }}>{exp.company}</div>
                        <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line', color: '#444' }}>{exp.description}</p>
                      </div>
                    ))}
                  </div>
                ) : null;
              case 'projects':
                return data.projects && data.projects.length > 0 ? (
                  <div key="projects" style={{ marginBottom: spacingModes[style.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Projects</h2>
                    {data.projects.map((proj, index) => (
                      <div key={proj.id} style={{ marginBottom: index === data.projects.length - 1 ? 0 : itemSpacing[style.spacing] }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                          <span>{proj.name}</span>
                          {(proj.url || proj.websiteUrl) && <a href={proj.url || proj.websiteUrl} style={{ color: style.themeColor, fontSize: '0.9em', textDecoration: 'none' }}>{proj.url || proj.websiteUrl}</a>}
                        </div>
                        {(proj.technologies || proj.techStack) && (
                          <div style={{ fontSize: '0.85em', color: style.themeColor, fontWeight: 600, marginBottom: '4px' }}>
                            <strong>Technologies:</strong> {proj.technologies || proj.techStack}
                          </div>
                        )}
                        <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line', color: '#444' }}>{proj.description}</p>
                      </div>
                    ))}
                  </div>
                ) : null;
              case 'skills':
                return (data.skills.length > 0 || (data.tools && data.tools.length > 0)) ? (
                  <div key="skills" style={{ marginBottom: spacingModes[style.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Technical Skills & Tools</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {data.skills.map(skill => (
                        <span key={skill.id} style={{ background: '#f5f5f5', padding: '4px 12px', borderRadius: '4px', fontSize: '0.9em', border: '1px solid #e2e8f0' }}>
                          {skill.name}
                        </span>
                      ))}
                      {(data.tools || []).map(tool => (
                        <span key={tool.id} style={{ background: '#eff6ff', color: style.themeColor, padding: '4px 12px', borderRadius: '4px', fontSize: '0.9em', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                          {tool.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'softSkills':
                return data.softSkills && data.softSkills.length > 0 ? (
                  <div key="softSkills" style={{ marginBottom: spacingModes[style.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Soft Skills</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {data.softSkills.map(skill => (
                        <span key={skill.id} style={{ background: '#faf5ff', color: '#701a75', padding: '4px 12px', borderRadius: '4px', fontSize: '0.9em', border: '1px solid #f5d0fe' }}>
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'languages':
                return data.languages && data.languages.length > 0 ? (
                  <div key="languages" style={{ marginBottom: spacingModes[style.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Languages</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                      {data.languages.map(lang => (
                        <span key={lang.id} style={{ fontSize: '0.95em', color: '#444' }}>
                          <strong>{lang.name}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'certifications':
                return data.certifications && data.certifications.length > 0 ? (
                  <div key="certifications" style={{ marginBottom: spacingModes[style.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Certifications</h2>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#444', lineHeight: 1.6 }}>
                      {data.certifications.map(cert => (
                        <li key={cert.id} style={{ marginBottom: '4px' }}>{cert.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              case 'achievements':
                return data.achievements && data.achievements.length > 0 ? (
                  <div key="achievements" style={{ marginBottom: spacingModes[style.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Achievements</h2>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#444', lineHeight: 1.6 }}>
                      {data.achievements.map(ach => (
                        <li key={ach.id} style={{ marginBottom: '4px' }}>{ach.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              case 'positionsOfResponsibility':
                return data.positionsOfResponsibility && data.positionsOfResponsibility.length > 0 ? (
                  <div key="positionsOfResponsibility" style={{ marginBottom: spacingModes[style.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Positions of Responsibility</h2>
                    {data.positionsOfResponsibility.map((pos, index) => (
                      <div key={pos.id} style={{ marginBottom: index === data.positionsOfResponsibility.length - 1 ? 0 : itemSpacing[style.spacing] }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                          <span>{pos.role}</span>
                          <span style={{ color: '#666', fontWeight: 500 }}>{pos.duration}</span>
                        </div>
                        <div style={{ color: style.themeColor, fontWeight: 'bold', marginBottom: '4px' }}>{pos.organization}</div>
                        <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-line', color: '#444' }}>{pos.description}</p>
                      </div>
                    ))}
                  </div>
                ) : null;
              case 'interests':
                return data.interests && data.interests.length > 0 ? (
                  <div key="interests" style={{ marginBottom: spacingModes[style.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>Interests</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {data.interests.map(i => (
                        <span key={i.id} style={{ background: '#f8fafc', padding: '4px 12px', borderRadius: '4px', fontSize: '0.9em', border: '1px solid #e2e8f0', color: '#475569' }}>
                          {i.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'references':
                return data.references && data.references.length > 0 ? (
                  <div key="references" style={{ marginBottom: spacingModes[style.spacing] }}>
                    <h2 style={{ fontSize: '1.2em', color: '#111', textTransform: 'uppercase', marginBottom: '12px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>References</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      {data.references.map(ref => (
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
    
    
    if (template === 'academic') {
      return (
        <div className="print-container" ref={resumeContainerRef} style={{ ...wrapperStyle, padding: '40px', background: '#fff', color: '#000' }}>
          {renderPageBreakMarker()}
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '2.5em', fontWeight: 'bold', margin: '0 0 8px 0', letterSpacing: '1px' }}>{data.personalInfo.fullName}</h1>
            <h2 style={{ fontSize: '1.2em', fontWeight: 'normal', margin: '0 0 12px 0', fontStyle: 'italic' }}>{data.personalInfo.jobTitle}</h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.9em', color: '#333' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>✉️</span> {data.personalInfo.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>📞</span> {data.personalInfo.phone}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px' }}>📍</span> {data.personalInfo.location}
              </div>
              {data.personalInfo.linkedin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '14px' }}>🔗</span> {data.personalInfo.linkedin}
                </div>
              )}
              {data.personalInfo.github && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '14px' }}>🐙</span> {data.personalInfo.github}
                </div>
              )}
              {data.personalInfo.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '14px' }}>🌐</span> {data.personalInfo.website}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Sections */}
          {(data.sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references']).map(secId => {
            switch(secId) {
              case 'summary':
                return data.personalInfo.summary ? (
                  <div key="summary" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${style.themeColor}`, paddingBottom: '4px' }}>Summary</h3>
                    <p style={{ margin: 0, fontSize: '0.95em', lineHeight: 1.5 }}>{data.personalInfo.summary}</p>
                  </div>
                ) : null;
              case 'education':
                return data.education && data.education.length > 0 ? (
                  <div key="education" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${style.themeColor}`, paddingBottom: '4px' }}>Education</h3>
                    {data.education.map(edu => (
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
                return data.experience && data.experience.length > 0 ? (
                  <div key="experience" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${style.themeColor}`, paddingBottom: '4px' }}>Work Experience</h3>
                    {data.experience.map(exp => (
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
                return data.projects && data.projects.length > 0 ? (
                  <div key="projects" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${style.themeColor}`, paddingBottom: '4px' }}>Projects</h3>
                    {data.projects.map(proj => (
                      <div key={proj.id} style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                          <strong style={{ fontSize: '1em' }}>{proj.name}</strong>
                        </div>
                        {(proj.technologies || proj.techStack) && (
                          <div style={{ fontSize: '0.85em', color: style.themeColor, fontWeight: 600, marginBottom: '4px' }}>
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
                return (data.skills.length > 0 || (data.tools && data.tools.length > 0)) ? (
                  <div key="skills" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${style.themeColor}`, paddingBottom: '4px' }}>Technical Skills</h3>
                    <div style={{ fontSize: '0.95em', lineHeight: 1.5 }}>
                      {data.skills.length > 0 && (
                        <div style={{ marginBottom: '4px' }}>
                          <strong style={{ marginRight: '8px' }}>Core Skills:</strong>
                          <span>{data.skills.map(s => s.name).join(', ')}</span>
                        </div>
                      )}
                      {data.tools && data.tools.length > 0 && (
                        <div>
                          <strong style={{ marginRight: '8px' }}>Tools & Software:</strong>
                          <span>{data.tools.map(t => t.name).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null;
              case 'softSkills':
                return data.softSkills && data.softSkills.length > 0 ? (
                  <div key="softSkills" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${style.themeColor}`, paddingBottom: '4px' }}>Soft Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.95em' }}>
                      {data.softSkills.map(skill => (
                        <span key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></span>
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'languages':
                return data.languages && data.languages.length > 0 ? (
                  <div key="languages" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${style.themeColor}`, paddingBottom: '4px' }}>Languages</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.95em' }}>
                      {data.languages.map(lang => (
                        <span key={lang.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></span>
                          {lang.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'certifications':
                return data.certifications && data.certifications.length > 0 ? (
                  <div key="certifications" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${style.themeColor}`, paddingBottom: '4px' }}>Certifications</h3>
                    <ul style={{ margin: 0, padding: 0, paddingLeft: '16px', listStyleType: 'disc', fontSize: '0.95em' }}>
                      {data.certifications.map(cert => (
                        <li key={cert.id} style={{ marginBottom: '4px' }}>{cert.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              case 'achievements':
                return data.achievements && data.achievements.length > 0 ? (
                  <div key="achievements" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${style.themeColor}`, paddingBottom: '4px' }}>Achievements</h3>
                    <ul style={{ margin: 0, padding: 0, paddingLeft: '16px', listStyleType: 'disc', fontSize: '0.95em' }}>
                      {data.achievements.map(ach => (
                        <li key={ach.id} style={{ marginBottom: '4px' }}>{ach.name}</li>
                      ))}
                    </ul>
                  </div>
                ) : null;
              case 'positionsOfResponsibility':
                return data.positionsOfResponsibility && data.positionsOfResponsibility.length > 0 ? (
                  <div key="positionsOfResponsibility" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${style.themeColor}`, paddingBottom: '4px' }}>Positions of Responsibility</h3>
                    {data.positionsOfResponsibility.map((pos, index) => (
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
                return data.interests && data.interests.length > 0 ? (
                  <div key="interests" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${style.themeColor}`, paddingBottom: '4px' }}>Interests</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '0.95em' }}>
                      {data.interests.map(i => (
                        <span key={i.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></span>
                          {i.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null;
              case 'references':
                return data.references && data.references.length > 0 ? (
                  <div key="references" style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1em', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 8px 0', borderBottom: `1px solid ${style.themeColor}`, paddingBottom: '4px' }}>References</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                       {data.references.map(ref => (
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
    if (template === 'minimalist') {
      return (
        <div className="print-container" ref={resumeContainerRef} style={wrapperStyle}>
          {renderPageBreakMarker()}
          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ width: '30%' }}>
              <h1 style={{ fontSize: '2em', fontWeight: 300, margin: '0 0 8px 0', lineHeight: 1.1 }}>{data.personalInfo.fullName}</h1>
              <p style={{ color: style.themeColor, fontWeight: 'bold', marginBottom: '24px' }}>{data.personalInfo.jobTitle}</p>
              
              <div style={{ fontSize: '0.9em', color: '#555', marginBottom: '32px' }}>
                <div style={{ marginBottom: '4px' }}>{data.personalInfo.email}</div>
                <div style={{ marginBottom: '4px' }}>{data.personalInfo.phone}</div>
                <div>{data.personalInfo.location}</div>
              </div>

              {/* Soft Skills */}
              {data.softSkills && data.softSkills.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '12px' }}>Soft Skills</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em', color: '#555' }}>
                    {data.softSkills.map(skill => (
                      <li key={skill.id} style={{ marginBottom: '4px' }}>{skill.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Languages */}
              {data.languages && data.languages.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '12px' }}>Languages</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em', color: '#555' }}>
                    {data.languages.map(lang => (
                      <li key={lang.id} style={{ marginBottom: '4px' }}>{lang.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interests */}
              {data.interests && data.interests.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '12px' }}>Interests</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em', color: '#555' }}>
                    {data.interests.map(i => (
                      <li key={i.id} style={{ marginBottom: '4px' }}>{i.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div style={{ width: '70%' }}>
              {/* Dynamic Right Column Sections */}
              {(data.sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'achievements', 'positionsOfResponsibility', 'references'])
                .filter(secId => ['summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'achievements', 'positionsOfResponsibility', 'references'].includes(secId))
                .map(secId => {
                  switch(secId) {
                    case 'summary':
                      return data.personalInfo.summary ? (
                        <p key="summary" style={{ fontStyle: 'italic', color: '#666', marginBottom: '32px', lineHeight: 1.6 }}>{data.personalInfo.summary}</p>
                      ) : null;
                    case 'experience':
                      return data.experience && data.experience.length > 0 ? (
                        <div key="experience" style={{ marginBottom: '32px' }}>
                          <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Experience</h3>
                          {data.experience.map(exp => (
                            <div key={exp.id} style={{ marginBottom: '24px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                <strong style={{ fontSize: '1.1em' }}>{exp.role}</strong>
                                <span style={{ fontSize: '0.9em', color: '#888' }}>{exp.startDate} - {exp.endDate}</span>
                              </div>
                              <div style={{ color: style.themeColor, marginBottom: '8px' }}>{exp.company}</div>
                              <p style={{ margin: 0, color: '#444', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{exp.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : null;
                    case 'projects':
                      return data.projects && data.projects.length > 0 ? (
                        <div key="projects" style={{ marginBottom: '32px' }}>
                          <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Projects</h3>
                          {data.projects.map(proj => (
                            <div key={proj.id} style={{ marginBottom: '20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                <strong style={{ fontSize: '1.05em' }}>{proj.name}</strong>
                                {(proj.url || proj.websiteUrl) && <a href={proj.url || proj.websiteUrl} style={{ color: style.themeColor, fontSize: '0.85em', textDecoration: 'none' }}>{proj.url || proj.websiteUrl}</a>}
                              </div>
                              {(proj.technologies || proj.techStack) && (
                                <div style={{ fontSize: '0.85em', color: style.themeColor, fontWeight: 600, marginBottom: '4px' }}>
                                  <strong>Technologies:</strong> {proj.technologies || proj.techStack}
                                </div>
                              )}
                              <p style={{ margin: 0, color: '#444', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{proj.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : null;
                    case 'skills':
                      return (data.skills.length > 0 || (data.tools && data.tools.length > 0)) ? (
                        <div key="skills" style={{ marginBottom: '32px' }}>
                          <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Technical Skills & Tools</h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {data.skills.map(skill => (
                              <span key={skill.id} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85em' }}>
                                {skill.name}
                              </span>
                            ))}
                            {(data.tools || []).map(tool => (
                              <span key={tool.id} style={{ background: '#eff6ff', color: style.themeColor, border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 600 }}>
                                {tool.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    case 'education':
                      return data.education && data.education.length > 0 ? (
                        <div key="education" style={{ marginBottom: '32px' }}>
                          <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Education</h3>
                          {data.education.map(edu => (
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
                      return data.certifications && data.certifications.length > 0 ? (
                        <div key="certifications" style={{ marginBottom: '32px' }}>
                          <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Certifications</h3>
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em', color: '#444' }}>
                            {data.certifications.map(cert => (
                              <li key={cert.id} style={{ marginBottom: '4px' }}>{cert.name}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null;
                    case 'achievements':
                      return data.achievements && data.achievements.length > 0 ? (
                        <div key="achievements" style={{ marginBottom: '32px' }}>
                          <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Achievements</h3>
                          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em', color: '#444' }}>
                            {data.achievements.map(ach => (
                              <li key={ach.id} style={{ marginBottom: '4px' }}>{ach.name}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null;
                    case 'positionsOfResponsibility':
                      return data.positionsOfResponsibility && data.positionsOfResponsibility.length > 0 ? (
                        <div key="positionsOfResponsibility" style={{ marginBottom: '32px' }}>
                          <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>Positions of Responsibility</h3>
                          {data.positionsOfResponsibility.map(pos => (
                            <div key={pos.id} style={{ marginBottom: '20px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                                <strong style={{ fontSize: '1.05em' }}>{pos.role}</strong>
                                <span style={{ fontSize: '0.9em', color: '#888' }}>{pos.duration}</span>
                              </div>
                              <div style={{ color: style.themeColor, marginBottom: '6px' }}>{pos.organization}</div>
                              <p style={{ margin: 0, color: '#444', lineHeight: 1.5, whiteSpace: 'pre-line' }}>{pos.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : null;
                    case 'references':
                      return data.references && data.references.length > 0 ? (
                        <div key="references" style={{ marginBottom: '32px' }}>
                          <h3 style={{ fontSize: '1em', letterSpacing: '1px', textTransform: 'uppercase', borderBottom: '1px solid #ddd', paddingBottom: '4px', marginBottom: '16px' }}>References</h3>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
                            {data.references.map(ref => (
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
        </div>
      );
    }
    
    return (
      <div className="print-container" ref={resumeContainerRef} style={{ ...wrapperStyle, padding: 0, display: 'flex', background: '#fff' }}>
        {renderPageBreakMarker()}
        {/* Left Column */}
        <div style={{ width: '35%', background: style.themeColor, color: '#fff', padding: '40px 30px', boxSizing: 'border-box' }}>
          {/* Profile Photo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', padding: '8px' }}>
              {data.personalInfo.photoUrl ? (
                <img src={data.personalInfo.photoUrl} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
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
                <span style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.themeColor, fontSize: '12px' }}>📞</span>
                <span>{data.personalInfo.phone}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.themeColor, fontSize: '12px' }}>✉️</span>
                <span style={{ wordBreak: 'break-all' }}>{data.personalInfo.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', height: '24px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.themeColor, fontSize: '12px' }}>📍</span>
                <span>{data.personalInfo.location}</span>
              </div>
            </div>
          </div>

          {/* Soft Skills */}
          {data.softSkills && data.softSkills.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>Soft Skills</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em' }}>
                {data.softSkills.map(skill => (
                  <li key={skill.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></span>
                    {skill.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>Languages</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em' }}>
                {data.languages.map(lang => (
                  <li key={lang.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '6px', height: '6px', background: '#fff', borderRadius: '50%' }}></span>
                    {lang.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interests */}
          {data.interests && data.interests.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>Interests</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9em' }}>
                {data.interests.map(i => (
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
              {data.personalInfo.fullName.split(' ')[0]} <span style={{ fontWeight: 300 }}>{data.personalInfo.fullName.split(' ').slice(1).join(' ')}</span>
            </h1>
            <h2 style={{ margin: '10px 0 0 0', fontSize: '1.4em', letterSpacing: '4px', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>
              {data.personalInfo.jobTitle}
            </h2>
          </div>

          {/* Dynamic Right Column Sections */}
          {(data.sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'achievements', 'positionsOfResponsibility', 'references'])
            .filter(secId => ['summary', 'education', 'experience', 'projects', 'skills', 'certifications', 'achievements', 'positionsOfResponsibility', 'references'].includes(secId))
            .map(secId => {
              switch(secId) {
                case 'summary':
                  return data.personalInfo.summary ? (
                    <div key="summary" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '12px' }}>Profile Info</h3>
                      <p style={{ margin: 0, color: '#555', lineHeight: 1.6, fontSize: '0.95em' }}>
                        {data.personalInfo.summary}
                      </p>
                    </div>
                  ) : null;
                case 'education':
                  return data.education && data.education.length > 0 ? (
                    <div key="education" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Education</h3>
                      {data.education.map(edu => (
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
                  return data.experience && data.experience.length > 0 ? (
                    <div key="experience" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Experience</h3>
                      {data.experience.map(exp => (
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
                  return data.projects && data.projects.length > 0 ? (
                    <div key="projects" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Projects</h3>
                      {data.projects.map(proj => (
                        <div key={proj.id} style={{ marginBottom: '18px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '1.05em', color: '#333' }}>{proj.name}</strong>
                            {(proj.url || proj.websiteUrl) && <a href={proj.url || proj.websiteUrl} style={{ color: style.themeColor, fontSize: '0.85em', textDecoration: 'none' }}>{proj.url || proj.websiteUrl}</a>}
                          </div>
                          {(proj.technologies || proj.techStack) && (
                            <div style={{ fontSize: '0.85em', color: style.themeColor, fontWeight: 600, marginBottom: '4px' }}>
                              <strong>Technologies:</strong> {proj.technologies || proj.techStack}
                            </div>
                          )}
                          <p style={{ margin: 0, color: '#555', fontSize: '0.9em', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : null;
                case 'skills':
                  return (data.skills.length > 0 || (data.tools && data.tools.length > 0)) ? (
                    <div key="skills" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Technical Skills & Tools</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {data.skills.map(skill => (
                          <span key={skill.id} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 500 }}>
                            {skill.name}
                          </span>
                        ))}
                        {(data.tools || []).map(tool => (
                          <span key={tool.id} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: style.themeColor, padding: '4px 10px', borderRadius: '4px', fontSize: '0.85em', fontWeight: 600 }}>
                            {tool.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null;
                case 'certifications':
                  return data.certifications && data.certifications.length > 0 ? (
                    <div key="certifications" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Certifications</h3>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em', color: '#555', lineHeight: 1.6 }}>
                        {data.certifications.map(cert => (
                          <li key={cert.id} style={{ marginBottom: '4px' }}>{cert.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                case 'achievements':
                  return data.achievements && data.achievements.length > 0 ? (
                    <div key="achievements" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Achievements</h3>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9em', color: '#555', lineHeight: 1.6 }}>
                        {data.achievements.map(ach => (
                          <li key={ach.id} style={{ marginBottom: '4px' }}>{ach.name}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null;
                case 'positionsOfResponsibility':
                  return data.positionsOfResponsibility && data.positionsOfResponsibility.length > 0 ? (
                    <div key="positionsOfResponsibility" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Positions of Responsibility</h3>
                      {data.positionsOfResponsibility.map(pos => (
                        <div key={pos.id} style={{ marginBottom: '20px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '1.05em', color: '#333' }}>{pos.role}</strong>
                            <span style={{ fontSize: '0.9em', color: '#888', fontWeight: 'bold' }}>{pos.duration}</span>
                          </div>
                          <div style={{ color: style.themeColor, fontStyle: 'italic', marginBottom: '6px' }}>{pos.organization}</div>
                          <p style={{ margin: 0, color: '#555', fontSize: '0.95em', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{pos.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : null;
                case 'references':
                  return data.references && data.references.length > 0 ? (
                    <div key="references" style={{ marginBottom: '30px' }}>
                      <h3 style={{ fontSize: '1.2em', letterSpacing: '2px', textTransform: 'uppercase', color: '#333', marginBottom: '16px' }}>Reference</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                        {data.references.map(ref => (
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
        width: isMobile ? (mobileTab === 'editor' ? '100%' : '0px') : (isLeftSidebarOpen ? '420px' : '0px'), 
        minWidth: isMobile ? (mobileTab === 'editor' ? '100%' : '0px') : (isLeftSidebarOpen ? '420px' : '0px'),
        overflow: 'hidden',
        height: '100%', 
        background: 'var(--bg-secondary)', 
        borderRight: (isMobile || !isLeftSidebarOpen) ? 'none' : '1px solid var(--border-color)',
        display: isMobile ? (mobileTab === 'editor' ? 'flex' : 'none') : 'flex',
        flexDirection: 'column',
        zIndex: 20,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => {
                if (isTailoringMode) {
                  handleOpenFullAuditPage(false);
                } else {
                  navigate('/dashboard');
                }
              }} 
              title={isTailoringMode ? "Back to Full ATS Audit Results Page" : "Back to Dashboard"} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ChevronLeft size={22} />
            </button>
            <h2 style={{ fontSize: '1.025rem', fontWeight: 700, margin: 0 }}>ATS Builder</h2>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => setShowImportModal(true)}
              style={{
                background: 'var(--accent-glow)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileUp size={14} /> Import
            </button>

            <button 
              onClick={() => setIsLeftSidebarOpen(false)}
              title="Hide Control Panel"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
          <button 
            onClick={() => setActiveTab('content')}
            style={{ flex: 1, padding: '14px 0', background: 'transparent', border: 'none', color: activeTab === 'content' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600, borderBottom: activeTab === 'content' ? '2px solid var(--accent-primary)' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <FileText size={18} /> Content
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            style={{ flex: 1, padding: '14px 0', background: 'transparent', border: 'none', color: activeTab === 'templates' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600, borderBottom: activeTab === 'templates' ? '2px solid var(--accent-primary)' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <LayoutTemplate size={18} /> Templates
          </button>
          <button 
            onClick={() => setActiveTab('style')}
            style={{ flex: 1, padding: '14px 0', background: 'transparent', border: 'none', color: activeTab === 'style' ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600, borderBottom: activeTab === 'style' ? '2px solid var(--accent-primary)' : '2px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Palette size={18} /> Styling
          </button>
        </div>

        {/* Scrollable Control Panel */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          
          {activeTab === 'content' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Section Ordering Panel */}
              <h3 style={{ marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Section Layout Order</h3>
              <div className="premium-card" style={{ padding: '16px', marginBottom: '24px' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Customize the order in which sections appear on your resume.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(data.sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references']).map((secId, index) => {
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
                      const order = [...(data.sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references'])];
                      if (toIndex < 0 || toIndex >= order.length) return;
                      const temp = order[fromIndex];
                      order[fromIndex] = order[toIndex];
                      order[toIndex] = temp;
                      setData({ ...data, sectionOrder: order });
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

              {/* 1-Click Role & Domain Auto-Fill */}
              <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(0, 229, 153, 0.05)', border: '1px solid rgba(0, 229, 153, 0.2)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} /> 1-Click Role & Skills Auto-Fill
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { label: '📊 Data Analyst & BI', title: 'Data Analyst & BI Specialist' },
                    { label: '🐍 Python Backend', title: 'Python Backend Engineer' },
                    { label: '📱 iOS Developer', title: 'iOS Software Engineer' },
                    { label: '🛡️ Cybersecurity', title: 'SOC Cybersecurity Analyst' },
                    { label: '📈 Technical SEO', title: 'Technical SEO Specialist' },
                    { label: '⚡ DevOps / Cloud', title: 'DevOps & Cloud Engineer' },
                    { label: '💻 Full Stack', title: 'Full Stack Software Engineer' }
                  ].map(r => (
                    <button
                      key={r.title}
                      type="button"
                      onClick={() => {
                        const newResume = generateDomainResume(r.title, '', 'mid');
                        setData(newResume);
                      }}
                      style={{
                        padding: '5px 10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '20px',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.color = 'var(--accent-primary)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Personal Details</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={data.personalInfo.fullName}
                  onChange={e => setData({...data, personalInfo: {...data.personalInfo, fullName: e.target.value}})}
                  style={{ width: '100%', padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px', outline: 'none' }}
                />
                <input 
                  type="text" 
                  placeholder="Profile Photo URL (Optional)" 
                  className="premium-input"
                  value={data.personalInfo.photoUrl || ''}
                  onChange={e => setData({...data, personalInfo: {...data.personalInfo, photoUrl: e.target.value}})}
                />
                <input 
                  type="text" 
                  placeholder="Job Title" 
                  className="premium-input"
                  value={data.personalInfo.jobTitle}
                  onChange={e => setData({...data, personalInfo: {...data.personalInfo, jobTitle: e.target.value}})}
                />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="premium-input"
                  value={data.personalInfo.email}
                  onChange={e => setData({...data, personalInfo: {...data.personalInfo, email: e.target.value}})}
                />
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <input 
                    type="text" 
                    placeholder="Phone Number" 
                    className="premium-input"
                    value={data.personalInfo.phone}
                    onChange={e => setData({...data, personalInfo: {...data.personalInfo, phone: e.target.value}})}
                  />
                  <input 
                    type="text" 
                    placeholder="Location" 
                    className="premium-input"
                    value={data.personalInfo.location}
                    onChange={e => setData({...data, personalInfo: {...data.personalInfo, location: e.target.value}})}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                  <input 
                    type="text" 
                    placeholder="LinkedIn URL" 
                    className="premium-input"
                    value={data.personalInfo.linkedin || ''}
                    onChange={e => setData({...data, personalInfo: {...data.personalInfo, linkedin: e.target.value}})}
                  />
                  
                  <input 
                    type="text" 
                    placeholder="GitHub URL" 
                    className="premium-input"
                    value={data.personalInfo.github || ''}
                    onChange={e => setData({...data, personalInfo: {...data.personalInfo, github: e.target.value}})}
                    style={{ flex: 1, padding: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '8px' }}
                  />
<input 
                    type="text" 
                    placeholder="Portfolio URL" 
                    className="premium-input"
                    value={data.personalInfo.website || ''}
                    onChange={e => setData({...data, personalInfo: {...data.personalInfo, website: e.target.value}})}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea 
                    placeholder="Professional Summary" 
                    rows={3}
                    className="premium-textarea"
                    value={data.personalInfo.summary}
                    onChange={e => setData({...data, personalInfo: {...data.personalInfo, summary: e.target.value}})}
                    style={{ minHeight: '100px', resize: 'vertical' }}
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

              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Work Experience</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="premium-card" style={{ padding: '20px', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{index + 1}</div>
                      {exp.company ? exp.company : 'New Experience'}
                    </div>
                    <button onClick={() => removeExperience(exp.id)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
                      <Trash2 size={15} />
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input type="text" placeholder="Company" className="premium-input" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} />
                      <input type="text" placeholder="Role" className="premium-input" value={exp.role} onChange={e => updateExperience(exp.id, 'role', e.target.value)} />
                      <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                        <input type="text" placeholder="Start Date" className="premium-input" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} />
                        <input type="text" placeholder="End Date" className="premium-input" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <textarea 
                          rows={4}
                          className="premium-textarea"
                          placeholder="Bullet Points & Accomplishments..." 
                          value={exp.description} 
                          onChange={e => updateExperience(exp.id, 'description', e.target.value)} 
                          style={{ minHeight: '100px', resize: 'vertical' }} 
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button disabled={index === 0} onClick={() => moveListItem('experience', index, 'up')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer' }}>▲ Move Up</button>
                            <button disabled={index === data.experience.length - 1} onClick={() => moveListItem('experience', index, 'down')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer' }}>▼ Move Down</button>
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
                              gap: '4px',
                              transition: 'var(--transition-smooth)'
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
              <div onClick={addExperience} style={{ padding: '12px', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}>
                <Plus size={16} style={{ marginRight: '6px' }} /> Add Experience
              </div>

              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Education</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
                {data.education.map((edu, index) => (
                  <div key={edu.id} className="premium-card" style={{ padding: '20px', marginBottom: '16px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '16px', color: 'var(--accent-primary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{index + 1}</div>
                      {edu.institution ? edu.institution : 'New Education'}
                    </div>
                    <button onClick={() => removeEducation(edu.id)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
                      <Trash2 size={15} />
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input type="text" placeholder="Institution" className="premium-input" value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} />
                      <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                        <input type="text" placeholder="Degree" className="premium-input" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} />
                        <input type="text" placeholder="Field of Study" className="premium-input" value={edu.fieldOfStudy} onChange={e => updateEducation(edu.id, 'fieldOfStudy', e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                        <input type="text" placeholder="Start Date (e.g. 2020)" className="premium-input" value={edu.startDate || ''} onChange={e => updateEducation(edu.id, 'startDate', e.target.value)} />
                        <input type="text" placeholder="End / Grad Date (e.g. 2024)" className="premium-input" value={edu.endDate || edu.graduationDate || ''} onChange={e => {
                          updateEducation(edu.id, 'endDate', e.target.value);
                          updateEducation(edu.id, 'graduationDate', e.target.value);
                        }} />
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                        <button disabled={index === 0} onClick={() => moveListItem('education', index, 'up')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer' }}>▲ Move Up</button>
                        <button disabled={index === data.education.length - 1} onClick={() => moveListItem('education', index, 'down')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '6px', cursor: 'pointer' }}>▼ Move Down</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div onClick={addEducation} style={{ padding: '12px', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}>
                <Plus size={16} style={{ marginRight: '6px' }} /> Add Education
              </div>

              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Skills</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                {data.skills.map(skill => (
                  <div key={skill.id} style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '4px 12px' }}>
                    <input type="text" value={skill.name} onChange={e => updateSkill(skill.id, e.target.value)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '80px', fontSize: '0.85rem' }} />
                    <button onClick={() => removeSkill(skill.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', marginLeft: '4px', padding: '0', display: 'flex' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div onClick={addSkill} style={{ padding: '8px 16px', border: '1px dashed var(--border-color)', borderRadius: '24px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                <Plus size={14} style={{ marginRight: '4px' }} /> Add Skill
              </div>
              
              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Tools & Software</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {(data.tools || []).map((tool, index) => (
                  <div key={tool.id} className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
                    <input type="text" placeholder="Tool Name" className="premium-input" value={tool.name} onChange={e => updateTool(tool.id, 'name', e.target.value)} style={{ flex: 1 }} />
                    <input type="number" placeholder="80" className="premium-input" value={tool.percentage} onChange={e => updateTool(tool.id, 'percentage', parseInt(e.target.value) || 0)} style={{ width: '80px' }} min="0" max="100" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>%</span>
                    <button onClick={() => removeTool(tool.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button disabled={index === 0} onClick={() => moveListItem('tools', index, 'up')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                      <button disabled={index === data.tools.length - 1} onClick={() => moveListItem('tools', index, 'down')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
              <div onClick={addTool} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                <Plus size={14} style={{ marginRight: '6px' }} /> Add Tool
              </div>

              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>References</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
                {(data.references || []).map((ref, index) => (
                  <div key={ref.id} className="premium-card" style={{ padding: '16px', position: 'relative' }}>
                    <button onClick={() => removeReference(ref.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input type="text" placeholder="Name" className="premium-input" value={ref.name} onChange={e => updateReference(ref.id, 'name', e.target.value)} />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" placeholder="Title" className="premium-input" value={ref.title} onChange={e => updateReference(ref.id, 'title', e.target.value)} />
                        <input type="text" placeholder="Company" className="premium-input" value={ref.company} onChange={e => updateReference(ref.id, 'company', e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="email" placeholder="Email" className="premium-input" value={ref.email} onChange={e => updateReference(ref.id, 'email', e.target.value)} />
                        <input type="text" placeholder="Phone" className="premium-input" value={ref.phone} onChange={e => updateReference(ref.id, 'phone', e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button disabled={index === 0} onClick={() => moveListItem('references', index, 'up')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲ Move Up</button>
                        <button disabled={index === data.references.length - 1} onClick={() => moveListItem('references', index, 'down')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼ Move Down</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div onClick={addReference} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                <Plus size={14} style={{ marginRight: '6px' }} /> Add Reference
              </div>

              {/* Projects */}
              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Projects</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
                {(data.projects || []).map((proj, index) => (
                  <div key={proj.id} className="premium-card" style={{ padding: '16px', position: 'relative' }}>
                    <button onClick={() => removeProject(proj.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input type="text" placeholder="Project Name" className="premium-input" value={proj.name} onChange={e => updateProject(proj.id, 'name', e.target.value)} />
                      <input type="text" placeholder="Tech Stack / Technologies Used (e.g. HTML5, CSS3, React, Node.js)" className="premium-input" value={proj.technologies || proj.techStack || ''} onChange={e => updateProject(proj.id, 'technologies', e.target.value)} />
                      <input type="text" placeholder="GitHub URL" className="premium-input" value={proj.url || ''} onChange={e => updateProject(proj.id, 'url', e.target.value)} />
                      <input type="text" placeholder="Portfolio URL" className="premium-input" value={proj.websiteUrl || ''} onChange={e => updateProject(proj.id, 'websiteUrl', e.target.value)} />
                      <div style={{ display: 'flex', gap: '10px' }}>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <textarea rows={3} className="premium-textarea" placeholder="Description..." value={proj.description} onChange={e => updateProject(proj.id, 'description', e.target.value)} style={{ minHeight: '80px', resize: 'vertical', width: '100%' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button disabled={index === 0} onClick={() => moveListItem('projects', index, 'up')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲ Move Up</button>
                            <button disabled={index === data.projects.length - 1} onClick={() => moveListItem('projects', index, 'down')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼ Move Down</button>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => handleSuggestProjectTechStack(proj.id)}
                              disabled={suggestingTechProjectId === proj.id || (!proj.name && !proj.description)}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--accent-primary)',
                                color: 'var(--accent-primary)',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: (suggestingTechProjectId === proj.id || (!proj.name && !proj.description)) ? 'not-allowed' : 'pointer',
                                opacity: (suggestingTechProjectId === proj.id || (!proj.name && !proj.description)) ? 0.5 : 1
                              }}
                            >
                              {suggestingTechProjectId === proj.id ? <Loader2 size={12} className="animate-spin" /> : <Code2 size={12} />}
                              {suggestingTechProjectId === proj.id ? 'Detecting...' : 'Ask Tech Stack'}
                            </button>
                            <button
                              onClick={() => handleEnhanceProjectAI(proj.id)}
                              disabled={enhancingProjectId === proj.id || !proj.description}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--accent-primary)',
                                color: 'var(--accent-primary)',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                cursor: (enhancingProjectId === proj.id || !proj.description) ? 'not-allowed' : 'pointer',
                                opacity: (enhancingProjectId === proj.id || !proj.description) ? 0.5 : 1
                              }}
                            >
                              {enhancingProjectId === proj.id ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                              {enhancingProjectId === proj.id ? 'Enhancing...' : 'Enhance Description'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div onClick={addProject} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                <Plus size={14} style={{ marginRight: '6px' }} /> Add Project
              </div>

              {/* Achievements */}
              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Achievements</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {(data.achievements || []).map((ach, index) => (
                  <div key={ach.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="text"
                      value={ach.name}
                      onChange={(e) => {
                        const newAchs = [...data.achievements];
                        newAchs[index].name = e.target.value;
                        setData({ ...data, achievements: newAchs });
                      }}
                      className="premium-input"
                      placeholder="E.g. Placed Top 10 in Hackathon"
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => {
                        setData({
                          ...data,
                          achievements: data.achievements.filter(a => a.id !== ach.id)
                        });
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button disabled={index === 0} onClick={() => moveListItem('achievements', index, 'up')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                      <button disabled={index === data.achievements.length - 1} onClick={() => moveListItem('achievements', index, 'down')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
              <div 
                onClick={() => {
                  setData({
                    ...data,
                    achievements: [...(data.achievements || []), { id: Date.now().toString(), name: '' }]
                  });
                }} 
                style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
              >
                <Plus size={14} style={{ marginRight: '6px' }} /> Add Achievement
              </div>

              {/* Soft Skills */}
              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Soft Skills</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {(data.softSkills || []).map((skill, index) => (
                  <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="text" placeholder="Communication, Teamwork..." className="premium-input" value={skill.name} onChange={e => updateSoftSkill(skill.id, e.target.value)} style={{ flex: 1 }} />
                    <button onClick={() => removeSoftSkill(skill.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button disabled={index === 0} onClick={() => moveListItem('softSkills', index, 'up')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                      <button disabled={index === data.softSkills.length - 1} onClick={() => moveListItem('softSkills', index, 'down')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
              <div onClick={addSoftSkill} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                <Plus size={14} style={{ marginRight: '6px' }} /> Add Soft Skill
              </div>

              {/* Languages */}
              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Languages</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {(data.languages || []).map((lang, index) => (
                  <div key={lang.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="text" placeholder="English, Spanish..." className="premium-input" value={lang.name} onChange={e => updateLanguage(lang.id, e.target.value)} style={{ flex: 1 }} />
                    <button onClick={() => removeLanguage(lang.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button disabled={index === 0} onClick={() => moveListItem('languages', index, 'up')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                      <button disabled={index === data.languages.length - 1} onClick={() => moveListItem('languages', index, 'down')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
              <div onClick={addLanguage} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                <Plus size={14} style={{ marginRight: '6px' }} /> Add Language
              </div>

              {/* Certifications */}
              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Certifications</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {(data.certifications || []).map((cert, index) => (
                  <div key={cert.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="text" placeholder="AWS Certified, CSM..." className="premium-input" value={cert.name} onChange={e => updateCertification(cert.id, e.target.value)} style={{ flex: 1 }} />
                    <button onClick={() => removeCertification(cert.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button disabled={index === 0} onClick={() => moveListItem('certifications', index, 'up')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                      <button disabled={index === data.certifications.length - 1} onClick={() => moveListItem('certifications', index, 'down')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
              <div onClick={addCertification} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '14px' }}>
                <Plus size={14} style={{ marginRight: '6px' }} /> Add Certification
              </div>

              {/* Positions of Responsibility */}
              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Positions of Responsibility</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '14px' }}>
                {(data.positionsOfResponsibility || []).map((pos, index) => (
                  <div key={pos.id} className="premium-card" style={{ padding: '16px', position: 'relative' }}>
                    <button onClick={() => removePositionsOfResponsibility(pos.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                      <Trash2 size={16} />
                    </button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input type="text" placeholder="Organization" className="premium-input" value={pos.organization} onChange={e => updatePositionsOfResponsibility(pos.id, 'organization', e.target.value)} />
                      <input type="text" placeholder="Role / Position" className="premium-input" value={pos.role} onChange={e => updatePositionsOfResponsibility(pos.id, 'role', e.target.value)} />
                      <input type="text" placeholder="Duration (e.g. 2021 - 2022)" className="premium-input" value={pos.duration} onChange={e => updatePositionsOfResponsibility(pos.id, 'duration', e.target.value)} />
                      <textarea rows={3} className="premium-textarea" placeholder="Description..." value={pos.description} onChange={e => updatePositionsOfResponsibility(pos.id, 'description', e.target.value)} style={{ minHeight: '80px', resize: 'vertical', width: '100%' }} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button disabled={index === 0} onClick={() => moveListItem('positionsOfResponsibility', index, 'up')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲ Move Up</button>
                        <button disabled={index === (data.positionsOfResponsibility || []).length - 1} onClick={() => moveListItem('positionsOfResponsibility', index, 'down')} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼ Move Down</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div onClick={addPositionsOfResponsibility} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '14px' }}>
                <Plus size={14} style={{ marginRight: '6px' }} /> Add Position of Responsibility
              </div>

              {/* Interests */}
              <h3 style={{ marginTop: '28px', marginBottom: '14px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Interests</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {(data.interests || []).map((interest, index) => (
                  <div key={interest.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input type="text" placeholder="Reading, Coding, Chess..." className="premium-input" value={interest.name} onChange={e => updateInterest(interest.id, e.target.value)} style={{ flex: 1 }} />
                    <button onClick={() => removeInterest(interest.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                      <Trash2 size={16} />
                    </button>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button disabled={index === 0} onClick={() => moveListItem('interests', index, 'up')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▲</button>
                      <button disabled={index === (data.interests || []).length - 1} onClick={() => moveListItem('interests', index, 'down')} style={{ padding: '2px 6px', fontSize: '0.7rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}>▼</button>
                    </div>
                  </div>
                ))}
              </div>
              <div onClick={addInterest} style={{ padding: '10px', border: '1px dashed var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', marginBottom: '14px' }}>
                <Plus size={14} style={{ marginRight: '6px' }} /> Add Interest
              </div>

            </motion.div>
          )}

          {activeTab === 'templates' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
               <div 
                onClick={() => setTemplate('standard')}
                style={{ padding: '16px', border: template === 'standard' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', background: template === 'standard' ? 'var(--bg-primary)' : 'transparent' }}
               >
                 <h4 style={{ margin: '0 0 4px 0', fontSize: '1em' }}>Standard ATS</h4>
                 <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Clean single-column gold standard for ATS parsers.</p>
               </div>
               
               <div 
                onClick={() => setTemplate('minimalist')}
                style={{ padding: '16px', border: template === 'minimalist' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', background: template === 'minimalist' ? 'var(--bg-primary)' : 'transparent' }}
               >
                 <h4 style={{ margin: '0 0 4px 0', fontSize: '1em' }}>Executive Minimalist</h4>
                 <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Split sidebar layout for leadership & senior roles.</p>
               </div>

               <div 
                onClick={() => setTemplate('creative')}
                style={{ padding: '16px', border: template === 'creative' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', background: template === 'creative' ? 'var(--bg-primary)' : 'transparent' }}
               >
                 <h4 style={{ margin: '0 0 4px 0', fontSize: '1em' }}>Modern Creative</h4>
                 <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Color accented modern card layout.</p>
               </div>

               <div 
                onClick={() => setTemplate('academic')}
                style={{ padding: '16px', border: template === 'academic' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', borderRadius: '12px', cursor: 'pointer', background: template === 'academic' ? 'var(--bg-primary)' : 'transparent' }}
               >
                 <h4 style={{ margin: '0 0 4px 0', fontSize: '1em' }}>Academic ATS</h4>
                 <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Structured, classic academic styling with full width sections.</p>
               </div>
            </motion.div>
          )}

          {activeTab === 'style' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Canva Accent Color Picker */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Accent Color</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{style.themeColor}</span>
                    <input
                      type="color"
                      value={style.themeColor || '#00e599'}
                      onChange={e => setStyle({ ...style, themeColor: e.target.value })}
                      style={{ width: '28px', height: '28px', border: 'none', borderRadius: '50%', cursor: 'pointer', background: 'transparent' }}
                      title="Custom Color Picker"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['#000000', '#00e599', '#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#14b8a6', '#dc2626', '#64748b'].map(color => (
                    <div 
                      key={color}
                      onClick={() => setStyle({ ...style, themeColor: color })}
                      style={{ 
                        width: '28px', 
                        height: '28px', 
                        borderRadius: '50%', 
                        background: color, 
                        cursor: 'pointer',
                        boxShadow: style.themeColor === color ? '0 0 0 2px var(--bg-primary), 0 0 0 4px var(--accent-primary)' : 'none',
                        transition: 'transform 0.15s ease'
                      }} 
                    />
                  ))}
                </div>
              </div>

              {/* Font Family Selector */}
              <div>
                <h4 style={{ marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Font Family</h4>
                <select 
                  value={style.fontFamily}
                  onChange={e => setStyle({ ...style, fontFamily: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: '10px', fontWeight: 500 }}
                >
                  <option value="Inter, sans-serif">Inter (Modern Clean Sans)</option>
                  <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Executive)</option>
                  <option value="Merriweather, serif">Merriweather (Classic Editorial Serif)</option>
                  <option value="'Roboto Mono', monospace">Roboto Mono (Developer & Tech)</option>
                  <option value="'Outfit', sans-serif">Outfit (Geometrical GenZ)</option>
                </select>
              </div>

              {/* Font Size Presets */}
              <div>
                <h4 style={{ marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Overall Size Scale</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {(['small', 'medium', 'large'] as const).map(sz => (
                    <button
                      key={sz}
                      onClick={() => setStyle({ ...style, fontSize: sz })}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: style.fontSize === sz ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        background: style.fontSize === sz ? 'var(--accent-glow)' : 'var(--bg-primary)',
                        color: style.fontSize === sz ? 'var(--accent-primary)' : 'var(--text-primary)',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Canva Micro Adjustment Controls */}
              <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={16} color="var(--accent-primary)" /> Canva Adjustments
                  </h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>Granular Controls</span>
                </div>
                {/* 🔠 Canva Font Size Adjustment */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <span>🔠 Font Size</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        onClick={() => setStyle({ ...style, customFontSize: Math.max(10, (style.customFontSize || 14) - 1) })}
                        style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        -
                      </button>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 700, minWidth: '36px', textAlign: 'center' }}>
                        {style.customFontSize || 14}px
                      </span>
                      <button
                        onClick={() => setStyle({ ...style, customFontSize: Math.min(26, (style.customFontSize || 14) + 1) })}
                        style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="26"
                    step="1"
                    value={style.customFontSize || 14}
                    onChange={e => setStyle({ ...style, customFontSize: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <span>10px (Compact)</span>
                    <span>14px (Standard)</span>
                    <span>26px (Large)</span>
                  </div>
                </div>

                {/* 🔤 Letter Spacing (Tracking) Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <span>🔤 Letter Spacing (Gap)</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{style.letterSpacing ?? 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="-1"
                    max="5"
                    step="0.5"
                    value={style.letterSpacing ?? 0}
                    onChange={e => setStyle({ ...style, letterSpacing: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <span>Tight (-1px)</span>
                    <span>Normal (0px)</span>
                    <span>Wide (+5px)</span>
                  </div>
                </div>

                {/* ↕️ Line Height (Leading) Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <span>↕️ Line Height (Line Gap)</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{style.lineHeight ?? 1.4}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="2.2"
                    step="0.05"
                    value={style.lineHeight ?? 1.4}
                    onChange={e => setStyle({ ...style, lineHeight: parseFloat(e.target.value) })}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <span>Compact (1.0)</span>
                    <span>Standard (1.4)</span>
                    <span>Relaxed (2.2)</span>
                  </div>
                </div>

                {/* 📐 Section Gap Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <span>📐 Section Gap</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{style.sectionGap ?? 24}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="48"
                    step="2"
                    value={style.sectionGap ?? 24}
                    onChange={e => setStyle({ ...style, sectionGap: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <span>Tight (8px)</span>
                    <span>Medium (24px)</span>
                    <span>Spacious (48px)</span>
                  </div>
                </div>

                {/* 📄 Page Margin / Padding Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    <span>📄 Page Margin (Padding)</span>
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{style.pagePadding ?? 40}px</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="60"
                    step="4"
                    value={style.pagePadding ?? 40}
                    onChange={e => setStyle({ ...style, pagePadding: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <span>Narrow (20px)</span>
                    <span>Standard (40px)</span>
                    <span>Wide (60px)</span>
                  </div>
                </div>

                {/* ↔️ Text Alignment Options */}
                <div>
                  <h5 style={{ margin: '0 0 8px 0', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)' }}>↔️ Text Alignment</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                    {(['left', 'center', 'justify'] as const).map(align => (
                      <button
                        key={align}
                        onClick={() => setStyle({ ...style, textAlign: align })}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: style.textAlign === align ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                          background: style.textAlign === align ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                          color: style.textAlign === align ? 'var(--accent-primary)' : 'var(--text-primary)',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          textTransform: 'capitalize',
                          cursor: 'pointer'
                        }}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

        </div>

      </div>

      {/* Floating Hamburger Open Button when left control panel is collapsed */}
      {!isLeftSidebarOpen && (
        <button
          onClick={() => setIsLeftSidebarOpen(true)}
          className="no-print"
          title="Show Control Panel"
          style={{
            position: 'fixed',
            left: '20px',
            top: '20px',
            zIndex: 40,
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.12)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <Menu size={20} color="var(--accent-primary)" />
        </button>
      )}

      {/* Right Side - Live Preview & ATS Quality Score */}
      <div style={{ 
        flex: 1, 
        background: '#e0e5ec', 
        position: 'relative', 
        overflowY: 'auto',
        display: isMobile ? (mobileTab === 'preview' ? 'flex' : 'none') : 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isMobile ? '16px 8px 80px 8px' : '30px 40px 80px 40px'
      }}>
        
        {/* Header Bar with Live Score & Download */}
        <div className="no-print" style={{
          width: '100%',
          maxWidth: '816px',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          gap: isMobile ? '12px' : '0',
          justifyContent: 'space-between',
          marginBottom: '20px',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          padding: '12px 20px',
          borderRadius: '16px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.06)'
        }}>
          {isTailoringMode ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Live ATS Quality Score:</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: qualityScore >= 80 ? '#059669' : '#D97706', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={18} /> {qualityScore}%
              </span>
              <button 
                onClick={() => setIsAtsDrawerOpen(true)}
                style={{
                  marginLeft: '16px',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Wand2 size={14} /> ATS Insights
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Resume Workspace</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {saveSuccessMsg && <span style={{ color: '#059669', fontSize: '0.9rem', fontWeight: 600 }}>{saveSuccessMsg}</span>}
            {saveErrorMsg && <span style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>{saveErrorMsg}</span>}
            
            <button 
              onClick={handleAutoFitToOnePage}
              title="Automatically adjust font size and spacing to fit on 1 A4 page"
              style={{
                background: 'rgba(255,255,255,0.9)',
                color: '#059669',
                border: '1px solid #a7f3d0',
                padding: '10px 16px',
                borderRadius: '20px',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(16,185,129,0.15)'
              }}
            >
              <Sparkles size={15} /> Auto-Fit A4
            </button>

            <button 
              onClick={handleSaveToMongoDB}
              disabled={isSaving}
              style={{
                background: '#10b981',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '20px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(16,185,129,0.3)'
              }}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save'}
            </button>

            <button 
              onClick={() => window.print()}
              style={{
                background: 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '20px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
              }}
            >
              <Download size={16} /> Export PDF
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={template + style.themeColor + style.fontFamily}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            style={{
              height: isMobile ? `${1123 * Math.max(0.35, Math.min(1.0, (window.innerWidth - 32) / 794))}px` : 'auto',
              overflow: isMobile ? 'hidden' : 'visible'
            }}
          >
            {renderTemplate()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* IMPORT RESUME MODAL */}
      {showImportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            padding: '28px',
            width: '100%',
            maxWidth: '560px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Import Existing Resume</h3>
              <button onClick={() => setShowImportModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '20px', textAlign: 'center', background: 'var(--bg-primary)' }}>
              <Upload size={28} color="var(--accent-primary)" style={{ marginBottom: '8px' }} />
              <p style={{ margin: '0 0 6px 0', fontWeight: 600, fontSize: '0.9rem' }}>Upload Resume File (PDF, DOCX, TXT)</p>
              <input type="file" accept=".pdf,.docx,.txt" onChange={handleImportFile} style={{ display: 'none' }} id="builder-file-upload" />
              <button onClick={() => document.getElementById('builder-file-upload')?.click()} style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                Select File
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>- OR -</p>

            <textarea 
              rows={6}
              placeholder="Paste your existing resume text here..."
              value={importText}
              onChange={e => setImportText(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowImportModal(false)} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleImportText} style={{ background: 'var(--accent-primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}>
                Parse & Populate Resume
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Floating Side Button to re-open ATS Insights Drawer anytime */}
      {isTailoringMode && !isAtsDrawerOpen && (
        <button
          onClick={() => setIsAtsDrawerOpen(true)}
          className="no-print"
          title="Open ATS Audit Insights & Keyword Matching Drawer"
          style={{
            position: 'fixed',
            right: 0,
            top: '40%',
            transform: 'translateY(-50%)',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff',
            border: 'none',
            borderTopLeftRadius: '14px',
            borderBottomLeftRadius: '14px',
            padding: '14px 18px',
            boxShadow: '-4px 6px 25px rgba(99, 102, 241, 0.45)',
            cursor: 'pointer',
            zIndex: 999,
            fontWeight: 800,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease-in-out'
          }}
        >
          <Wand2 size={18} /> 📊 ATS Audit Insights
        </button>
      )}

      {/* ATS Insights Sliding Drawer */}
      {isTailoringMode && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: isAtsDrawerOpen ? 0 : '-500px',
          width: '460px',
          height: '100vh',
          background: 'var(--bg-secondary)',
          boxShadow: '-6px 0 30px rgba(0,0,0,0.2)',
          transition: 'right 0.3s ease-in-out',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--border-color)'
        }}>
        {/* Drawer Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wand2 size={20} color="var(--accent-primary)" />
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ATS Audit Insights
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={() => handleOpenFullAuditPage(false)} 
              title="Navigate to the full ATS Audit page"
              style={{
                background: 'var(--accent-glow)',
                color: 'var(--accent-primary)',
                border: '1px solid var(--accent-primary)',
                padding: '5px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ⬅️ Full Audit Page
            </button>

            <button 
              onClick={() => handleOpenFullAuditPage(true)} 
              title="Open full ATS Audit in a new browser tab"
              style={{
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                padding: '5px 8px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <ExternalLink size={13} />
            </button>

            <button onClick={() => setIsAtsDrawerOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Target Job Description
            </label>
            <textarea
              value={targetJobDescription}
              onChange={(e) => setTargetJobDescription(e.target.value)}
              placeholder="Paste Job Description to run real-time keyword matching..."
              style={{
                width: '100%',
                height: '100px',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                resize: 'vertical',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            />
            <button
              onClick={handleAtsScan}
              disabled={isAuditing}
              style={{
                width: '100%',
                padding: '10px',
                background: isAuditing ? 'var(--border-color)' : 'var(--accent-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: isAuditing ? 'not-allowed' : 'pointer'
              }}
            >
              {isAuditing ? 'Auditing Resume...' : '⚡ Re-Analyze ATS Score'}
            </button>
          </div>

          {atsAuditData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* ATS Score Card */}
              <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', textAlign: 'center', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block' }}>ATS Score</span>
                  <span style={{ fontSize: '2.2rem', fontWeight: 900, color: atsAuditData.atsScore >= 80 ? '#10B981' : '#F59E0B' }}>
                    {atsAuditData.atsScore}%
                  </span>
                </div>
                {atsAuditData.scoreBreakdown && (
                  <div style={{ fontSize: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>Keyword Match: <strong style={{ color: 'var(--text-primary)' }}>{atsAuditData.scoreBreakdown.keywordMatch}%</strong></div>
                    <div>Metrics & Impact: <strong style={{ color: 'var(--text-primary)' }}>{atsAuditData.scoreBreakdown.metricsAndImpact}%</strong></div>
                  </div>
                )}
              </div>

              {/* Missing Keywords & Placement Guidance */}
              <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#EF4444', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                  <AlertCircle size={16} /> Missing Keywords & Recommended Placement
                </h3>
                <p style={{ margin: '0 0 10px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Click <strong>+ Auto-Add</strong> to insert missing keywords into your skills for maximum ATS match:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {atsAuditData.missingKeywords?.map((kw: string, i: number) => {
                    const guidance = atsAuditData.missingKeywordGuidance?.find((g: any) => g.keyword.toLowerCase() === kw.toLowerCase());
                    const targetArea = guidance?.targetSection || 'Technical Skills';

                    return (
                      <div key={i} style={{ background: 'var(--bg-secondary)', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#B91C1C' }}>
                            + {kw}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', background: 'var(--accent-glow)', padding: '2px 6px', borderRadius: '6px', fontWeight: 600 }}>
                            🎯 {targetArea}
                          </span>
                        </div>
                        <button
                          onClick={() => handleAddKeywordToSkills(kw)}
                          title={`Click to automatically add "${kw}" to your Skills section for maximum selection chance`}
                          style={{
                            background: 'var(--accent-primary)',
                            color: '#fff',
                            border: 'none',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          + Auto-Add
                        </button>
                      </div>
                    );
                  })}
                  {(!atsAuditData.missingKeywords || atsAuditData.missingKeywords.length === 0) && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No major keywords missing!</span>
                  )}
                </div>
              </div>

              {/* Unnecessary / Irrelevant Keywords to Remove */}
              {atsAuditData.unnecessaryKeywords && atsAuditData.unnecessaryKeywords.length > 0 && (
                <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '14px', border: '1px solid #FCA5A5' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#DC2626', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                    <AlertTriangle size={16} /> Unnecessary Keywords to Remove ({atsAuditData.unnecessaryKeywords.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {atsAuditData.unnecessaryKeywords.map((item: any, i: number) => (
                      <div key={i} style={{ background: 'var(--bg-secondary)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#991B1B', textDecoration: 'line-through' }}>
                            ❌ {item.term}
                          </span>
                          {item.category && (
                            <span style={{ fontSize: '0.68rem', color: '#DC2626', background: '#FEE2E2', padding: '2px 6px', borderRadius: '8px', fontWeight: 600, textTransform: 'uppercase' }}>
                              {item.category.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                          💡 {item.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bullet Improvements */}
              {atsAuditData.bulletImprovements && atsAuditData.bulletImprovements.filter((b: any) => b.improved).length > 0 && (
                <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                    <Sparkles size={16} color="var(--accent-primary)" /> High-Impact Bullet Upgrades
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {atsAuditData.bulletImprovements.filter((b: any) => b.improved).map((b: any, i: number) => (
                      <div key={i} style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        {b.original && <p style={{ margin: '0 0 6px 0', fontSize: '0.78rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>"{b.original}"</p>}
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#10B981', lineHeight: 1.4 }}>"{b.improved}"</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(b.improved);
                              alert('Copied bullet to clipboard!');
                            }}
                            style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', padding: '2px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            📋 Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Keywords */}
              <div style={{ background: 'var(--bg-primary)', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '0.9rem', color: '#10B981', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                  <CheckCircle2 size={16} /> Matching Keywords
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {atsAuditData.matchingKeywords?.map((kw: string, i: number) => (
                    <span key={i} style={{ background: '#D1FAE5', color: '#047857', border: '1px solid #A7F3D0', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                      ✓ {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}

      </div>
    </div>
  );
};

export default BuilderPage;
