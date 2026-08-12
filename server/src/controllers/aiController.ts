/**
 * AI Controller
 * 
 * Handles integrations with the Groq LLM SDK using `llama-3.1-8b-instant`.
 * Exposes endpoints for enhancing summaries, bullet points, performing ATS resume audits,
 * answering tech stack questions, and generating complete resumes based on Job Descriptions.
 */

import { Request, Response } from 'express';
import Groq from 'groq-sdk';

/**
 * @desc    Enhances a candidate's professional summary to be more ATS-friendly and professional
 * @route   POST /api/ai/enhance/summary
 * @access  Private (Authenticated)
 * @param   {string} req.body.currentSummary - The candidate's original summary
 * @param   {string} req.body.jobTitle - The target job title to customize the summary for
 */
export const enhanceSummary = async (req: Request, res: Response) => {
  try {
    const { currentSummary, jobTitle } = req.body;
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'Groq API key is not configured on the server. Please add GROQ_API_KEY to the .env file.' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `You are an expert ATS-friendly resume writer. 
Your ONLY job is to rewrite the user's provided text to be highly professional and impactful.
RULES:
1. DO NOT invent, hallucinate, or add any programming languages, frameworks, or skills that the user did not explicitly mention.
2. DO NOT hallucinate experiences (e.g. do not say they led a team if they didn't say so).
3. DO NOT include ANY conversational filler whatsoever. Never start with "Here is your summary" or "Here is the rewritten text".
4. Just return the raw, final professional text. DO NOT wrap the text in quotes.`;

    const userPrompt = `The user is applying for the role of "${jobTitle || 'Software Engineer'}".
Here is their current professional summary:
"${currentSummary}"

Please rewrite this summary in 2 to 3 sentences using a professional, authoritative tone and strong action verbs. Remember, do not add fake skills or conversational filler.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.5,
    });

    let text = chatCompletion.choices[0]?.message?.content?.trim() || '';
    // Strip leading conversational fillers if the LLM still includes them
    text = text.replace(/^(Here is.*?summary:?\s*)/i, '');
    text = text.replace(/^["']|["']$/g, '').trim();

    res.json({ enhancedSummary: text });
  } catch (error) {
    console.error('Error enhancing summary:', error);
    res.status(500).json({ error: 'Failed to generate enhanced summary.' });
  }
};

/**
 * @desc    Enhance a resume bullet point with strong action verbs and metrics
 * @route   POST /api/ai/enhance/bullet
 * @access  Private (Authenticated)
 * @param   {string} req.body.bulletText - The raw bullet point notes
 * @param   {string} req.body.role - The target job title/role
 */
export const enhanceBullet = async (req: Request, res: Response) => {
  try {
    const { bulletText, role } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'Groq API key is not configured on the server. Please add GROQ_API_KEY to the .env file.' });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const systemPrompt = `You are a world-class ATS resume consultant and executive resume writer. 
Your task is to transform weak, short, or missing bullet points into high-impact, professional resume bullet points.
RULES:
1. Every bullet MUST start with a strong action verb (e.g., Architected, Spearheaded, Engineered, Optimized, Streamlined, Accelerated, Executed).
2. Include realistic quantifiable metrics, achievements, or tech stack details where relevant to demonstrate business impact.
3. DO NOT include conversational filler like "Here is the bullet:" or "Sure, here you go:".
4. Return 2-3 clean, high-impact bullet points separated by newlines, each starting with "• ". Do not wrap in quotes.`;

    const userPrompt = `Role / Job Title: "${role || 'Software Engineer / Professional'}"
Current Bullet Text / Notes:
"${bulletText || ''}"

If the current text is empty or brief, generate 3 outstanding, industry-standard bullet points tailored to a "${role || 'Software Engineer'}".
If text is provided, rewrite and expand it into 2-3 high-impact, metric-driven bullet points.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.4,
    });

    let text = chatCompletion.choices[0]?.message?.content?.trim() || '';
    text = text.replace(/^(Here is.*?bullet.*?:?\s*)/i, '');
    text = text.replace(/^["']|["']$/g, '').trim();

    res.json({ enhancedBullet: text });
  } catch (error) {
    console.error('Error enhancing bullet:', error);
    res.status(500).json({ error: 'Failed to generate enhanced bullet.' });
  }
};

