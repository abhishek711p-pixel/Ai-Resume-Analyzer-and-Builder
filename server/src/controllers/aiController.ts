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
    const level = (experienceLevel || 'mid').toLowerCase(); // 'entry' | 'mid' | 'senior'

    let generatedResume: any = null;

    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        let levelPromptInstructions = '';
        let exampleSchema = '';

        if (level === 'entry') {
          levelPromptInstructions = `
CRITICAL FRESHER / ENTRY-LEVEL (0-2 YRS) DIRECTIVES:
1. PROFILE: This candidate is a Recent Graduate / Junior Engineer. Focus on academic excellence, data structures, algorithms, hackathons, and high-impact internships or capstone projects.
2. TITLE: Use "Junior ${title}" or "Associate ${title}".
3. SUMMARY: Emphasize strong computer science fundamentals, fast learning velocity, modern stack proficiency, hackathon achievements, and hands-on internship delivery.
4. EXPERIENCE: 1-2 entries representing Software Engineering Internships, Open Source Contributor, or Campus Tech Lead (Durations: 2024 - Present, 2023 - 2024).
5. EDUCATION: High priority! Bachelor of Science/Technology in Computer Science (2022 - 2026 or 2024 Graduate) with high GPA (e.g. 3.8/4.0 or 8.8/10) and Relevant Coursework (Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks, Distributed Computing).
6. PROJECTS: 3 heavy, complete Full-Stack/AI projects with GitHub links, live architecture details, and quantifiable metrics.
7. SECTION ORDER: MUST be: ["summary", "education", "skills", "projects", "experience", "tools", "softSkills", "certifications", "achievements", "positionsOfResponsibility", "languages", "interests", "references"].`;

          exampleSchema = `{
  "personalInfo": {
    "fullName": "Alex Morgan",
    "jobTitle": "Junior ${title}",
    "email": "alex.morgan.dev@gmail.com",
    "phone": "+1 (555) 382-9104",
    "location": "San Francisco, CA",
    "summary": "High-energy Junior ${title} with solid computer science fundamentals in Data Structures, Algorithms, and modern full-stack development. Proven ability to build production-grade web applications, win competitive hackathons, and deliver scalable features during engineering internships.",
    "website": "https://alexmorgan.dev",
    "linkedin": "https://linkedin.com/in/alexmorgan-dev",
    "github": "https://github.com/alexmorgan-dev"
  },
  "education": [
    {
      "id": "edu1",
      "degree": "Bachelor of Technology in Computer Science & Engineering",
      "fieldOfStudy": "Computer Science (GPA: 3.85 / 4.0 - Top 5% of Class)",
      "institution": "University of California, Berkeley",
      "location": "Berkeley, CA",
      "duration": "2022 - 2026"
    }
  ],
  "experience": [
    {
      "id": "exp1",
      "role": "Software Engineering Intern",
      "company": "InnovateTech Solutions",
      "location": "San Francisco, CA",
      "duration": "May 2024 - Aug 2024",
      "description": "• Accomplished a 35% reduction in API response times as measured by server metrics, by engineering 12+ RESTful microservice endpoints with Node.js and Redis caching.\\n• Built responsive frontend UI components using React 19 and Tailwind CSS, improving user interaction flow and accessibility scores to 96/100.\\n• Implemented automated Jest unit testing suites, increasing backend test coverage from 55% to 88%."
    },
    {
      "id": "exp2",
      "role": "Web Developer & Open Source Contributor",
      "company": "Campus Developer Community",
      "location": "Berkeley, CA",
      "duration": "2023 - 2024",
      "description": "• Developed a campus-wide event registration portal handling 2,500+ student registrations with zero downtime using React and Firebase.\\n• Contributed 15+ bug fixes and performance patches to open-source developer tooling on GitHub."
    }
  ],
  "projects": [
    {
      "id": "proj1",
      "name": "Real-Time Collaborative Code & Canvas Studio",
      "technologies": "React 19, TypeScript, WebSockets, Node.js, PostgreSQL",
      "description": "• Built a real-time collaborative workspace supporting 50+ concurrent users with sub-30ms latency using WebSocket binary protocols.\\n• Integrated syntax highlighting, Monaco editor, and live chat with automated database persistence.",
      "link": "https://github.com/alexmorgan-dev/realtime-canvas"
    },
    {
      "id": "proj2",
      "name": "AI Smart Resume Auditor & Job Matcher",
      "technologies": "TypeScript, Next.js, Groq LLM, Tailwind CSS, MongoDB",
      "description": "• Engineered an automated ATS scoring engine that parses resume PDFs and identifies missing skill keywords with 94% accuracy.\\n• Implemented sub-second AI suggestions for resume bullet enhancements and summaries.",
      "link": "https://github.com/alexmorgan-dev/ai-resume-matcher"
    },
    {
      "id": "proj3",
      "name": "Distributed Microservices E-Commerce API",
      "technologies": "Go, Docker, Redis, Stripe API, PostgreSQL",
      "description": "• Architected transactional payment and order processing pipeline capable of handling 1,000+ orders per minute with idempotent locks.\\n• Containerized services using Docker and orchestrated CI/CD workflows via GitHub Actions.",
      "link": "https://github.com/alexmorgan-dev/ecommerce-microservices"
    }
  ],
  "skills": [
    { "id": "s1", "name": "TypeScript" },
    { "id": "s2", "name": "React.js" },
    { "id": "s3", "name": "Node.js" },
    { "id": "s4", "name": "Python" },
    { "id": "s5", "name": "Data Structures & Algorithms" }
  ],
  "tools": [
    { "id": "t1", "name": "Git & GitHub Actions" },
    { "id": "t2", "name": "Docker & Linux" },
    { "id": "t3", "name": "PostgreSQL & MongoDB" },
    { "id": "t4", "name": "Redis & WebSockets" },
    { "id": "t5", "name": "Postman & Jest" }
  ],
  "softSkills": [
    { "id": "ss1", "name": "Analytical Problem Solving" },
    { "id": "ss2", "name": "Agile Development" },
    { "id": "ss3", "name": "Rapid Prototyping" }
  ],
  "languages": [
    { "id": "lang1", "name": "English", "proficiency": "Native / Bilingual" }
  ],
  "certifications": [
    { "id": "cert1", "name": "Meta Front-End Developer Professional Certificate", "issuer": "Meta", "date": "2024" },
    { "id": "cert2", "name": "AWS Certified Cloud Practitioner", "issuer": "Amazon Web Services", "date": "2024" }
  ],
  "achievements": [
    { "id": "ach1", "name": "1st Place Winner – National Collegiate Hackathon 2024 (out of 280+ engineering teams)." },
    { "id": "ach2", "name": "Dean's Honor List for Academic Excellence (Consecutive 4 Semesters)." }
  ],
  "positionsOfResponsibility": [
    { "id": "pos1", "organization": "ACM Student Chapter", "role": "Technical Lead & Workshop Mentor", "duration": "2023 - Present", "description": "Conducted 10+ hands-on coding workshops teaching React, Git, and web architecture to 200+ students." }
  ],
  "interests": [
    { "id": "int1", "name": "Competitive Programming & LeetCode" },
    { "id": "int2", "name": "Open-Source Web Development" }
  ],
  "sectionOrder": ["summary", "education", "skills", "projects", "experience", "tools", "softSkills", "certifications", "achievements", "positionsOfResponsibility", "languages", "interests", "references"],
  "atsScore": 95
}`;
        } else if (level === 'senior') {
          levelPromptInstructions = `
CRITICAL SENIOR / LEAD (5+ YRS) DIRECTIVES:
1. PROFILE: Seasoned Staff/Lead Architect. Focus on system architecture, high-availability microservices (99.99% SLA), engineering leadership, multi-team mentoring, and major cost reductions.
2. TITLE: "Senior Lead ${title}" or "Staff ${title}".
3. SUMMARY: 2-3 sentences emphasizing 7+ years of experience leading cross-functional engineering teams, scaling enterprise systems, reducing cloud bills, and driving technical vision.
4. EXPERIENCE: 3 full-time enterprise roles (2022-Present, 2019-2022, 2016-2019).
5. EDUCATION: Bachelor of Science (2012 - 2016).
6. SECTION ORDER: ["summary", "experience", "skills", "tools", "softSkills", "projects", "certifications", "education", "achievements", "positionsOfResponsibility", "languages", "interests", "references"].`;

          exampleSchema = `{
  "personalInfo": {
    "fullName": "Alex Morgan",
    "jobTitle": "Lead ${title}",
    "email": "alex.morgan.work@gmail.com",
    "phone": "+1 (555) 382-9104",
    "location": "San Francisco, CA",
    "summary": "Accomplished Lead ${title} with 8+ years of expertise architecting high-scale distributed systems and managing multi-disciplinary engineering teams. Track record of cutting AWS infrastructure spend by $140k/year, driving 99.99% system availability, and accelerating sprint delivery velocity by 40%.",
    "website": "https://alexmorgan.dev",
    "linkedin": "https://linkedin.com/in/alexmorgan-dev",
    "github": "https://github.com/alexmorgan-dev"
  },
  "experience": [
    {
      "id": "exp1",
      "role": "Lead / Staff ${title}",
      "company": "CloudScale Global Systems",
      "location": "San Francisco, CA",
      "duration": "2022 - Present",
      "description": "• Accomplished a 45% reduction in p99 API response latencies as measured by Datadog APM, by architecting event-driven microservices processing 12M+ daily requests with Node.js, Kafka, and Redis.\\n• Spearheaded cloud modernization and Kubernetes migration across 4 engineering squads, decreasing annual AWS infrastructure costs by $140k while maintaining 99.99% SLA uptime.\\n• Mentored and led 14 full-stack software engineers, establishing automated CI/CD deployment gates that reduced change failure rate from 18% to under 2%."
    },
    {
      "id": "exp2",
      "role": "Senior ${title}",
      "company": "Nexus Enterprise Tech",
      "location": "Austin, TX",
      "duration": "2019 - 2022",
      "description": "• Accomplished a 60% improvement in database throughput by optimizing PostgreSQL query execution plans, partitioning large tables, and implementing distributed read replicas.\\n• Led frontend architecture refactor to Next.js and TypeScript, improving Core Web Vitals across 2M+ monthly active users to 99/100."
    },
    {
      "id": "exp3",
      "role": "${title}",
      "company": "CoreTech Software Inc.",
      "location": "Seattle, WA",
      "duration": "2016 - 2019",
      "description": "• Engineered transactional REST APIs and scalable microservices supporting 500k+ users with Node.js, Express, and MongoDB.\\n• Automated deployment pipelines with Docker and Jenkins, slashing release cycle durations by 50%."
    }
  ],
  "education": [
    {
      "id": "edu1",
      "degree": "Bachelor of Science in Computer Science",
      "fieldOfStudy": "Computer Science",
      "institution": "University of California, Berkeley",
      "location": "Berkeley, CA",
      "duration": "2012 - 2016"
    }
  ],
  "skills": [
    { "id": "s1", "name": "TypeScript & JavaScript" },
    { "id": "s2", "name": "React 19 & Next.js" },
    { "id": "s3", "name": "Node.js & Go" },
    { "id": "s4", "name": "Distributed System Design" },
    { "id": "s5", "name": "Microservices & Event-Driven Architecture" }
  ],
  "tools": [
    { "id": "t1", "name": "AWS (EKS, Lambda, S3, RDS, CloudFront)" },
    { "id": "t2", "name": "Kubernetes & Docker" },
    { "id": "t3", "name": "Kafka & Redis Distributed Caching" },
    { "id": "t4", "name": "PostgreSQL, MongoDB, & DynamoDB" },
    { "id": "t5", "name": "Terraform & GitHub Actions CI/CD" }
  ],
  "softSkills": [
    { "id": "ss1", "name": "Engineering Leadership & Hiring" },
    { "id": "ss2", "name": "Cross-Functional Strategic Roadmaps" },
    { "id": "ss3", "name": "System Scalability & SLA Management" }
  ],
  "projects": [
    {
      "id": "proj1",
      "name": "High-Throughput Multi-Region Event Streaming Platform",
      "technologies": "Go, Kafka, Redis, Kubernetes, AWS EKS, Terraform",
      "description": "• Architected resilient asynchronous data streaming broker processing 20,000+ events/sec with automated failover and zero message loss.\\n• Cut multi-region data synchronization latency from 450ms to sub-45ms.",
      "link": "https://github.com/alexmorgan-dev/event-streaming-platform"
    }
  ],
  "languages": [
    { "id": "lang1", "name": "English", "proficiency": "Native / Bilingual" }
  ],
  "certifications": [
    { "id": "cert1", "name": "AWS Certified Solutions Architect – Professional", "issuer": "Amazon Web Services", "date": "2024" },
    { "id": "cert2", "name": "Certified Kubernetes Administrator (CKA)", "issuer": "Linux Foundation", "date": "2023" }
  ],
  "achievements": [
    { "id": "ach1", "name": "Recognized as Tech Innovator of the Year for engineering a $140k cloud cost reduction architecture." },
    { "id": "ach2", "name": "Keynote Speaker at Regional Cloud & Distributed Systems Conference 2024." }
  ],
  "positionsOfResponsibility": [
    { "id": "pos1", "organization": "Engineering Architecture Board", "role": "Principal Architecture Committee Chair", "duration": "2022 - Present", "description": "Evaluated and standardized system design patterns and security compliance across 6 engineering teams." }
  ],
  "interests": [
    { "id": "int1", "name": "High-Concurrency Distributed Systems" },
    { "id": "int2", "name": "Engineering Mentorship & Tech Writing" }
  ],
  "sectionOrder": ["summary", "experience", "skills", "tools", "softSkills", "projects", "certifications", "education", "achievements", "positionsOfResponsibility", "languages", "interests", "references"],
  "atsScore": 98
}`;
        } else {
          // Mid Level (3-5 yrs)
          levelPromptInstructions = `
CRITICAL MID-LEVEL (3-5 YRS) DIRECTIVES:
1. PROFILE: 3-5 years of professional industry experience. Strong independent ownership of features, microservices, performance optimizations, and CI/CD pipelines.
2. TITLE: "${title}".
3. SUMMARY: 2-3 sentences emphasizing 3-5 years of experience building scalable applications, reducing API latencies by 40%+, and delivering core business features.
4. EXPERIENCE: 2 full-time engineering roles (2023-Present, 2021-2023).
5. EDUCATION: Bachelor of Science (2017 - 2021).
6. SECTION ORDER: ["summary", "experience", "skills", "projects", "tools", "education", "softSkills", "certifications", "achievements", "positionsOfResponsibility", "languages", "interests", "references"].`;

          exampleSchema = `{
  "personalInfo": {
    "fullName": "Alex Morgan",
    "jobTitle": "${title}",
    "email": "alex.morgan.work@gmail.com",
    "phone": "+1 (555) 382-9104",
    "location": "San Francisco, CA",
    "summary": "Performance-focused ${title} with 4+ years of experience architecting resilient web applications, optimizing API throughput, and modernizing frontend interfaces. Proven track record of reducing p99 API response latencies by 42% and accelerating sprint release cycles.",
    "website": "https://alexmorgan.dev",
    "linkedin": "https://linkedin.com/in/alexmorgan-dev",
    "github": "https://github.com/alexmorgan-dev"
  },
  "experience": [
    {
      "id": "exp1",
      "role": "${title}",
      "company": "CloudScale Technologies",
      "location": "San Francisco, CA",
      "duration": "2023 - Present",
      "description": "• Accomplished a 42% reduction in p99 API response latencies as measured by Datadog APM, by refactoring REST microservices in Node.js, TypeScript, and Redis caching.\\n• Engineered high-performance frontend modules in React 19 and Next.js, elevating Lighthouse performance scores from 72 to 98/100.\\n• Automated CI/CD test and deployment pipelines with GitHub Actions and Docker, reducing release deployment times from 40 to 6 minutes."
    },
    {
      "id": "exp2",
      "role": "Software Developer",
      "company": "Nexus Systems Inc.",
      "location": "Austin, TX",
      "duration": "2021 - 2023",
      "description": "• Engineered transactional backend endpoints with Express and PostgreSQL, increasing daily query throughput by 3.5x.\\n• Built reusable UI component libraries with TypeScript and Tailwind CSS, increasing cross-team code reuse by 50%."
    }
  ],
  "education": [
    {
      "id": "edu1",
      "degree": "Bachelor of Science in Computer Science",
      "fieldOfStudy": "Computer Science",
      "institution": "University of California, Berkeley",
      "location": "Berkeley, CA",
      "duration": "2017 - 2021"
    }
  ],
  "skills": [
    { "id": "s1", "name": "TypeScript" },
    { "id": "s2", "name": "React 19 & Next.js" },
    { "id": "s3", "name": "Node.js & Express" },
    { "id": "s4", "name": "PostgreSQL & Redis" },
    { "id": "s5", "name": "REST & GraphQL APIs" }
  ],
  "tools": [
    { "id": "t1", "name": "AWS (ECS, Lambda, S3)" },
    { "id": "t2", "name": "Docker & Kubernetes" },
    { "id": "t3", "name": "Git & GitHub Actions CI/CD" },
    { "id": "t4", "name": "Jest & Cypress" }
  ],
  "softSkills": [
    { "id": "ss1", "name": "Agile Sprint Ownership" },
    { "id": "ss2", "name": "Cross-Functional Collaboration" },
    { "id": "ss3", "name": "Code Review & Quality Standards" }
  ],
  "projects": [
    {
      "id": "proj1",
      "name": "Cloud-Scale Microservices Orchestrator",
      "technologies": "TypeScript, Node.js, Redis, Docker, AWS",
      "description": "• Architected asynchronous message-driven microservices processing 5M+ daily requests with sub-40ms latency.\\n• Integrated Redis distributed locks and caching layers, decreasing database load by 60%.",
      "link": "https://github.com/alexmorgan-dev/microservices-orchestrator"
    },
    {
      "id": "proj2",
      "name": "AI Real-Time Collaborative Analytics Engine",
      "technologies": "React 19, WebSockets, Python, FastAPI, Tailwind CSS",
      "description": "• Developed interactive analytics dashboard with live WebSocket data streams supporting 1,000+ concurrent clients.\\n• Integrated AI inference layer for automated trend prediction with 94% accuracy.",
      "link": "https://github.com/alexmorgan-dev/realtime-analytics"
    }
  ],
  "languages": [
    { "id": "lang1", "name": "English", "proficiency": "Native / Bilingual" }
  ],
  "certifications": [
    { "id": "cert1", "name": "AWS Certified Solutions Architect – Associate", "issuer": "Amazon Web Services", "date": "2024" },
    { "id": "cert2", "name": "Meta Certified Full-Stack Developer", "issuer": "Meta", "date": "2023" }
  ],
  "achievements": [
    { "id": "ach1", "name": "1st Place Winner – Regional Tech Hackathon (out of 200+ teams)." },
    { "id": "ach2", "name": "Authored popular open-source utility with 800+ GitHub stars." }
  ],
  "positionsOfResponsibility": [
    { "id": "pos1", "organization": "Developer Community", "role": "Sprint Tech Lead", "duration": "2023 - Present", "description": "Led code reviews and sprint delivery for team of 6 engineers." }
  ],
  "interests": [
    { "id": "int1", "name": "Distributed Cloud Systems" },
    { "id": "int2", "name": "Open-Source Tooling" }
  ],
  "sectionOrder": ["summary", "experience", "skills", "projects", "tools", "education", "softSkills", "certifications", "achievements", "positionsOfResponsibility", "languages", "interests", "references"],
  "atsScore": 96
}`;
        }

        const systemPrompt = `You are a Principal Technical Recruiter and Chief ATS Resume Architect.
Your task is to generate a comprehensive, ultra-high-converting, 100% ATS-optimized resume structure strictly tailored to the target Job Description and Experience Level.

CRITICAL ATS GUIDELINES:
1. EXPERIENCE BULLET FORMULA (Google X-Y-Z Rule):
   Every experience bullet MUST follow:
   "• Accomplished [X] as measured by [Y], by doing [Z]"
   Generate 2-3 deep, highly technical, and metric-rich bullets per experience entry.

${levelPromptInstructions}

Return ONLY a valid, parseable JSON object matching this schema format without any markdown wrappers or conversational explanations:
${exampleSchema}`;

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
      if (level === 'entry') {
        generatedResume = {
          personalInfo: {
            fullName: 'Alex Morgan',
            jobTitle: `Junior ${title}`,
            email: 'alex.morgan.dev@gmail.com',
            phone: '+1 (555) 382-9104',
            location: 'San Francisco, CA',
            summary: `High-energy Junior ${title} with a strong foundation in Computer Science, Data Structures, Algorithms, and full-stack development. Proven ability to engineer high-performance web applications, win competitive collegiate hackathons, and deliver scalable features during engineering internships.`,
            website: 'https://alexmorgan.dev',
            linkedin: 'https://linkedin.com/in/alexmorgan-dev',
            github: 'https://github.com/alexmorgan-dev'
          },
          education: [
            {
              id: 'edu1',
              degree: 'Bachelor of Technology in Computer Science & Engineering',
              fieldOfStudy: 'Computer Science (GPA: 3.85 / 4.0 - Top 5% of Class)',
              institution: 'University of California, Berkeley',
              location: 'Berkeley, CA',
              duration: '2022 - 2026'
            }
          ],
          experience: [
            {
              id: 'exp1',
              role: 'Software Engineering Intern',
              company: 'InnovateTech Solutions',
              location: 'San Francisco, CA',
              duration: 'May 2024 - Aug 2024',
              description: '• Accomplished a 35% reduction in API response times by engineering 12+ RESTful microservice endpoints with Node.js and Redis caching.\n• Built responsive frontend UI components using React 19 and Tailwind CSS, improving accessibility and user engagement scores to 96/100.\n• Implemented automated Jest unit testing suites, increasing backend test coverage from 55% to 88%.'
            },
            {
              id: 'exp2',
              role: 'Web Developer & Open Source Contributor',
              company: 'Campus Developer Community',
              location: 'Berkeley, CA',
              duration: '2023 - 2024',
              description: '• Developed a campus-wide event registration portal handling 2,500+ student registrations with zero downtime using React and Firebase.\n• Contributed 15+ bug fixes and performance patches to open-source developer tooling on GitHub.'
            }
          ],
          projects: [
            {
              id: 'proj1',
              name: 'Real-Time Collaborative Code & Canvas Studio',
              technologies: 'React 19, TypeScript, WebSockets, Node.js, PostgreSQL',
              description: '• Built a real-time collaborative workspace supporting 50+ concurrent users with sub-30ms latency using WebSocket binary protocols.\n• Integrated syntax highlighting, Monaco editor, and live chat with automated database persistence.',
              link: 'https://github.com/alexmorgan-dev/realtime-canvas'
            },
            {
              id: 'proj2',
              name: 'AI Smart Resume Auditor & Job Matcher',
              technologies: 'TypeScript, Next.js, Groq LLM, Tailwind CSS, MongoDB',
              description: '• Engineered an automated ATS scoring engine that parses resume PDFs and identifies missing skill keywords with 94% accuracy.\n• Implemented sub-second AI suggestions for resume bullet enhancements and summaries.',
              link: 'https://github.com/alexmorgan-dev/ai-resume-matcher'
            },
            {
              id: 'proj3',
              name: 'Distributed Microservices E-Commerce API',
              technologies: 'Go, Docker, Redis, Stripe API, PostgreSQL',
              description: '• Architected transactional payment and order processing pipeline capable of handling 1,000+ orders per minute with idempotent locks.\n• Containerized services using Docker and orchestrated CI/CD workflows via GitHub Actions.',
              link: 'https://github.com/alexmorgan-dev/ecommerce-microservices'
            }
          ],
          skills: [
            { id: 's1', name: 'TypeScript & JavaScript' },
            { id: 's2', name: 'React 19 & Next.js' },
            { id: 's3', name: 'Node.js & Express' },
            { id: 's4', name: 'Python' },
            { id: 's5', name: 'Data Structures & Algorithms' }
          ],
          tools: [
            { id: 't1', name: 'Git & GitHub Actions' },
            { id: 't2', name: 'Docker & Linux' },
            { id: 't3', name: 'PostgreSQL & MongoDB' },
            { id: 't4', name: 'Redis & WebSockets' },
            { id: 't5', name: 'Postman & Jest' }
          ],
          softSkills: [
            { id: 'ss1', name: 'Analytical Problem Solving' },
            { id: 'ss2', name: 'Agile Development' },
            { id: 'ss3', name: 'Rapid Prototyping' }
          ],
          languages: [
            { id: 'lang1', name: 'English', proficiency: 'Native / Bilingual' }
          ],
          certifications: [
            { id: 'cert1', name: 'Meta Front-End Developer Professional Certificate', issuer: 'Meta', date: '2024' },
            { id: 'cert2', name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024' }
          ],
          achievements: [
            { id: 'ach1', name: '1st Place Winner – National Collegiate Hackathon 2024 (out of 280+ engineering teams).' },
            { id: 'ach2', name: "Dean's Honor List for Academic Excellence (Consecutive 4 Semesters)." }
          ],
          positionsOfResponsibility: [
            { id: 'pos1', organization: 'ACM Student Chapter', role: 'Technical Lead & Workshop Mentor', duration: '2023 - Present', description: 'Conducted 10+ hands-on coding workshops teaching React, Git, and web architecture to 200+ students.' }
          ],
          interests: [
            { id: 'int1', name: 'Competitive Programming & LeetCode' },
            { id: 'int2', name: 'Open-Source Web Development' }
          ],
          sectionOrder: ['summary', 'education', 'skills', 'projects', 'experience', 'tools', 'softSkills', 'certifications', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references'],
          atsScore: 95
        };
      } else if (level === 'senior') {
        generatedResume = {
          personalInfo: {
            fullName: 'Alex Morgan',
            jobTitle: `Lead ${title}`,
            email: 'alex.morgan.work@gmail.com',
            phone: '+1 (555) 382-9104',
            location: 'San Francisco, CA',
            summary: `Accomplished Lead ${title} with 8+ years of expertise architecting high-scale distributed systems and managing multi-disciplinary engineering teams. Track record of cutting AWS infrastructure spend by $140k/year, driving 99.99% system availability, and accelerating sprint delivery velocity by 40%.`,
            website: 'https://alexmorgan.dev',
            linkedin: 'https://linkedin.com/in/alexmorgan-dev',
            github: 'https://github.com/alexmorgan-dev'
          },
          experience: [
            {
              id: 'exp1',
              role: `Lead / Staff ${title}`,
              company: 'CloudScale Global Systems',
              location: 'San Francisco, CA',
              duration: '2022 - Present',
              description: '• Accomplished a 45% reduction in p99 API response latencies as measured by Datadog APM, by architecting event-driven microservices processing 12M+ daily requests with Node.js, Kafka, and Redis.\n• Spearheaded cloud modernization and Kubernetes migration across 4 engineering squads, decreasing annual AWS infrastructure costs by $140k while maintaining 99.99% SLA uptime.\n• Mentored and led 14 full-stack software engineers, establishing automated CI/CD deployment gates that reduced change failure rate from 18% to under 2%.'
            },
            {
              id: 'exp2',
              role: `Senior ${title}`,
              company: 'Nexus Enterprise Tech',
              location: 'Austin, TX',
              duration: '2019 - 2022',
              description: '• Accomplished a 60% improvement in database throughput by optimizing PostgreSQL query execution plans, partitioning large tables, and implementing distributed read replicas.\n• Led frontend architecture refactor to Next.js and TypeScript, improving Core Web Vitals across 2M+ monthly active users to 99/100.'
            },
            {
              id: 'exp3',
              role: title,
              company: 'CoreTech Software Inc.',
              location: 'Seattle, WA',
              duration: '2016 - 2019',
              description: '• Engineered transactional REST APIs and scalable microservices supporting 500k+ users with Node.js, Express, and MongoDB.\n• Automated deployment pipelines with Docker and Jenkins, slashing release cycle durations by 50%.'
            }
          ],
          education: [
            {
              id: 'edu1',
              degree: 'Bachelor of Science in Computer Science',
              fieldOfStudy: 'Computer Science',
              institution: 'University of California, Berkeley',
              location: 'Berkeley, CA',
              duration: '2012 - 2016'
            }
          ],
          skills: [
            { id: 's1', name: 'TypeScript & JavaScript' },
            { id: 's2', name: 'React 19 & Next.js' },
            { id: 's3', name: 'Node.js & Go' },
            { id: 's4', name: 'Distributed System Design' },
            { id: 's5', name: 'Microservices & Event-Driven Architecture' }
          ],
          tools: [
            { id: 't1', name: 'AWS (EKS, Lambda, S3, RDS, CloudFront)' },
            { id: 't2', name: 'Kubernetes & Docker' },
            { id: 't3', name: 'Kafka & Redis Distributed Caching' },
            { id: 't4', name: 'PostgreSQL, MongoDB, & DynamoDB' },
            { id: 't5', name: 'Terraform & GitHub Actions CI/CD' }
          ],
          softSkills: [
            { id: 'ss1', name: 'Engineering Leadership & Hiring' },
            { id: 'ss2', name: 'Cross-Functional Strategic Roadmaps' },
            { id: 'ss3', name: 'System Scalability & SLA Management' }
          ],
          projects: [
            {
              id: 'proj1',
              name: 'High-Throughput Multi-Region Event Streaming Platform',
              technologies: 'Go, Kafka, Redis, Kubernetes, AWS EKS, Terraform',
              description: '• Architected resilient asynchronous data streaming broker processing 20,000+ events/sec with automated failover and zero message loss.\n• Cut multi-region data synchronization latency from 450ms to sub-45ms.',
              link: 'https://github.com/alexmorgan-dev/event-streaming-platform'
            }
          ],
          languages: [
            { id: 'lang1', name: 'English', proficiency: 'Native / Bilingual' }
          ],
          certifications: [
            { id: 'cert1', name: 'AWS Certified Solutions Architect – Professional', issuer: 'Amazon Web Services', date: '2024' },
            { id: 'cert2', name: 'Certified Kubernetes Administrator (CKA)', issuer: 'Linux Foundation', date: '2023' }
          ],
          achievements: [
            { id: 'ach1', name: 'Recognized as Tech Innovator of the Year for engineering a $140k cloud cost reduction architecture.' },
            { id: 'ach2', name: 'Keynote Speaker at Regional Cloud & Distributed Systems Conference 2024.' }
          ],
          positionsOfResponsibility: [
            { id: 'pos1', organization: 'Engineering Architecture Board', role: 'Principal Architecture Committee Chair', duration: '2022 - Present', description: 'Evaluated and standardized system design patterns and security compliance across 6 engineering teams.' }
          ],
          interests: [
            { id: 'int1', name: 'High-Concurrency Distributed Systems' },
            { id: 'int2', name: 'Engineering Mentorship & Tech Writing' }
          ],
          sectionOrder: ['summary', 'experience', 'skills', 'tools', 'softSkills', 'projects', 'certifications', 'education', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references'],
          atsScore: 98
        };
      } else {
        // Mid Level fallback
        generatedResume = {
          personalInfo: {
            fullName: 'Alex Morgan',
            jobTitle: title,
            email: 'alex.morgan.work@gmail.com',
            phone: '+1 (555) 382-9104',
            location: 'San Francisco, CA',
            summary: `Performance-focused ${title} with 4+ years of experience architecting resilient web applications, optimizing API throughput, and modernizing frontend interfaces. Proven track record of reducing p99 API response latencies by 42% and accelerating sprint release cycles.`,
            website: 'https://alexmorgan.dev',
            linkedin: 'https://linkedin.com/in/alexmorgan-dev',
            github: 'https://github.com/alexmorgan-dev'
          },
          experience: [
            {
              id: 'exp1',
              role: title,
              company: 'CloudScale Technologies',
              location: 'San Francisco, CA',
              duration: '2023 - Present',
              description: '• Accomplished a 42% reduction in p99 API response latencies as measured by Datadog APM, by refactoring REST microservices in Node.js, TypeScript, and Redis caching.\n• Engineered high-performance frontend modules in React 19 and Next.js, elevating Lighthouse performance scores from 72 to 98/100.\n• Automated CI/CD test and deployment pipelines with GitHub Actions and Docker, reducing release deployment times from 40 to 6 minutes.'
            },
            {
              id: 'exp2',
              role: 'Software Developer',
              company: 'Nexus Systems Inc.',
              location: 'Austin, TX',
              duration: '2021 - 2023',
              description: '• Engineered transactional backend endpoints with Express and PostgreSQL, increasing daily query throughput by 3.5x.\n• Built reusable UI component libraries with TypeScript and Tailwind CSS, increasing cross-team code reuse by 50%.'
            }
          ],
          education: [
            {
              id: 'edu1',
              degree: 'Bachelor of Science in Computer Science',
              fieldOfStudy: 'Computer Science',
              institution: 'University of California, Berkeley',
              location: 'Berkeley, CA',
              duration: '2017 - 2021'
            }
          ],
          skills: [
            { id: 's1', name: 'TypeScript' },
            { id: 's2', name: 'React 19 & Next.js' },
            { id: 's3', name: 'Node.js & Express' },
            { id: 's4', name: 'PostgreSQL & Redis' },
            { id: 's5', name: 'REST & GraphQL APIs' }
          ],
          tools: [
            { id: 't1', name: 'AWS (ECS, Lambda, S3)' },
            { id: 't2', name: 'Docker & Kubernetes' },
            { id: 't3', name: 'Git & GitHub Actions CI/CD' },
            { id: 't4', name: 'Jest & Cypress' }
          ],
          softSkills: [
            { id: 'ss1', name: 'Agile Sprint Ownership' },
            { id: 'ss2', name: 'Cross-Functional Collaboration' },
            { id: 'ss3', name: 'Code Review & Quality Standards' }
          ],
          projects: [
            {
              id: 'proj1',
              name: 'Cloud-Scale Microservices Orchestrator',
              technologies: 'TypeScript, Node.js, Redis, Docker, AWS',
              description: '• Architected asynchronous message-driven microservices processing 5M+ daily requests with sub-40ms latency.\n• Integrated Redis distributed locks and caching layers, decreasing database load by 60%.',
              link: 'https://github.com/alexmorgan-dev/microservices-orchestrator'
            },
            {
              id: 'proj2',
              name: 'AI Real-Time Collaborative Analytics Engine',
              technologies: 'React 19, WebSockets, Python, FastAPI, Tailwind CSS',
              description: '• Developed interactive analytics dashboard with live WebSocket data streams supporting 1,000+ concurrent clients.\n• Integrated AI inference layer for automated trend prediction with 94% accuracy.',
              link: 'https://github.com/alexmorgan-dev/realtime-analytics'
            }
          ],
          languages: [
            { id: 'lang1', name: 'English', proficiency: 'Native / Bilingual' }
          ],
          certifications: [
            { id: 'cert1', name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2024' },
            { id: 'cert2', name: 'Meta Certified Full-Stack Developer', issuer: 'Meta', date: '2023' }
          ],
          achievements: [
            { id: 'ach1', name: '1st Place Winner – Regional Tech Hackathon (out of 200+ teams).' },
            { id: 'ach2', name: 'Authored popular open-source utility with 800+ GitHub stars.' }
          ],
          positionsOfResponsibility: [
            { id: 'pos1', organization: 'Developer Community', role: 'Sprint Tech Lead', duration: '2023 - Present', description: 'Led code reviews and sprint delivery for team of 6 engineers.' }
          ],
          interests: [
            { id: 'int1', name: 'Distributed Cloud Systems' },
            { id: 'int2', name: 'Open-Source Tooling' }
          ],
          sectionOrder: ['summary', 'experience', 'skills', 'projects', 'tools', 'education', 'softSkills', 'certifications', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references'],
          atsScore: 96
        };
      }
    }

    if (generatedResume) {
      if (!generatedResume.sectionOrder || !Array.isArray(generatedResume.sectionOrder) || generatedResume.sectionOrder.length === 0) {
        generatedResume.sectionOrder = level === 'entry'
          ? ['summary', 'education', 'skills', 'projects', 'experience', 'tools', 'softSkills', 'certifications', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references']
          : level === 'senior'
          ? ['summary', 'experience', 'skills', 'tools', 'softSkills', 'projects', 'certifications', 'education', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references']
          : ['summary', 'experience', 'skills', 'projects', 'tools', 'education', 'softSkills', 'certifications', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references'];
      }
    }

    res.json({ resume: generatedResume });
  } catch (error) {
    console.error('Error generating resume from JD:', error);
    res.status(500).json({ error: 'Failed to generate resume from Job Description.' });
  }
};

