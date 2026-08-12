/**
 * Resume Controller
 * 
 * Manages database CRUD lifecycle actions for User Resumes:
 * 1. Create a new resume with dynamic styling and ordering parameters
 * 2. Fetch all resumes belonging to the authenticated user
 * 3. Retrieve a single resume by its ID
 * 4. Update an existing resume with partial/full fields
 * 5. Delete a specific resume from MongoDB
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import Resume from '../models/Resume';


/**
 * @desc    Create a new resume in MongoDB
 * @route   POST /api/resumes
 * @access  Private
 */
export const createResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized. User token missing.' });
      return;
    }

    const { title, personalInfo, experience, education, skills, tools, references, projects, softSkills, languages, certifications, achievements, positionsOfResponsibility, interests, sectionOrder, style, templateId, atsScore } = req.body;

    const newResume = await Resume.create({
      userId,
      title: title || 'Untitled Resume',
      personalInfo: personalInfo || {},
      experience: experience || [],
      education: education || [],
      skills: skills || [],
      tools: tools || [],
      references: references || [],
      projects: projects || [],
      softSkills: softSkills || [],
      languages: languages || [],
      certifications: certifications || [],
      achievements: achievements || [],
      positionsOfResponsibility: positionsOfResponsibility || [],
      interests: interests || [],
      sectionOrder: sectionOrder || ['summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references'],
      style: style || {},
      templateId: templateId || 'standard',
      atsScore: atsScore || 85
    });

    res.status(201).json({
      message: 'Resume saved to MongoDB successfully!',
      resume: newResume
    });
  } catch (error) {
    console.error('[Resume Controller] Create Error:', error);
    res.status(500).json({ message: 'Failed to save resume to MongoDB database.' });
  }
};

/**
 * @desc    Get all resumes for the authenticated user
 * @route   GET /api/resumes
 * @access  Private
 */
export const getUserResumes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized. User token missing.' });
      return;
    }

    const resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });

    res.status(200).json({
      count: resumes.length,
      resumes
    });
  } catch (error) {
    console.error('[Resume Controller] Get Resumes Error:', error);
    res.status(500).json({ message: 'Failed to fetch user resumes from database.' });
  }
};

/**
 * @desc    Get single resume by ID
 * @route   GET /api/resumes/:id
 * @access  Private
 */
export const getResumeById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      res.status(404).json({ message: 'Resume not found.' });
      return;
    }

    res.status(200).json({ resume });
  } catch (error) {
    console.error('[Resume Controller] Get By ID Error:', error);
    res.status(500).json({ message: 'Failed to fetch resume details.' });
  }
};

/**
 * @desc    Update existing resume in MongoDB
 * @route   PUT /api/resumes/:id
 * @access  Private
 */
export const updateResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      res.status(404).json({ message: 'Resume not found or unauthorized.' });
      return;
    }

    const { title, personalInfo, experience, education, skills, tools, references, projects, softSkills, languages, certifications, achievements, positionsOfResponsibility, interests, sectionOrder, style, templateId, atsScore } = req.body;

    if (title !== undefined) resume.title = title;
    if (personalInfo !== undefined) resume.personalInfo = personalInfo;
    if (experience !== undefined) resume.experience = experience;
    if (education !== undefined) resume.education = education;
    if (skills !== undefined) resume.skills = skills;
    if (tools !== undefined) resume.tools = tools;
    if (references !== undefined) resume.references = references;
    if (projects !== undefined) resume.projects = projects;
    if (softSkills !== undefined) resume.softSkills = softSkills;
    if (languages !== undefined) resume.languages = languages;
    if (certifications !== undefined) resume.certifications = certifications;
    if (achievements !== undefined) resume.achievements = achievements;
    if (positionsOfResponsibility !== undefined) resume.positionsOfResponsibility = positionsOfResponsibility;
    if (interests !== undefined) resume.interests = interests;
    if (sectionOrder !== undefined) resume.sectionOrder = sectionOrder;
    if (style !== undefined) resume.style = style;
    if (templateId !== undefined) resume.templateId = templateId;
    if (atsScore !== undefined) resume.atsScore = atsScore;

    const updatedResume = await resume.save();

    res.status(200).json({
      message: 'Resume updated in MongoDB successfully!',
      resume: updatedResume
    });
  } catch (error) {
    console.error('[Resume Controller] Update Error:', error);
    res.status(500).json({ message: 'Failed to update resume in database.' });
  }
};

/**
 * @desc    Delete resume from MongoDB
 * @route   DELETE /api/resumes/:id
 * @access  Private
 */
export const deleteResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const result = await Resume.deleteOne({ _id: id, userId });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: 'Resume not found or already deleted.' });
      return;
    }

    res.status(200).json({ message: 'Resume deleted successfully from MongoDB.' });
  } catch (error) {
    console.error('[Resume Controller] Delete Error:', error);
    res.status(500).json({ message: 'Failed to delete resume.' });
  }
};