// Comprehensive industry skill dictionary for deterministic matching
const SKILLS_DICT = [
  'HTML', 'HTML5', 'CSS', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'React.js', 'Next.js',
  'Vue', 'Vue.js', 'Angular', 'Svelte', 'Tailwind', 'Tailwind CSS', 'Bootstrap', 'Sass', 'SCSS',
  'Redux', 'Node.js', 'Express', 'Express.js', 'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring',
  'Spring Boot', 'C++', 'C#', '.NET', 'PHP', 'Laravel', 'Ruby', 'Go', 'Golang', 'Rust',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Mongoose', 'Redis', 'REST API', 'GraphQL', 'Microservices',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'GitLab', 'Linux', 'Bash',
  'SEO Specialist', 'SEO', 'Search Engine Optimization', 'Google Analytics', 'Google Search Console',
  'Keyword Research', 'Content Strategy', 'On-Page SEO', 'Off-Page SEO', 'Technical SEO',
  'Page Speed', 'Mobile Responsiveness', 'Meta Tags', 'Alt Text', 'Header Hierarchy', 'Structured Data',
  'Agile', 'Scrum', 'Copywriting', 'Digital Marketing', 'Social Media', 'Automation', 'Jest', 'Cypress'
];

// Dictionary of common overused resume buzzwords & weak passive phrases
const BUZZWORDS_AND_FLUFF_LIST = [
  { term: 'hard worker', reason: 'Vague cliché. Replace with concrete achievements and quantifiable impact.', category: 'buzzword_fluff' },
  { term: 'hardworking', reason: 'Subjective claim. Demonstrate diligence through metrics rather than self-declaration.', category: 'buzzword_fluff' },
  { term: 'team player', reason: 'Generic filler term. Show collaborative achievements in bullet points instead.', category: 'buzzword_fluff' },
  { term: 'detail-oriented', reason: 'Overused buzzword. Prove attention to detail through error reduction or quality metrics.', category: 'buzzword_fluff' },
  { term: 'results-driven', reason: 'Empty self-description. Show results directly using percentage growth or saved hours.', category: 'buzzword_fluff' },
  { term: 'self-starter', reason: 'Overused resume phrase. Highlight self-initiated projects or proactive features instead.', category: 'buzzword_fluff' },
  { term: 'dynamic professional', reason: 'Fluff term that adds zero ATS keywords or measurable skills.', category: 'buzzword_fluff' },
  { term: 'synergy', reason: 'Corporate jargon. Use specific technical or operational terminology.', category: 'buzzword_fluff' },
  { term: 'thought leader', reason: 'Pretentious fluff. Highlight actual leadership, mentoring, or publication records.', category: 'buzzword_fluff' },
  { term: 'go-getter', reason: 'Informal cliché unsuited for modern ATS resumes.', category: 'buzzword_fluff' },
  { term: 'multitasker', reason: 'Vague description. Contextualize capacity through concurrent project management metrics.', category: 'buzzword_fluff' },
  { term: 'responsible for', reason: 'Passive phrasing. Replace with executive action verbs like Spearheaded, Engineered, or Directed.', category: 'redundant' },
  { term: 'assisted with', reason: 'Weak action verb. State your specific individual contribution directly.', category: 'redundant' },
  { term: 'worked on', reason: 'Generic low-impact verb. Use Architected, Developed, or Deployed instead.', category: 'redundant' }
];

/**
 * @desc    Performs a dual-stage ATS audit on a candidate's resume:
 *          1. Calls Groq LLM for intelligent feedback, content mistakes, and keyword suggestion.
 *          2. Deterministically scans the resume text for keywords and matches/misses, and scores it.
 * @route   POST /api/ai/audit
 * @access  Private (Authenticated)
 */
