
export interface PersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  github?: string;
  summary: string;
  photoUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location?: string;
  duration?: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate?: string;
  endDate?: string;
  graduationDate: string;
}

export interface Skill {
  id: string;
  name: string;
  category?: string;
}

export interface Tool {
  id: string;
  name: string;
  percentage: number;
}

export interface Reference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
}

export interface Item {
  id: string;
  name: string;
}

export interface PositionOfResponsibility {
  id: string;
  role: string;
  organization: string;
  duration: string;
  description: string;
}

export interface Project {
  id: string;
  name: string;
  url?: string;
  websiteUrl?: string;
  technologies?: string;
  techStack?: string;
  description: string;
  startDate?: string;
  endDate?: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  tools: Tool[];
  references: Reference[];
  projects: Project[];
  softSkills: Item[];
  languages: Item[];
  certifications: Item[];
  achievements: Item[];
  positionsOfResponsibility: PositionOfResponsibility[];
  interests: Item[];
  sectionOrder?: string[];
  atsScore?: number;
  templateId?: string;
  style?: ResumeStyle;
}

export interface ResumeStyle {
  themeColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  customFontSize?: number;
  spacing: 'compact' | 'normal' | 'relaxed';
  letterSpacing?: number;
  lineHeight?: number;
  sectionGap?: number;
  pagePadding?: number;
  headingWeight?: 'normal' | '600' | '700' | '900';
  headingTransform?: 'none' | 'uppercase' | 'capitalize';
  textAlign?: 'left' | 'center' | 'justify';
}

export type TemplateId = 'standard' | 'minimalist' | 'creative' | 'academic';
