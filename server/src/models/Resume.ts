import mongoose, { Schema, Document } from 'mongoose';

export interface IExperience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface IEducation {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate?: string;
  endDate?: string;
  graduationDate: string;
}

export interface ISkill {
  id: string;
  name: string;
  category?: string;
}

export interface IPersonalInfo {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
}

export interface IResumeStyle {
  themeColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  customFontSize?: number;
  spacing: 'compact' | 'normal' | 'relaxed';
  letterSpacing?: number;
  lineHeight?: number;
  sectionGap?: number;
  pagePadding?: number;
  headingWeight?: string;
  headingTransform?: string;
  textAlign?: string;
}

export interface IResume extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  personalInfo: IPersonalInfo;
  experience: IExperience[];
  education: IEducation[];
  skills: ISkill[];
  tools: any[];
  references: any[];
  projects: any[];
  softSkills: any[];
  languages: any[];
  certifications: any[];
  achievements: any[];
  positionsOfResponsibility: any[];
  interests: any[];
  sectionOrder: string[];
  style: IResumeStyle;
  templateId: string;
  atsScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Resume title is required'],
      trim: true,
      default: 'My ATS Resume'
    },
    personalInfo: {
      fullName: { type: String, default: '' },
      jobTitle: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      location: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      website: { type: String, default: '' },
      summary: { type: String, default: '' }
    },
    experience: [
      {
        id: { type: String },
        company: { type: String, default: '' },
        role: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        description: { type: String, default: '' }
      }
    ],
    education: [
      {
        id: { type: String },
        institution: { type: String, default: '' },
        degree: { type: String, default: '' },
        fieldOfStudy: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        graduationDate: { type: String, default: '' }
      }
    ],
    skills: [
      {
        id: { type: String },
        name: { type: String, default: '' },
        category: { type: String, default: '' }
      }
    ],
    tools: [
      {
        id: { type: String },
        name: { type: String, default: '' },
        percentage: { type: Number, default: 0 }
      }
    ],
    references: [
      {
        id: { type: String },
        name: { type: String, default: '' },
        title: { type: String, default: '' },
        company: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' }
      }
    ],
    projects: [
      {
        id: { type: String },
        name: { type: String, default: '' },
        url: { type: String, default: '' },
        websiteUrl: { type: String, default: '' },
        description: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' }
      }
    ],
    softSkills: [
      {
        id: { type: String },
        name: { type: String, default: '' }
      }
    ],
    languages: [
      {
        id: { type: String },
        name: { type: String, default: '' }
      }
    ],
    certifications: [
      {
        id: { type: String },
        name: { type: String, default: '' }
      }
    ],
    achievements: [
      {
        id: { type: String },
        name: { type: String, default: '' }
      }
    ],
    positionsOfResponsibility: [
      {
        id: { type: String },
        role: { type: String, default: '' },
        organization: { type: String, default: '' },
        duration: { type: String, default: '' },
        description: { type: String, default: '' }
      }
    ],
    interests: [
      {
        id: { type: String },
        name: { type: String, default: '' }
      }
    ],
    sectionOrder: {
      type: [String],
      default: ['summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references']
    },
    style: {
      themeColor: { type: String, default: '#2563EB' },
      fontFamily: { type: String, default: 'Inter' },
      fontSize: { type: String, default: 'medium' },
      customFontSize: { type: Number, default: 14 },
      spacing: { type: String, default: 'normal' },
      letterSpacing: { type: Number, default: 0 },
      lineHeight: { type: Number, default: 1.4 },
      sectionGap: { type: Number, default: 24 },
      pagePadding: { type: Number, default: 40 },
      headingWeight: { type: String, default: '700' },
      headingTransform: { type: String, default: 'none' },
      textAlign: { type: String, default: 'left' }
    },
    templateId: {
      type: String,
      default: 'standard'
    },
    atsScore: {
      type: Number,
      default: 85
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IResume>('Resume', ResumeSchema);
