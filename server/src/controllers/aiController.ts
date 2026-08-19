/**
 * AI Controller
 * 
 * Handles integrations with the Groq LLM SDK using `llama-3.1-8b-instant`.
 * Exposes endpoints for enhancing summaries, bullet points, performing ATS resume audits,
 * answering tech stack questions, and generating complete resumes based on Job Descriptions.
 */

import { Request, Response } from 'express';
import Groq from 'groq-sdk';

const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

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
    const title = jobTitle || 'Full Stack Software Engineer';

    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const systemPrompt = `You are a world-class executive ATS resume strategist and hiring manager.
Your task is to craft a powerful, 2-to-3 sentence professional summary tailored to the target role.
RULES:
1. Emphasize quantifiable business impact, core competencies, and relevant tech stack keywords.
2. Follow standard executive resume voice: concise, authoritative, active, and ATS-optimized.
3. DO NOT include ANY conversational filler whatsoever (e.g. "Here is the summary:", "Sure").
4. Return ONLY the raw, polished text without enclosing quotes.`;

        const userPrompt = `Target Job Role: "${title}"
Current Candidate Notes / Summary:
"${currentSummary || ''}"

Generate a compelling, high-converting 2-3 sentence professional summary highlighting core strengths, architectural expertise, and quantifiable track record.`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: GROQ_MODEL,
          temperature: 0.3,
        });

        let text = chatCompletion.choices[0]?.message?.content?.trim() || '';
        text = text.replace(/^(Here is.*?summary:?\s*)/i, '');
        text = text.replace(/^["']|["']$/g, '').trim();

        if (text) {
          return res.json({ enhancedSummary: text });
        }
      } catch (err) {
        console.warn('Groq error enhancing summary, falling back to rule engine:', err);
      }
    }

    // High-impact rule-based fallback
    const fallbackText = `High-impact ${title} with a proven track record of architecting scalable systems and delivering mission-critical product features. Recognized for reducing API latencies by over 40%, optimizing operational workflows, and driving cross-functional engineering excellence.`;

    res.json({ enhancedSummary: fallbackText });
  } catch (error) {
    console.error('Error enhancing summary:', error);
    res.status(500).json({ error: 'Failed to generate enhanced summary.' });
  }
};

/**
 * @desc    Enhance a resume bullet point with strong action verbs and Google X-Y-Z formula
 * @route   POST /api/ai/enhance/bullet
 * @access  Private (Authenticated)
 * @param   {string} req.body.bulletText - The raw bullet point notes
 * @param   {string} req.body.role - The target job title/role
 */
export const enhanceBullet = async (req: Request, res: Response) => {
  try {
    const { bulletText, role } = req.body;
    const targetRole = role || 'Software Engineer';

    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const systemPrompt = `You are a Principal Resume Consultant and FAANG Technical Recruiter.
Your task is to transform rough bullet points into elite, high-scoring ATS resume achievements.
CRITICAL FORMAT RULE:
Every bullet point MUST follow Google's proven X-Y-Z Formula:
"Accomplished [X] as measured by [Y], by doing [Z]"
Example: "• Architected high-throughput microservices handling 2.5M+ daily API requests, reducing p99 response latency by 42% through Redis distributed caching and database indexing."

RULES:
1. Start EVERY bullet point with a high-impact executive action verb (e.g., Architected, Engineered, Spearheaded, Orchestrated, Automated, Accelerated, Optimized, Streamlined).
2. Incorporate realistic, relatable metrics (e.g. latency %, requests/sec, uptime 99.99%, data volume, cost reduction %, sprint velocity, conversion rate).
3. Weave in modern industry tools, libraries, and best practices.
4. DO NOT include any conversational filler (e.g. "Here are your bullets:").
5. Return 2 to 3 distinct bullet points separated by newlines, each starting with "• ". Do not wrap in quotes.`;

        const userPrompt = `Target Role / Job Title: "${targetRole}"
Candidate's Current Bullet Notes:
"${bulletText || ''}"

Please rewrite or generate 2-3 elite, metric-backed ATS bullet points following the Google X-Y-Z formula.`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: GROQ_MODEL,
          temperature: 0.35,
        });

        let text = chatCompletion.choices[0]?.message?.content?.trim() || '';
        text = text.replace(/^(Here is.*?bullet.*?:?\s*)/i, '');
        text = text.replace(/^["']|["']$/g, '').trim();

        if (text) {
          return res.json({ enhancedBullet: text });
        }
      } catch (err) {
        console.warn('Groq error enhancing bullet, falling back to rule engine:', err);
      }
    }

    // High-impact rule-based fallback
    const fallbackBullet = `• Spearheaded full-lifecycle architecture for ${targetRole} initiatives, reducing p99 response latency by 38% across production workloads.\n• Engineered automated CI/CD pipelines and unit testing suites, improving test coverage to 92% and cutting deployment errors by 50%.\n• Optimized database indexing and query execution plans, boosting transaction throughput by 4x.`;

    res.json({ enhancedBullet: fallbackBullet });
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
          model: GROQ_MODEL,
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
          model: GROQ_MODEL,
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
          model: GROQ_MODEL,
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
 * @param   {string} req.body.experienceLevel - 'entry' | 'mid' | 'senior'
 * @param   {string} req.body.keySkills - Optional comma-separated priority skills
 */