export const auditResume = async (req: Request, res: Response) => {
  try {
    const { resumeData, jobTitle, jobDescription } = req.body;

    // 1. Build comprehensive, lowercased string representation of current resume data
    const resumeText = `
Name: ${resumeData?.personalInfo?.fullName || ''}
Job Title: ${resumeData?.personalInfo?.jobTitle || ''}
Summary: ${resumeData?.personalInfo?.summary || ''}
Experience: ${(resumeData?.experience || []).map((e: any) => `${e.role} ${e.company} ${e.description}`).join(' ')}
Projects: ${(resumeData?.projects || []).map((p: any) => `${p.name} ${p.technologies || p.techStack || ''} ${p.description}`).join(' ')}
Skills: ${(resumeData?.skills || []).map((s: any) => s.name).join(' ')} ${(resumeData?.tools || []).map((t: any) => t.name).join(' ')} ${(resumeData?.softSkills || []).map((s: any) => s.name).join(' ')}
Education: ${(resumeData?.education || []).map((ed: any) => `${ed.degree} ${ed.fieldOfStudy} ${ed.institution}`).join(' ')}
Achievements: ${(resumeData?.achievements || []).map((a: any) => a.name).join(' ')}
Positions of Responsibility: ${(resumeData?.positionsOfResponsibility || []).map((pos: any) => `${pos.organization} ${pos.role} ${pos.description}`).join(' ')}
Interests: ${(resumeData?.interests || []).map((i: any) => i.name).join(' ')}
    `.toLowerCase();

    const jdText = ((jobTitle || '') + ' ' + (jobDescription || '')).toLowerCase();

    // 2. Deterministic Keyword Extraction from Job Description
    const extractedKeywordsSet = new Set<string>();

    // Match dictionary skills present in JD
    SKILLS_DICT.forEach(skill => {
      if (jdText.includes(skill.toLowerCase())) {
        extractedKeywordsSet.add(skill);
      }
    });

    let bulletImprovements: any[] = [];
    let contentMistakes: any[] = [];
    let aiUnnecessaryKeywords: any[] = [];

    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const systemPrompt = `You are a deterministic ATS analyzer.
Analyze the candidate's resume against the target job description and return JSON strictly matching:
{
  "extraKeywords": [string],
  "contentMistakes": [
    { "title": string, "desc": string, "type": "critical" | "warning" }
  ],
  "bulletImprovements": [
    {
      "original": string,
      "improved": string,
      "reason": string
    }
  ],
  "unnecessaryKeywords": [
    {
      "term": string,
      "reason": string,
      "category": "irrelevant_skill" | "buzzword_fluff" | "redundant"
    }
  ]
}
RULES:
1. ONLY return RAW JSON.
2. Extract 5-10 specific industry skills or qualifications from the job description into "extraKeywords".
3. Provide 3 high-impact bullet point upgrades in "bulletImprovements".
4. Pinpoint 2-5 unnecessary keywords, irrelevant tools, or filler phrases found in the resume that dilute ATS density into "unnecessaryKeywords".`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Target Job Title: ${jobTitle}\nJob Description:\n${(jobDescription || '').substring(0, 3000)}\n\nCandidate Resume:\n${resumeText.substring(0, 4000)}` }
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.0, // Fully deterministic
          response_format: { type: 'json_object' }
        });

        const content = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
        const parsed = JSON.parse(content);
        if (parsed.extraKeywords && Array.isArray(parsed.extraKeywords)) {
          parsed.extraKeywords.forEach((kw: string) => {
            if (kw && typeof kw === 'string') extractedKeywordsSet.add(kw.trim());
          });
        }
        bulletImprovements = parsed.bulletImprovements || [];
        contentMistakes = parsed.contentMistakes || [];
        aiUnnecessaryKeywords = parsed.unnecessaryKeywords || [];
      } catch (err) {
        console.warn('Groq SDK error during audit, using fallback rules:', err);
      }
    }

    // Helper function for title casing and standardizing technical terms & SEO jargon
    const toTitleCase = (str: string): string => {
      if (!str) return '';
      const specialCasings: Record<string, string> = {
        'html': 'HTML',
        'html5': 'HTML5',
        'css': 'CSS',
        'css3': 'CSS3',
        'javascript': 'JavaScript',
        'typescript': 'TypeScript',
        'react.js': 'React.js',
        'next.js': 'Next.js',
        'vue.js': 'Vue.js',
        'graphql': 'GraphQL',
        'rest api': 'REST API',
        'seo': 'SEO',
        'ci/cd': 'CI/CD',
        'aws': 'AWS',
        'gcp': 'GCP',
        'api': 'API',
        'sql': 'SQL',
        'mysql': 'MySQL',
        'postgresql': 'PostgreSQL',
        'mongodb': 'MongoDB',
        'saas': 'SaaS',
        'agile': 'Agile',
        'scrum': 'Scrum',
        'docker': 'Docker',
        'kubernetes': 'Kubernetes',
        'redux': 'Redux',
        'sass': 'Sass',
        'scss': 'SCSS',
        'seo specialist': 'SEO Specialist',
        'page speed': 'Page Speed',
        'mobile responsiveness': 'Mobile Responsiveness',
        'header hierarchy': 'Header Hierarchy',
        'alt text': 'Alt Text',
        'structured data': 'Structured Data',
        'semantic html': 'Semantic HTML',
        'content strategy': 'Content Strategy',
        'on-page seo': 'On-Page SEO',
        'off-page seo': 'Off-Page SEO',
        'technical seo': 'Technical SEO',
        'site structure': 'Site Structure',
        'google analytics': 'Google Analytics',
        'google search console': 'Google Search Console',
        'keyword research': 'Keyword Research'
      };

      const lower = str.trim().toLowerCase();
      if (specialCasings[lower]) {
        return specialCasings[lower];
      }
      return lower.replace(/\b\w/g, c => c.toUpperCase());
    };

    // Default fallbacks if none returned
    if (extractedKeywordsSet.size === 0) {
      ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'SEO', 'Communication', 'Problem Solving'].forEach(k => extractedKeywordsSet.add(k));
    }

    // Deduplicate extracted keywords case-insensitively using Title Case format
    const uniqueExtractedMap = new Map<string, string>();
    extractedKeywordsSet.forEach(kw => {
      if (kw && typeof kw === 'string') {
        const titleCased = toTitleCase(kw);
        uniqueExtractedMap.set(titleCased.toLowerCase(), titleCased);
      }
    });

    // 3. Programmatically & case-insensitively compare extracted keywords against resumeText
    const matchingKeywordsMap = new Map<string, string>();
    const missingKeywordsMap = new Map<string, string>();

    uniqueExtractedMap.forEach((titleCasedValue, lowerKey) => {
      if (resumeText.includes(lowerKey)) {
        matchingKeywordsMap.set(lowerKey, titleCasedValue);
      } else {
        missingKeywordsMap.set(lowerKey, titleCasedValue);
      }
    });

    const matchingKeywords = Array.from(matchingKeywordsMap.values()).sort((a, b) => a.localeCompare(b));
    const missingKeywords = Array.from(missingKeywordsMap.values()).sort((a, b) => a.localeCompare(b));

    // Generate optimal section placement guidance for missing keywords based on domain
    const getPlacementGuidance = (kw: string) => {
      const lower = kw.toLowerCase();
      
      // 1. SEO & Digital Marketing
      if (['seo', 'content strategy', 'marketing', 'keyword', 'meta', 'analytics', 'search console'].some(t => lower.includes(t))) {
        return {
          targetSection: 'SEO & Content Strategy',
          placementAdvice: `Feature "${kw}" under Skills and reference it contextually in your top Work Experience bullets.`
        };
      }

      // 2. UI/UX & Frontend Optimization
      if (['responsiveness', 'speed', 'hierarchy', 'alt text', 'structure', 'semantic', 'performance', 'mobile', 'frontend', 'html', 'css'].some(t => lower.includes(t))) {
        return {
          targetSection: 'Frontend & Performance Optimization',
          placementAdvice: `Integrate "${kw}" into Work Experience bullets to highlight client-side optimization.`
        };
      }

      // 3. Languages & Frameworks
      if (['react', 'javascript', 'typescript', 'node.js', 'python', 'java', 'c++', 'sql', 'next.js', 'express', 'vue', 'angular', 'redux', 'graphql', 'rest api', 'mongodb', 'postgresql', 'spring'].some(t => lower.includes(t))) {
        return {
          targetSection: 'Technical Skills & Frameworks',
          placementAdvice: `Add "${kw}" to Technical Skills and contextually weave it into your top Work Experience roles.`
        };
      }

      // 4. Cloud & DevOps
      if (['aws', 'docker', 'kubernetes', 'ci/cd', 'git', 'linux', 'azure', 'gcp', 'jest', 'cypress', 'testing'].some(t => lower.includes(t))) {
        return {
          targetSection: 'Tools & Infrastructure',
          placementAdvice: `Place "${kw}" in Tools & Infrastructure and mention in Projects to verify deployment experience.`
        };
      }

      // 5. Methodology & Leadership
      if (['agile', 'scrum', 'leadership', 'management', 'collaboration'].some(t => lower.includes(t))) {
        return {
          targetSection: 'Professional Summary & Operations',
          placementAdvice: `Highlight "${kw}" in your Professional Summary to demonstrate project delivery and process expertise.`
        };
      }

      return {
        targetSection: 'Technical Skills & Frameworks',
        placementAdvice: `Add "${kw}" to Technical Skills and reference it in your top Work Experience bullet.`
      };
    };

    const missingKeywordGuidance = missingKeywords.map(kw => {
      const g = getPlacementGuidance(kw);
      return {
        keyword: kw,
        targetSection: g.targetSection,
        placementAdvice: g.placementAdvice
      };
    });

    // 4. Deterministic scanning for buzzwords & fluff in resumeText (case-insensitively deduplicated)
    const unnecessaryKeywordsMap = new Map<string, { term: string; reason: string; category: string }>();

    // Add AI-detected unnecessary keywords first (avoiding duplicates or terms required by job)
    if (Array.isArray(aiUnnecessaryKeywords)) {
      aiUnnecessaryKeywords.forEach((item: any) => {
        if (item && item.term) {
          const normalizedTerm = toTitleCase(item.term);
          const lower = normalizedTerm.toLowerCase();
          
          if (!matchingKeywordsMap.has(lower) && !missingKeywordsMap.has(lower)) {
            unnecessaryKeywordsMap.set(lower, {
              term: normalizedTerm,
              reason: item.reason || 'Not aligned with target role requirements.',
              category: item.category || 'irrelevant_skill'
            });
          }
        }
      });
    }

    // Add deterministic dictionary buzzword matches (only if not required by target job)
    BUZZWORDS_AND_FLUFF_LIST.forEach(b => {
      const lower = b.term.toLowerCase();
      if (resumeText.includes(lower)) {
        if (!matchingKeywordsMap.has(lower) && !missingKeywordsMap.has(lower) && !unnecessaryKeywordsMap.has(lower)) {
          unnecessaryKeywordsMap.set(lower, {
            term: toTitleCase(b.term),
            reason: b.reason,
            category: b.category
          });
        }
      }
    });

    const unnecessaryKeywords = Array.from(unnecessaryKeywordsMap.values());

    // Calculate EXACT mathematical ATS score (100% reproducible)
    const totalCount = matchingKeywords.length + missingKeywords.length;
    const matchRatio = totalCount > 0 ? matchingKeywords.length / totalCount : 0.7;
    const keywordMatchScore = Math.round(matchRatio * 100);
    
    // Overall ATS Score formula: Base 40 + Up to 55 based on keyword match ratio
    const overallAtsScore = Math.min(98, Math.max(35, Math.round(matchRatio * 55 + 40)));

    const auditResult = {
      atsScore: overallAtsScore,
      matchingKeywords,
      missingKeywords,
      missingKeywordGuidance,
      unnecessaryKeywords,
      contentMistakes: contentMistakes.length > 0 ? contentMistakes : [
        { title: 'Quantifiable Metrics Needed', desc: 'Add measurable data (percentages, growth numbers) to work experience.', type: 'warning' },
        { title: 'Action Verbs Optimization', desc: 'Ensure every bullet point begins with a strong executive action verb.', type: 'critical' }
      ],
      bulletImprovements: bulletImprovements.length > 0 ? bulletImprovements : [
        {
          original: 'Responsible for managing website and updating content.',
          improved: 'Spearheaded website optimization and content management, boosting organic search traffic by 35%.',
          reason: 'Adds high-impact executive action verb and quantifiable metric.'
        }
      ],
      scoreBreakdown: {
        keywordMatch: keywordMatchScore,
        formatting: 95,
        metricsAndImpact: Math.round(keywordMatchScore * 0.85 + 10),
        sectionCompleteness: 90
      }
    };

    res.json(auditResult);
  } catch (error) {
    console.error('Error auditing resume:', error);
    res.status(500).json({ error: 'Failed to generate ATS audit.' });
  }
};

/**
 * @desc    Tech Stack Q&A Bot: Answers questions about the application's built-in stack.
 *          Provides information on React 19, Node, Express, MongoDB, and Groq SDK.
 * @route   POST /api/ai/tech-stack-qa
 * @access  Public
 * @param   {string} req.body.question - The user's query
 */
export const askTechStack = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid question string.' });
    }

    const techStackContext = `
ResuAI Project Technical Stack Details:
- Frontend: React 19, TypeScript, Vite 8, Framer Motion (micro-animations & smooth transitions), Lucide Icons, Custom CSS variables, Glassmorphism, Dual Theme System (GenZ glow mode & Professional mode), React Router DOM v7.
- Backend: Node.js runtime, Express.js v5 (Web framework), TypeScript with tsx watcher, CORS, Dotenv.
- Database: MongoDB with Mongoose ORM, plus mongodb-memory-server for isolated zero-dependency dev execution.
- AI & LLM Engine: Groq SDK using llama-3.1-8b-instant models for fast resume ATS optimization, summary enhancing, bullet refinement, and tech stack analysis.
- File Processing: pdf-parse for PDF text extraction, Multer for file upload handling.
- Security & Auth: JSON Web Tokens (jsonwebtoken), bcryptjs for password hashing, protected API route middleware.
`;

    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const systemPrompt = `You are the lead tech architect of ResuAI. Answer questions about ResuAI's technology stack accurately, concisely, and enthusiastically using markdown formatting (bullet points, code tags, bold text).
Here is the authoritative tech stack details of ResuAI:
${techStackContext}

Rules:
- Be clear, friendly, and technical.
- Only discuss technologies actually used in ResuAI.
- If asked about comparisons or rationale, explain why this stack was chosen (e.g. Vite for lightning fast HMR, Express 5 for async router handling, Groq Llama3 for sub-second AI inference, MongoDB for flexible JSON document storage).`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.4,
        });

        const answer = chatCompletion.choices[0]?.message?.content?.trim() || '';
        if (answer) {
          return res.json({ answer });
        }
      } catch (err) {
        console.warn('Groq SDK error during tech stack QA, falling back to rule-based answer:', err);
      }
    }

    // Smart fallback if Groq API key is not configured or fails
    const qLower = question.toLowerCase();
    let fallbackAnswer = '';

    if (qLower.includes('frontend') || qLower.includes('react') || qLower.includes('ui') || qLower.includes('css') || qLower.includes('style')) {
      fallbackAnswer = `**Frontend Stack:**\n- **Framework:** React 19 + TypeScript\n- **Build Tool:** Vite 8\n- **Animations:** Framer Motion\n- **Icons:** Lucide React\n- **Styling:** Custom CSS with HSL design tokens, Glassmorphism, and a dual-theme engine (💼 Professional & ⚡ GenZ mode).`;
    } else if (qLower.includes('backend') || qLower.includes('express') || qLower.includes('server') || qLower.includes('api')) {
      fallbackAnswer = `**Backend Stack:**\n- **Runtime:** Node.js\n- **Framework:** Express.js v5\n- **Language:** TypeScript (\`tsx watch\` for hot-reloading)\n- **Middleware:** CORS, Dotenv, Auth Middleware`;
    } else if (qLower.includes('db') || qLower.includes('database') || qLower.includes('mongo') || qLower.includes('mongoose')) {
      fallbackAnswer = `**Database Layer:**\n- **Database:** MongoDB\n- **ORM:** Mongoose\n- **In-Memory Server:** \`mongodb-memory-server\` for fast local development without requiring external DB setup!`;
    } else if (qLower.includes('ai') || qLower.includes('groq') || qLower.includes('llama') || qLower.includes('model') || qLower.includes('llm')) {
      fallbackAnswer = `**AI & LLM Integration:**\n- **AI Provider:** Groq SDK\n- **Model:** \`llama-3.1-8b-instant\` (Ultra fast, sub-second inference)\n- **Capabilities:** ATS resume auditing, bullet point enhancement, professional summary rewriting, and tech stack detection.`;
    } else if (qLower.includes('pdf') || qLower.includes('upload') || qLower.includes('file') || qLower.includes('parse')) {
      fallbackAnswer = `**File Processing:**\n- **PDF Parsing:** \`pdf-parse\` package for extracting structured text from uploaded PDF resumes.\n- **File Upload:** \`multer\` middleware for handling multipart/form-data.`;
    } else if (qLower.includes('auth') || qLower.includes('jwt') || qLower.includes('security') || qLower.includes('password')) {
      fallbackAnswer = `**Security & Auth:**\n- **Authentication:** JSON Web Tokens (\`jsonwebtoken\`)\n- **Password Security:** \`bcryptjs\` with salt hashing\n- **API Protection:** Custom bearer token middleware.`;
    } else {
      fallbackAnswer = `**ResuAI Tech Stack Overview:**\n- ⚛️ **Frontend:** React 19, TypeScript, Vite 8, Framer Motion, Lucide Icons, Custom CSS Theme Engine.\n- 🚀 **Backend:** Node.js, Express.js 5, TypeScript.\n- 💾 **Database:** MongoDB & Mongoose ORM.\n- 🧠 **AI Engine:** Groq SDK (Llama 3 8B Instant).\n- 📄 **Parsers:** \`pdf-parse\` & \`multer\`.\n- 🔒 **Security:** JWT Auth & \`bcryptjs\`.`;
    }

    return res.json({ answer: fallbackAnswer });
  } catch (error) {
    console.error('Error in askTechStack:', error);
    res.status(500).json({ error: 'Failed to process tech stack query.' });
  }
};

