/**
 * Resume Parsing Engine (Heuristic-based)
 * 
 * This module converts raw, unstructured text (obtained from PDF parsers or copy-paste)
 * into a strongly typed `ResumeData` object. It uses:
 * 1. Regular Expressions (regex) to identify patterns like emails, phone numbers, and social URLs.
 * 2. Section Headers Matching (via case-insensitive keywords for SUMMARY, EXPERIENCE, etc.).
 * 3. Line-based state machine logic to split details like job roles, dates, companies, and bullet points.
 */

import type { ResumeData, Experience, Education, Skill, Item } from '../types/resume';

/**
 * Parses raw text lines and maps them to structured fields (PersonalInfo, Experience[], Skills[], etc.).
 * 
 * @param {string} rawText - The unformatted string dump of a candidate's resume
 * @returns {ResumeData} Structured resume data object
 */
export function parseResumeText(rawText: string): ResumeData {
  const text = rawText.replace(/\r\n/g, '\n');
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  if (lines.length === 0) {
    return createEmptyResume();
  }

  // Helper patterns
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  const linkedinRegex = /(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/i;
  const websiteRegex = /((https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/i;

  let fullName = '';
  let email = '';
  let phone = '';
  let location = '';
  let linkedin = '';
  let website = '';

  // Extract contact info from top lines
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i];

    if (!email && emailRegex.test(line)) {
      const match = line.match(emailRegex);
      if (match) email = match[0];
    }
    if (!phone && phoneRegex.test(line)) {
      const match = line.match(phoneRegex);
      if (match) phone = match[0];
    }
    if (!linkedin && linkedinRegex.test(line)) {
      const match = line.match(linkedinRegex);
      if (match) linkedin = match[0];
    } else if (!website && websiteRegex.test(line) && !line.includes('@')) {
      const match = line.match(websiteRegex);
      if (match) website = match[0];
    }
  }

  // Assume line 0 is full name if it doesn't contain email/phone/urls
  if (lines[0] && !emailRegex.test(lines[0]) && !phoneRegex.test(lines[0])) {
    fullName = lines[0].replace(/[|•,].*$/, '').trim();
  }

  // Job title heuristic (line 1 or under name)
  let jobTitle = '';
  if (lines[1] && !emailRegex.test(lines[1]) && !phoneRegex.test(lines[1]) && lines[1].length < 60) {
    jobTitle = lines[1].replace(/[|•,].*$/, '').trim();
  }

  // Location heuristic
  const locationMatch = text.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)?,\s*(?:[A-Z]{2}\b|[A-Z][a-z]+))/);
  if (locationMatch) {
    location = locationMatch[1];
  }

  // Identify section headers
  const sectionHeaders: { index: number; name: string }[] = [];
  const headerPatterns = [
    { name: 'SUMMARY', regex: /^(summary|professional\ summary|profile|about\ me)$/i },
    { name: 'EXPERIENCE', regex: /(experience|employment|history)$/i },
    { name: 'EDUCATION', regex: /^(education|academic|qualifications)/i },
    { name: 'SKILLS', regex: /^(skills|technical\ skills|core\ competencies)/i },
    { name: 'TOOLS', regex: /^(tools|software|technologies)$/i },
    { name: 'SOFT_SKILLS', regex: /^(soft\ skills|personal\ skills)$/i },
    { name: 'LANGUAGES', regex: /^(languages)$/i },
    { name: 'PROJECTS', regex: /projects/i },
    { name: 'ACHIEVEMENTS', regex: /^(achievements|awards|honors|awards\ &\ honors)$/i }
  ];

  lines.forEach((line, idx) => {
    const clean = line.replace(/[^a-zA-Z\s]/g, '').trim();
    if (clean.length === 0 || clean.length > 40) return;
    
    for (const h of headerPatterns) {
      if (h.regex.test(clean)) {
        sectionHeaders.push({ index: idx, name: h.name });
        break;
      }
    }
  });

  // Extract sections
  const getSectionLines = (sectionName: string): string[] => {
    let result: string[] = [];
    const headers = sectionHeaders.filter(h => h.name === sectionName);
    
    for (const header of headers) {
      const nextHeaders = sectionHeaders.filter(h => h.index > header.index);
      const endIndex = nextHeaders.length > 0 ? (nextHeaders[0]?.index ?? lines.length) : lines.length;
      result = result.concat(lines.slice(header.index + 1, endIndex));
    }
    return result;
  };

  // Summary
  const summaryLines = getSectionLines('SUMMARY');
  const summary = summaryLines.join(' ');

  // Experience
  const expLines = getSectionLines('EXPERIENCE');
  const experience: Experience[] = [];

  if (expLines.length > 0) {
    let currentExp: Experience | null = null;
    let bulletBuffer: string[] = [];

    for (let i = 0; i < expLines.length; i++) {
      const line = expLines[i];
      const dateMatch = line.match(/\b(20\d{2}|19\d{2}|Present|Current)\b/i);
      
      // Heuristic: If it has dates, or is very short and no bullets, it might be a header
      const isHeaderLike = (line.includes('|') || line.includes(' - ') || line.includes(' — ') || line.includes(' – ') || line.includes(' at ') || dateMatch) && !line.startsWith('•') && !line.startsWith('-');

      if (isHeaderLike) {
        if (currentExp) {
          currentExp.description = bulletBuffer.join('\n');
          experience.push(currentExp);
          bulletBuffer = [];
        }

        let role = '';
        let company = '';
        let startDate = '';
        let endDate = '';

        if (dateMatch) {
          const dates = line.match(/\b(20\d{2}|19\d{2}|Present|Current)\b/g);
          if (dates && dates[0]) startDate = dates[0];
          if (dates && dates[1]) endDate = dates[1];
        }

        // Try to parse from this line
        if (line.includes('|') || line.includes(' - ') || line.includes(' — ') || line.includes(' – ') || line.includes(' at ')) {
           const parts = line.split(/[|•]| - | — | – | at /).map(p => p.trim());
           // usually Role | Company or Company - Role
           company = parts[0] || '';
           role = parts[1] || '';
           
           // If role contains dates, swap or clean
           if (role.includes(startDate) || role === 'Present') {
               role = '';
           }
        } else {
           // Probably just company name and dates on this line
           company = line.replace(startDate, '').replace(endDate, '').replace(/[-–\s]+$/, '').trim();
        }

        // Peek next line for role if we didn't find one
        if (!role && i + 1 < expLines.length) {
          const nextLine = expLines[i + 1];
          if (!nextLine.startsWith('•') && !nextLine.startsWith('-') && nextLine.length < 50) {
            role = nextLine.trim();
            i++; // skip next line since we used it
          }
        }

        currentExp = {
          id: Math.random().toString(36).substr(2, 9),
          role,
          company,
          startDate,
          endDate,
          description: ''
        };
      } else {
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          bulletBuffer.push(line);
        } else if (line.trim()) {
          bulletBuffer.push(`• ${line.trim()}`);
        }
      }
    }

    const finalExp = currentExp as Experience | null;
    if (finalExp) {
      finalExp.description = bulletBuffer.join('\n');
      experience.push(finalExp);
    }
  }

  // Removed dummy fallback experience array push

  // Education
  const eduLines = getSectionLines('EDUCATION');
  const education: Education[] = [];
  
  if (eduLines.length > 0) {
    for (let i = 0; i < eduLines.length; i++) {
      const line = eduLines[i];
      if (line.length > 3) {
        const dateMatch = line.match(/\b(20\d{2}|19\d{2})\b/);
        let graduationDate = dateMatch ? dateMatch[0] : '';
        
        let degree = line.replace(graduationDate, '').trim();
        let institution = '';
        
        // Peek at next line for institution
        if (i + 1 < eduLines.length) {
          const nextLine = eduLines[i + 1];
          if (!nextLine.match(/\b(20\d{2}|19\d{2})\b/) && nextLine.length < 60) {
            institution = nextLine.trim();
            i++; // consume next line
          }
        }

        // If it was all on one line separated by comma
        if (!institution && degree.includes(',')) {
          const parts = degree.split(',');
          degree = parts[0]?.trim() || '';
          institution = parts[1]?.trim() || '';
        }

        education.push({
          id: (idx => (idx + 1).toString())(education.length),
          institution,
          degree,
          fieldOfStudy: '',
          graduationDate
        });
      }
    }
  }

  // Removed dummy fallback education array push

  // Skills
  const skillLines = getSectionLines('SKILLS');
  let rawSkills: string[] = [];

  let rawTools: string[] = [];

  if (skillLines.length > 0) {
    skillLines.forEach(l => {
      // Check if line contains "Tools:" or "Tools & Software:" inline
      if (l.toLowerCase().includes('tools')) {
        const parts = l.split(':');
        if (parts.length > 1) {
          const toolSplit = parts[1].split(/[,|•;:/\n]/).map(s => s.trim()).filter(s => s.length > 1);
          rawTools.push(...toolSplit);
          return; // Skip adding to skills
        }
      }

      // Check if line contains "Core Skills:" inline and strip it
      if (l.toLowerCase().includes('core skills:')) {
        l = l.replace(/core skills:/i, '');
      }

      const split = l.split(/[,|•;:/\n]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 30);
      rawSkills.push(...split);
    });
  }

  // Unique skills (filter out header words like "Core Skills")
  const uniqueSkillNames = Array.from(new Set(rawSkills))
    .filter(name => !name.toLowerCase().includes('skills') && !name.toLowerCase().includes('tools'))
    .slice(0, 15);
  
  const skills: Skill[] = uniqueSkillNames.map((name, idx) => ({
    id: (idx + 1).toString(),
    name
  }));

  // Tools
  const toolLines = getSectionLines('TOOLS');
  if (toolLines.length > 0) {
    toolLines.forEach(l => {
      const split = l.split(/[,|•;:/\n]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 30);
      rawTools.push(...split);
    });
  }
  const tools = Array.from(new Set(rawTools))
    .filter(name => !name.toLowerCase().includes('tools'))
    .map((name, idx) => ({
      id: (idx + 1).toString(),
      name,
      percentage: 80
    }));

  // Soft Skills
  const softSkillLines = getSectionLines('SOFT_SKILLS');
  let rawSoftSkills: string[] = [];
  if (softSkillLines.length > 0) {
    softSkillLines.forEach(l => {
      // Sometimes it extracts concatenated words, split by CamelCase if no commas exist
      let split = l.split(/[,|•;:/\n]/).map(s => s.trim()).filter(s => s.length > 1);
      if (split.length === 1 && split[0] && split[0].length > 15 && !split[0].includes(' ')) {
        split = split[0].replace(/([A-Z])/g, ' $1').trim().split(' ').filter(s => s.length > 2);
      }
      rawSoftSkills.push(...split);
    });
  }
  const softSkills = Array.from(new Set(rawSoftSkills)).map((name, idx) => ({
    id: (idx + 1).toString(),
    name
  }));

  // Languages
  const langLines = getSectionLines('LANGUAGES');
  let rawLangs: string[] = [];
  if (langLines.length > 0) {
    langLines.forEach(l => {
      let split = l.split(/[,|•;:/\n]/).map(s => s.trim()).filter(s => s.length > 1);
      if (split.length === 1 && split[0] && split[0].length > 15 && !split[0].includes(' ')) {
        split = split[0].replace(/([A-Z])/g, ' $1').trim().split(' ').filter(s => s.length > 2);
      }
      rawLangs.push(...split);
    });
  }
  const languages = Array.from(new Set(rawLangs)).map((name, idx) => ({
    id: (idx + 1).toString(),
    name
  }));

  // Projects
  const projectLines = getSectionLines('PROJECTS');
  const projects: any[] = [];
  if (projectLines.length > 0) {
    let currentProj: any = null;
    let projBulletBuffer: string[] = [];

    for (let i = 0; i < projectLines.length; i++) {
      const line = projectLines[i];
      const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
      
      // Heuristics for a project title:
      // 1. Not a bullet, not a link
      // 2. Starts with an uppercase letter
      // 3. Either short (< 75 chars) OR contains a separator (like —, -, |)
      const isTitleLike = !isBullet && !line.startsWith('http') && /^[A-Z]/.test(line) && (line.length < 75 || line.includes('—') || line.includes('|') || line.includes(' - '));

      if (isTitleLike) {
        if (currentProj) {
          currentProj.description = projBulletBuffer.join('\n');
          projects.push(currentProj);
          projBulletBuffer = [];
        }
        currentProj = {
          id: Math.random().toString(36).substr(2, 9),
          name: line.trim(),
          description: '',
          technologies: [],
          link: ''
        };
      } else if (line.startsWith('http') && currentProj) {
        currentProj.link = line.trim();
      } else {
        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          projBulletBuffer.push(line);
        } else if (line.trim()) {
          projBulletBuffer.push(`• ${line.trim()}`);
        }
      }
    }
    if (currentProj) {
      currentProj.description = projBulletBuffer.join('\n');
      projects.push(currentProj);
    }
  }

  // Achievements
  const achievementLines = getSectionLines('ACHIEVEMENTS');
  const achievements: Item[] = [];
  if (achievementLines.length > 0) {
    achievementLines.forEach((l, idx) => {
      const clean = l.trim().replace(/^[-•]\s*/, '');
      if (clean) {
        achievements.push({
          id: (idx + 1).toString(),
          name: clean
        });
      }
    });
  }

  // Preserve the exact sequence of sections as they appeared in the uploaded resume
  const headerToSectionMap: Record<string, string> = {
    SUMMARY: 'summary',
    EXPERIENCE: 'experience',
    EDUCATION: 'education',
    SKILLS: 'skills',
    TOOLS: 'tools',
    SOFT_SKILLS: 'softSkills',
    LANGUAGES: 'languages',
    PROJECTS: 'projects',
    ACHIEVEMENTS: 'achievements'
  };

  const detectedSections = sectionHeaders
    .map(h => headerToSectionMap[h.name])
    .filter(Boolean);

  const defaultOrder = [
    'summary', 'education', 'experience', 'projects', 'skills', 'tools', 
    'softSkills', 'languages', 'certifications', 'achievements', 
    'positionsOfResponsibility', 'interests', 'references'
  ];

  const sectionOrder = [
    ...new Set([...detectedSections, ...defaultOrder])
  ];

  return {
    personalInfo: {
      fullName,
      jobTitle: jobTitle || '',
      email: email || '',
      phone: phone || '',
      location: location || '',
      linkedin: linkedin || '',
      website: website || '',
      github: '',
      summary
    },
    experience,
    education,
    skills,
    tools,
    references: [],
    projects,
    softSkills,
    languages,
    certifications: [],
    achievements,
    positionsOfResponsibility: [],
    interests: [],
    sectionOrder
  };
}

function createEmptyResume(): ResumeData {
  return {
    personalInfo: {
      fullName: 'Jane Doe',
      jobTitle: 'Software Engineer',
      email: 'jane.doe@example.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/janedoe',
      website: 'janedoe.dev',
      github: 'github.com/janedoe',
      summary: 'Passionate software engineer focused on building robust, scalable web applications.'
    },
    experience: [
      {
        id: '1',
        company: 'Tech Solutions Inc.',
        role: 'Software Developer',
        startDate: '2021',
        endDate: 'Present',
        description: '• Developed responsive UI components using React and TypeScript.\n• Collaborated with cross-functional teams to launch core product features.'
      }
    ],
    education: [
      {
        id: '1',
        institution: 'University of Technology',
        degree: 'B.S.',
        fieldOfStudy: 'Computer Science',
        graduationDate: '2020'
      }
    ],
    skills: [
      { id: '1', name: 'React' },
      { id: '2', name: 'TypeScript' },
      { id: '3', name: 'Node.js' }
    ],
    tools: [],
    references: [],
    projects: [],
    softSkills: [],
    languages: [],
    certifications: [],
    achievements: [],
    positionsOfResponsibility: [],
    interests: []
  };
}