export const generateFromJd = async (req: Request, res: Response) => {
  try {
    const { jobTitle, jobDescription, experienceLevel, keySkills } = req.body;

    if (!jobTitle && !jobDescription) {
      return res.status(400).json({ error: 'Please provide both Job Title and Job Description.' });
    }

    const title = jobTitle || 'Full Stack Software Engineer';
    const level = experienceLevel || 'mid'; // 'entry' | 'mid' | 'senior'

    let generatedResume: any = null;

    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const systemPrompt = `You are a Principal Technical Recruiter and Chief ATS Resume Architect.
Your task is to generate a comprehensive, ultra-high-converting, 100% ATS-optimized resume structure tailored specifically to the target Job Description and Experience Level.

CRITICAL ATS GUIDELINES:
1. EXPERIENCE BULLET FORMULA (Google X-Y-Z Rule):
   Every experience bullet MUST follow:
   "• [Strong Action Verb] [Core System/Task] by [Method/Technology], resulting in [Quantifiable Impact & Metric]."
   Example: "• Architected event-driven microservices using Node.js, Kafka, and Redis, reducing p99 API response times by 38% while scaling to 2.5M+ daily requests."
   Generate 3-4 deep, highly technical, and metric-rich bullets per experience entry.

2. PROJECT BLUEPRINTS:
   Each project must feature realistic architecture, technologies used (comma-separated), live demo / GitHub links, and 2-3 metric-driven bullets explaining the problem solved and technical innovations.

3. SKILLS TAXONOMY:
   Categorize skills clearly:
   - "skills": Core Languages & Frameworks (e.g. TypeScript, React.js, Node.js, Python, Next.js, Go)
   - "tools": Infrastructure, Cloud, & Testing (e.g. AWS, Docker, Kubernetes, Git, CI/CD, Redis, PostgreSQL, Jest)
   - "softSkills": Methodologies & Leadership (e.g. Agile/Scrum, Distributed System Design, Cross-functional Collaboration, Code Review)

4. RELATABLE INDUSTRY CERTIFICATIONS & ACHIEVEMENTS:
   Include recognized credentials (e.g. AWS Certified Solutions Architect, Meta Professional Developer, CKA, Google Cloud, HubSpot SEO) and genuine achievements (Hackathon 1st Place, Open Source Maintainer, Patent/Dean's List).

5. EXPERIENCE LEVEL CALIBRATION:
   - Entry Level (0-2 yrs): Emphasize fast ramp-up, open-source projects, modern frameworks, hackathons, and high-impact academic/internship delivery.
   - Mid Level (3-5 yrs): Focus on production ownership, system scalability, latency optimization, microservices, and CI/CD pipelines.
   - Senior Level (5+ yrs): Highlight technical leadership, architectural decisions, multi-team mentoring, 99.99% SLA reliability, and enterprise cost reduction.

Return ONLY a valid, parseable JSON object matching this schema without any markdown formatting or explanations:
{
  "personalInfo": {
    "fullName": "Alex Morgan",
    "jobTitle": "${title}",
    "email": "alex.morgan.dev@gmail.com",
    "phone": "+1 (555) 382-9104",
    "location": "San Francisco, CA",
    "summary": "Compelling 2-3 sentence executive summary with quantifiable achievements and ATS keywords.",
    "website": "https://alexmorgan.dev",
    "linkedin": "linkedin.com/in/alexmorgan-dev",
    "github": "github.com/alexmorgan-dev"
  },
  "experience": [
    {
      "id": "exp1",
      "role": "${level === 'senior' ? 'Lead / Staff ' + title : level === 'entry' ? 'Associate ' + title : 'Senior ' + title}",
      "company": "CloudScale Technologies",
      "location": "San Francisco, CA",
      "duration": "2023 - Present",
      "description": "• Bullet 1 with X-Y-Z formula and metrics\\n• Bullet 2 with X-Y-Z formula and metrics\\n• Bullet 3 with X-Y-Z formula and metrics"
    },
    {
      "id": "exp2",
      "role": "${title}",
      "company": "Nexus Systems Inc.",
      "location": "Austin, TX",
      "duration": "2021 - 2023",
      "description": "• Bullet 1 with X-Y-Z formula and metrics\\n• Bullet 2 with X-Y-Z formula and metrics"
    }
  ],
  "education": [
    {
      "id": "edu1",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science / Software Engineering",
      "institution": "University of California, Berkeley",
      "location": "Berkeley, CA",
      "duration": "2017 - 2021"
    }
  ],
  "skills": [
    { "id": "s1", "name": "TypeScript" },
    { "id": "s2", "name": "React.js" },
    { "id": "s3", "name": "Node.js" },
    { "id": "s4", "name": "Next.js" },
    { "id": "s5", "name": "Python" }
  ],
  "tools": [
    { "id": "t1", "name": "AWS (ECS, Lambda, S3)" },
    { "id": "t2", "name": "Docker & Kubernetes" },
    { "id": "t3", "name": "PostgreSQL & Redis" },
    { "id": "t4", "name": "Git & GitHub Actions CI/CD" },
    { "id": "t5", "name": "GraphQL & REST APIs" }
  ],
  "softSkills": [
    { "id": "ss1", "name": "Distributed Systems Architecture" },
    { "id": "ss2", "name": "Agile Sprint Delivery" },
    { "id": "ss3", "name": "Technical Mentorship" }
  ],
  "projects": [
    {
      "id": "proj1",
      "name": "High-Throughput Distributed Processing Pipeline",
      "technologies": "TypeScript, Go, Kafka, Redis, Docker, AWS",
      "description": "• Architected asynchronous event pipeline handling 10M+ daily events with sub-50ms processing latency.\\n• Automated deployment with GitHub Actions and Terraform, cutting release cycles by 65%.",
      "link": "https://github.com/alexmorgan-dev/distributed-pipeline"
    },
    {
      "id": "proj2",
      "name": "AI-Powered Real-Time Collaborative Workspace",
      "technologies": "React 19, WebSockets, Node.js, Tailwind CSS",
      "description": "• Engineered multi-user CRDT document sync engine supporting 50+ concurrent editors with zero conflict loss.\\n• Integrated Groq LLM streaming API for sub-200ms real-time suggestions.",
      "link": "https://github.com/alexmorgan-dev/collab-ai"
    }
  ],
  "languages": [
    { "id": "lang1", "name": "English", "proficiency": "Native / Bilingual" }
  ],
  "certifications": [
    { "id": "cert1", "name": "AWS Certified Solutions Architect – Associate", "issuer": "Amazon Web Services", "date": "2024" },
    { "id": "cert2", "name": "Meta Certified Front-End Developer", "issuer": "Meta", "date": "2023" }
  ],
  "achievements": [
    { "id": "ach1", "name": "1st Place Winner – National Cloud Innovation Hackathon (out of 350+ engineering teams)." },
    { "id": "ach2", "name": "Authored open-source React performance toolkit with 1,200+ GitHub stars." }
  ],
  "positionsOfResponsibility": [
    { "id": "pos1", "organization": "ACM Developer Community", "role": "Technical Lead & Workshop Mentor", "duration": "2022 - Present", "description": "Mentored 120+ student developers in full-stack architecture, clean coding standards, and cloud deployments." }
  ],
  "interests": [
    { "id": "int1", "name": "Distributed Systems & Cloud Architecture" },
    { "id": "int2", "name": "Open Source Tooling" }
  ],
  "sectionOrder": [ "summary", "education", "experience", "projects", "skills", "tools", "softSkills", "certifications", "achievements", "positionsOfResponsibility", "languages", "interests", "references" ],
  "atsScore": 96
}`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Target Job Title: ${title}\nExperience Level: ${level}\n${keySkills ? `Key Skills to Emphasize: ${keySkills}\n` : ''}\nJob Description:\n${jobDescription || title}` }
          ],
          model: GROQ_MODEL,
          temperature: 0.2,
          response_format: { type: 'json_object' }
        });

        const content = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
        generatedResume = JSON.parse(content);
      } catch (err) {
        console.warn('Groq error generating resume from JD, using domain fallback:', err);
      }
    }

    if (!generatedResume) {
      // High-quality role-specific fallback generator
      const lower = title.toLowerCase();
      
      const isData = lower.includes('data') || lower.includes('analyst') || lower.includes('machine') || lower.includes('ai');
      const isSEO = lower.includes('seo') || lower.includes('marketing') || lower.includes('growth') || lower.includes('content');
      const isDevOps = lower.includes('devops') || lower.includes('cloud') || lower.includes('sre') || lower.includes('infrastructure');
      const isFrontend = lower.includes('front') || lower.includes('ui') || lower.includes('react');

      generatedResume = {
        personalInfo: {
          fullName: 'Alex Morgan',
          jobTitle: title,
          email: 'alex.morgan.work@gmail.com',
          phone: '+1 (555) 492-0182',
          location: 'San Francisco, CA',
          summary: isSEO 
            ? `Performance-driven ${title} with proven expertise in Technical SEO, Core Web Vitals optimization, and organic conversion funnels. Demonstrated track record of scaling organic domain traffic by 140%+ and securing #1 Google rankings for high-intent keywords.`
            : isData
            ? `Results-oriented ${title} with deep expertise in SQL data modeling, automated ETL pipelines, and executive BI dashboards. Proven ability to translate petabyte-scale data into actionable business strategies, driving a 28% operational cost reduction.`
            : isDevOps
            ? `Certified ${title} specializing in multi-region AWS cloud infrastructure, Kubernetes container orchestration, and zero-downtime CI/CD automation. Maintained 99.99% system availability across high-throughput production clusters.`
            : `High-impact ${title} with strong foundation in full-stack architecture, microservices, and performance optimization. Track record of architecting scalable web applications, reducing API response latencies by 45%, and delivering mission-critical product features.`,
          website: 'https://alexmorgan.dev',
          linkedin: 'https://linkedin.com/in/alexmorgan-dev',
          github: 'https://github.com/alexmorgan-dev'
        },
        experience: [
          {
            id: 'exp1',
            role: level === 'senior' ? `Lead ${title}` : `Senior ${title}`,
            company: 'CloudScale AI Technologies',
            location: 'San Francisco, CA',
            duration: '2023 - Present',
            description: isSEO
              ? '• Spearheaded technical SEO site architecture revamp across 500k+ pages, improving Google Core Web Vitals pass rate from 42% to 98% and driving a 65% boost in organic indexation.\n• Formulated keyword clustering and internal linking strategies that boosted monthly non-brand search traffic by 140% (2.2M monthly visitors).\n• Optimized page load speed (LCP < 1.1s, INP < 80ms) by eliminating render-blocking scripts, directly increasing conversion rate by 22%.'
              : isData
              ? '• Architected automated ELT pipelines using dbt, Snowflake, and Apache Airflow, cutting daily data warehouse query latency by 55%.\n• Designed interactive Tableau and PowerBI executive reporting dashboards adopted across 8 business units, identifying $1.4M in annual cost efficiencies.\n• Developed customer churn predictive machine learning models in Python (Scikit-Learn), improving retention forecasting accuracy to 91%.'
              : isDevOps
              ? '• Architected multi-region AWS EKS Kubernetes clusters serving 15M+ daily requests with automated horizontal pod autoscaling and 99.99% SLA uptime.\n• Engineered zero-downtime GitHub Actions CI/CD pipelines, reducing production deployment duration from 45 minutes to 4.5 minutes.\n• Implemented centralized Prometheus and Grafana observability stack with automated alerting, reducing Mean Time to Detection (MTTD) by 60%.'
              : '• Architected high-throughput microservices using React 19, TypeScript, and Node.js, reducing p99 API response latencies by 42% across 3M+ daily active sessions.\n• Spearheaded state management and bundle size refactoring, decreasing client bundle size by 35% and improving Lighthouse performance scores to 99/100.\n• Automated end-to-end integration testing using Jest and Cypress, elevating test coverage from 60% to 94% and cutting regression bug rates by 50%.'
          },
          {
            id: 'exp2',
            role: title,
            company: 'Nexus Software Systems',
            location: 'Austin, TX',
            duration: '2021 - 2023',
            description: '• Engineered core transactional APIs and modular UI component libraries, accelerating feature delivery velocity across cross-functional sprints by 30%.\n• Optimized PostgreSQL indexing and query execution plans, resolving database bottlenecks and improving read throughput by 4x.\n• Collaborated with product and UX teams to build responsive, accessible interfaces (WCAG 2.1 AA compliant) supporting 100k+ enterprise users.'
          }
        ],
        education: [
          {
            id: 'edu1',
            degree: 'Bachelor of Science in Computer Science / Information Systems',
            fieldOfStudy: 'Computer Science',
            institution: 'University of California, Berkeley',
            location: 'Berkeley, CA',
            duration: '2017 - 2021'
          }
        ],
        skills: isSEO
          ? [
              { id: 's1', name: 'Technical SEO' },
              { id: 's2', name: 'Google Search Console' },
              { id: 's3', name: 'Google Analytics 4' },
              { id: 's4', name: 'Keyword Research' },
              { id: 's5', name: 'Core Web Vitals Optimization' },
              { id: 's6', name: 'HTML5 & Semantic Markup' }
            ]
          : isData
          ? [
              { id: 's1', name: 'SQL & PostgreSQL' },
              { id: 's2', name: 'Python (Pandas, NumPy)' },
              { id: 's3', name: 'Snowflake & dbt' },
              { id: 's4', name: 'Tableau & PowerBI' },
              { id: 's5', name: 'Apache Airflow' },
              { id: 's6', name: 'Data Modeling' }
            ]
          : [
              { id: 's1', name: 'TypeScript' },
              { id: 's2', name: 'React 19 & Next.js' },
              { id: 's3', name: 'Node.js & Express' },
              { id: 's4', name: 'Python' },
              { id: 's5', name: 'REST & GraphQL APIs' },
              { id: 's6', name: 'State Management (Redux/Zustand)' }
            ],
        tools: [
          { id: 't1', name: 'AWS (S3, Lambda, ECS, CloudFront)' },
          { id: 't2', name: 'Docker & Containerization' },
          { id: 't3', name: 'PostgreSQL & Redis Cache' },
          { id: 't4', name: 'Git & GitHub Actions CI/CD' },
          { id: 't5', name: 'Jest, Cypress, & Playwright' }
        ],
        softSkills: [
          { id: 'ss1', name: 'Distributed Systems Architecture' },
          { id: 'ss2', name: 'Agile & Scrum Sprint Leadership' },
          { id: 'ss3', name: 'Cross-Functional Team Collaboration' },
          { id: 'ss4', name: 'Technical Mentoring & Code Reviews' }
        ],
        projects: [
          {
            id: 'proj1',
            name: 'Cloud-Scale Microservices Orchestrator',
            technologies: 'TypeScript, Node.js, Redis, Docker, AWS, Kafka',
            description: '• Architected asynchronous message-driven microservices processing 5M+ daily requests with sub-40ms latency.\n• Integrated Redis distributed locks and caching layers, decreasing relational database load by 60%.\n• Implemented automated CI/CD pipeline reducing release cycles from weekly to multi-daily releases.',
            link: 'https://github.com/alexmorgan-dev/microservices-orchestrator'
          },
          {
            id: 'proj2',
            name: 'AI Real-Time Collaborative Analytics Engine',
            technologies: 'React 19, WebSockets, Python, FastAPI, Tailwind CSS',
            description: '• Developed interactive analytics dashboard with live multi-user WebSocket data streams supporting 1,000+ concurrent clients.\n• Integrated AI inference layer for automated trend prediction and anomaly alerts with 94% accuracy.',
            link: 'https://github.com/alexmorgan-dev/realtime-analytics'
          }
        ],
        languages: [
          { id: 'lang1', name: 'English', proficiency: 'Native / Bilingual' }
        ],
        certifications: [
          { id: 'cert1', name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2024' },
          { id: 'cert2', name: 'Meta Certified Professional Full-Stack Engineer', issuer: 'Meta', date: '2023' }
        ],
        achievements: [
          { id: 'ach1', name: '1st Place Winner – National Hackathon (out of 350+ engineering teams).' },
          { id: 'ach2', name: 'Maintained 5-star open-source developer tool with 1,500+ GitHub stars.' }
        ],
        positionsOfResponsibility: [
          { id: 'pos1', organization: 'ACM Developer Community', role: 'Technical Lead & Workshop Mentor', duration: '2022 - Present', description: 'Coordinated technical workshops and mentored 100+ junior developers in cloud architecture and clean code.' }
        ],
        interests: [
          { id: 'int1', name: 'Distributed Systems & Cloud Computing' },
          { id: 'int2', name: 'Open-Source Contribution' }
        ],
        sectionOrder: ['summary', 'education', 'experience', 'projects', 'skills', 'tools', 'softSkills', 'certifications', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references'],
        atsScore: 96
      };
    }

    res.json({ resume: generatedResume });
  } catch (error) {
    console.error('Error generating resume from JD:', error);
    res.status(500).json({ error: 'Failed to generate resume from Job Description.' });
  }
};