/**
 * @desc    Suggests a set of relevant developer tags and tools based on a project title and description.
 * @route   POST /api/ai/suggest-project-techstack
 * @access  Public
 * @param   {string} req.body.title - Project title
 * @param   {string} req.body.description - Project description
 */
export const suggestProjectTechStack = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;

    if (!title && !description) {
      return res.status(400).json({ error: 'Project title or description is required.' });
    }

    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const systemPrompt = `You are a tech stack detector for software projects. Given a project title and description, list the 4 to 8 most relevant technologies, programming languages, databases, or frameworks as a comma-separated list. Return ONLY the comma-separated tags, without extra text or markdown formatting. E.g.: React.js, TypeScript, Node.js, Express, MongoDB, Tailwind CSS`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Project Title: ${title || 'N/A'}\nDescription: ${description || 'N/A'}` }
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.3,
        });

        const raw = chatCompletion.choices[0]?.message?.content?.trim() || '';
        const tags = raw.split(',').map(t => t.trim()).filter(Boolean);
        if (tags.length > 0) {
          return res.json({ techStack: tags });
        }
      } catch (err) {
        console.warn('Groq error in suggestProjectTechStack:', err);
      }
    }

    // Heuristic fallback
    const text = `${title} ${description}`.toLowerCase();
    const commonTech = [
      'React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Python', 'Django',
      'Flask', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'Firebase', 'GraphQL',
      'Next.js', 'Vue.js', 'Tailwind CSS', 'Java', 'Spring Boot', 'C++', 'Rust',
      'Go', 'Redis', 'TensorFlow', 'PyTorch', 'REST API'
    ];
    const matched = commonTech.filter(t => text.includes(t.toLowerCase()));
    const finalStack = matched.length > 0 ? matched : ['React', 'Node.js', 'TypeScript', 'MongoDB', 'REST API'];

    return res.json({ techStack: finalStack });
  } catch (error) {
    console.error('Error in suggestProjectTechStack:', error);
    res.status(500).json({ error: 'Failed to suggest project tech stack.' });
  }
};

/**
 * @desc    Generates a fully populated, ATS-friendly resume layout using AI based on a Job Description.
 * @route   POST /api/ai/generate-from-jd
 * @access  Private (Authenticated)
 * @param   {string} req.body.jobTitle - Target job title
 * @param   {string} req.body.jobDescription - Job description content
 */
export const generateFromJd = async (req: Request, res: Response) => {
  try {
    const { jobTitle, jobDescription } = req.body;

    if (!jobTitle || !jobDescription) {
      return res.status(400).json({ error: 'Please provide both Job Title and Job Description.' });
    }

    let generatedResume: any = null;

    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const systemPrompt = `You are an expert resume architect. Given a target Job Title and Job Description, generate a fully populated, highly optimized resume structure that contains all relevant keywords to pass ATS screeners with a high score.
