import bcrypt from 'bcryptjs';
import User from '../models/User';
import Resume from '../models/Resume';

/**
 * Automatically seeds the MongoDB database with a default evaluator user account
 * and a sample resume if the database contains no user accounts.
 * This directly supports clean project demonstration and evaluation.
 */
export const seedDatabase = async (): Promise<void> => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('[Seeder] Database already contains user records. Skipping automatic seeding.');
      return;
    }

    console.log('[Seeder] Empty database detected. Seeding evaluator user and sample resume...');

    // 1. Create a hashed password for password123
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 2. Create the evaluator user
    const evaluator = await User.create({
      username: 'evaluator',
      email: 'evaluator@pw.edu',
      password: hashedPassword,
      fullName: 'PW Evaluator',
      location: 'Bengaluru, India'
    });

    console.log(`[Seeder] Evaluator account registered: ${evaluator.email} (password: password123)`);

    // 3. Create the sample candidate resume (Abhishek Jain)
    await Resume.create({
      userId: evaluator._id,
      title: 'Pre-seeded ATS Resume (Abhishek Jain)',
      personalInfo: {
        fullName: 'Abhishek Jain',
        jobTitle: 'SEO & Web Developer',
        email: 'abhishek.711p@gmail.com',
        phone: '7568864993',
        location: 'Bengaluru, India',
        linkedin: 'linkedin.com/in/abhishek711p',
        website: 'abhishek711p.github.io',
        summary: 'Detail-oriented SEO enthusiast with hands-on experience in on-page optimization, Google Analytics/Search Console, and SEO-friendly content writing, backed by a technical background in HTML, CSS, and JavaScript. Comfortable working across content, design, and development to improve website visibility and organic performance.'
      },
      experience: [
        {
          id: 'exp1',
          company: 'Medhavi Skills University',
          role: 'Website SEO Specialist',
          startDate: '2024',
          endDate: 'Present',
          description: '• Implemented on-page SEO best practices across project websites, including optimized meta titles, meta descriptions, and header tags.\n• Monitored website traffic and user behavior using Google Analytics and Google Search Console, tracking organic traffic trends.\n• Wrote SEO-friendly content for project and blog pages, using keyword-conscious headlines and structured copy to support readability and search ranking.'
        },
        {
          id: 'exp2',
          company: 'YouTube Channel',
          role: 'Content Creator',
          startDate: '2023',
          endDate: '2024',
          description: '• Designed YouTube thumbnails using Canva, applying layout, typography, and color principles to improve click-through rate (CTR) across multiple videos.\n• Edited short-form video content using CapCut, handling cuts, transitions, and pacing to improve viewer retention.'
        }
      ],
      education: [
        {
          id: 'edu1',
          institution: 'PW IOI (Degree Partner: Medhavi Skills University)',
          degree: 'Bachelor of Technology',
          fieldOfStudy: 'Computer Science / IT',
          graduationDate: '2028',
          startDate: '2024',
          endDate: '2028'
        }
      ],
      projects: [
        {
          id: 'proj1',
          name: 'ResuAI ATS Builder',
          url: 'http://localhost:5173/create',
          websiteUrl: 'http://localhost:5173/create',
          description: 'Developed an AI-powered resume builder and optimizer supporting PDF imports, real-time ATS keyword analysis, action verb advice, and PDF exports. Implemented a dual theme system featuring GenZ neon styling and professional mode.',
          startDate: '2026',
          endDate: '2026'
        }
      ],
      skills: [
        { id: 's1', name: 'React' },
        { id: 's2', name: 'TypeScript' },
        { id: 's3', name: 'Node.js' },
        { id: 's4', name: 'Express.js' },
        { id: 's5', name: 'MongoDB' },
        { id: 's6', name: 'SEO' },
        { id: 's7', name: 'HTML5 & CSS3' },
        { id: 's8', name: 'Google Analytics' },
        { id: 's9', name: 'Google Search Console' },
        { id: 's10', name: 'Keyword Research' }
      ],
      tools: [
        { id: 't1', name: 'Git', percentage: 90 },
        { id: 't2', name: 'Docker', percentage: 75 },
        { id: 't3', name: 'Canva', percentage: 85 },
        { id: 't4', name: 'CapCut', percentage: 80 }
      ],
      softSkills: [
        { id: 'ss1', name: 'Problem Solving' },
        { id: 'ss2', name: 'Communication' },
        { id: 'ss3', name: 'Creative Thinking' },
        { id: 'ss4', name: 'Collaboration' }
      ],
      languages: [
        { id: 'l1', name: 'English' },
        { id: 'l2', name: 'Hindi' }
      ],
      certifications: [
        { id: 'c1', name: 'Google Analytics Certification' },
        { id: 'c2', name: 'HubSpot SEO Certification' }
      ],
      achievements: [
        { id: 'a1', name: 'Maintained a 5-star rating on freelance resume optimization reviews.' }
      ],
      positionsOfResponsibility: [
        {
          id: 'pos1',
          role: 'Class Representative',
          organization: 'PW Institute of Innovation',
          duration: '2024 - Present',
          description: 'Represented student concerns to faculty, coordinated class events, and managed team task distribution.'
        }
      ],
      interests: [
        { id: 'i1', name: 'Tech Blogging' },
        { id: 'i2', name: 'Video Production' }
      ],
      sectionOrder: ['summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references'],
      style: {
        themeColor: '#00e599',
        fontFamily: 'Inter, sans-serif',
        fontSize: 'medium',
        customFontSize: 14,
        spacing: 'normal',
        letterSpacing: 0,
        lineHeight: 1.4,
        sectionGap: 24,
        pagePadding: 40,
        headingWeight: '700',
        headingTransform: 'none',
        textAlign: 'left'
      },
      templateId: 'standard',
      atsScore: 85
    });

    console.log('[Seeder] Database seeded successfully with a pre-populated candidate resume for the evaluator user!');
  } catch (error) {
    console.error('[Seeder] Error during database seeding:', error);
  }
};