Return ONLY a valid JSON object matching this structure:
{
  "personalInfo": {
    "fullName": "Your Name",
    "jobTitle": string,
    "email": "candidate@example.com",
    "phone": "+1 (555) 019-2834",
    "location": "San Francisco, CA",
    "summary": string (a powerful professional summary tailored to the job description),
    "website": "https://portfolio.dev",
    "linkedin": "https://linkedin.com/in/username",
    "github": "https://github.com/username"
  },
  "experience": [
    {
      "id": "exp1",
      "role": string,
      "company": string,
      "location": string,
      "duration": "2023 - Present",
      "description": string (bullet points separated by newlines, using executive action verbs and showing quantifiable metrics)
    }
  ],
  "education": [
    {
      "id": "edu1",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "institution": "State University",
      "location": "City, State",
      "duration": "2019 - 2023"
    }
  ],
  "skills": [
    { "id": "s1", "name": string }
  ],
  "tools": [
    { "id": "t1", "name": string }
  ],
  "softSkills": [
    { "id": "ss1", "name": string }
  ],
  "projects": [
    {
      "id": "proj1",
      "name": string,
      "technologies": string (comma-separated list),
      "description": string,
      "link": "https://github.com/username/project"
    }
  ],
  "languages": [
    { "id": "lang1", "name": "English", "proficiency": "Native" }
  ],
  "certifications": [
    { "id": "cert1", "name": string, "issuer": string, "date": "2024" }
  ],
  "achievements": [
    { "id": "ach1", "name": string }
  ],
  "positionsOfResponsibility": [
    { "id": "pos1", "organization": string, "role": string, "duration": string, "description": string }
  ],
  "interests": [
    { "id": "int1", "name": string }
  ],
  "sectionOrder": [ "summary", "education", "experience", "projects", "skills", "softSkills", "languages", "certifications", "achievements", "positionsOfResponsibility", "interests", "references" ]
}

RULES:
1. ONLY return RAW JSON matching this format. No explanation, no markdown wraps.
2. Under experience and projects, make the bullets highly realistic and populated with target keywords from the job description.
3. Keep IDs simple string values like "exp1", "exp2", "edu1", etc.`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Target Job Title: ${jobTitle}\n\nJob Description:\n${jobDescription}` }
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.2,
          response_format: { type: 'json_object' }
        });

        const content = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
        generatedResume = JSON.parse(content);
      } catch (err) {
        console.warn('Groq error generating resume from JD:', err);
      }
    }

    if (!generatedResume) {
      generatedResume = {
        personalInfo: {
          fullName: 'Your Name',
          jobTitle: jobTitle || 'Software Engineer',
          email: 'candidate@example.com',
          phone: '+1 (555) 019-2834',
          location: 'San Francisco, CA',
          summary: `Detail-oriented and results-driven professional with hands-on experience in ${jobTitle}. Skilled in optimization, performance engineering, and applying industry best practices to build high-scale solutions.`,
          website: 'https://portfolio.dev',
          linkedin: 'https://linkedin.com/in/username',
          github: 'https://github.com/username'
        },
        experience: [
          {
            id: 'exp1',
            role: `Senior ${jobTitle}`,
            company: 'Tech Solutions Inc.',
            location: 'San Francisco, CA',
            duration: '2023 - Present',
            description: 'Spearheaded full-lifecycle development of core product features, resulting in a 25% increase in efficiency.\nOptimized backend query performance, reducing database latency by 40%.\nCollaborated with cross-functional product and design teams to deliver high-quality releases.'
          }
        ],
        education: [
          {
            id: 'edu1',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            institution: 'State University',
            location: 'City, State',
            duration: '2019 - 2023'
          }
        ],
        skills: [
          { id: 's1', name: 'JavaScript' },
          { id: 's2', name: 'TypeScript' },
          { id: 's3', name: 'React' }
        ],
        tools: [
          { id: 't1', name: 'Git' },
          { id: 't2', name: 'Docker' }
        ],
        softSkills: [
          { id: 'ss1', name: 'Agile Methodology' },
          { id: 'ss2', name: 'Problem Solving' }
        ],
        projects: [
          {
            id: 'proj1',
            name: 'Cloud E-Commerce Platform',
            technologies: 'React, Node.js, AWS',
            description: 'Designed and deployed a highly scalable serverless storefront with real-time checkout updates.',
            link: 'https://github.com/username/ecommerce'
          }
        ],
        languages: [
          { id: 'lang1', name: 'English', proficiency: 'Native' }
        ],
        certifications: [
          { id: 'cert1', name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024' }
        ],
        achievements: [
          { id: 'ach1', name: 'Won first place in corporate internal optimization hackathon.' }
        ],
        positionsOfResponsibility: [
          { id: 'pos1', organization: 'Tech Community Group', role: 'Lead Organizer', duration: '2022 - Present', description: 'Coordinated meetups, technical panels, and workshops for over 500+ local developer community members.' }
        ],
        interests: [
          { id: 'int1', name: 'Open Source Contribution' },
          { id: 'int2', name: 'Tech Blogging' }
        ],
        sectionOrder: [ 'summary', 'education', 'experience', 'projects', 'skills', 'softSkills', 'languages', 'certifications', 'achievements', 'positionsOfResponsibility', 'interests', 'references' ]
      };
    }

    res.json({ resume: generatedResume });
  } catch (error) {
    console.error('Error generating resume from JD:', error);
    res.status(500).json({ error: 'Failed to generate resume from Job Description.' });
  }
};

