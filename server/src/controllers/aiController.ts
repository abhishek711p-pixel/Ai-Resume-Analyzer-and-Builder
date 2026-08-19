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
// Normalization helper to guarantee valid ResumeData structure matching client types
const normalizeResumeData = (raw: any, title: string, level: string): any => {
  if (!raw || typeof raw !== 'object') return null;

  const pInfo = raw.personalInfo || {};
  const fullName = pInfo.fullName || pInfo.name || 'Alex Morgan';
  const jobTitle = pInfo.jobTitle || pInfo.title || title;
  const summary = pInfo.summary || pInfo.professionalSummary || '';
  const email = pInfo.email || 'alex.morgan.work@gmail.com';
  const phone = pInfo.phone || '+1 (555) 382-9104';
  const location = pInfo.location || 'San Francisco, CA';
  const website = pInfo.website || 'https://alexmorgan.dev';
  const linkedin = pInfo.linkedin || 'https://linkedin.com/in/alexmorgan-dev';
  const github = pInfo.github || 'https://github.com/alexmorgan-dev';

  // Experience normalization
  let expList: any[] = [];
  if (Array.isArray(raw.experience)) {
    expList = raw.experience.map((exp: any, idx: number) => {
      let desc = exp.description || exp.responsibilities || exp.bullets || '';
      if (Array.isArray(desc)) {
        desc = desc.map((b: string) => b.startsWith('•') ? b : `• ${b}`).join('\n');
      } else if (typeof desc === 'string') {
        desc = desc.split('\n').map((b: string) => {
          const trimmed = b.trim();
          if (!trimmed) return '';
          return trimmed.startsWith('•') ? trimmed : `• ${trimmed}`;
        }).filter(Boolean).join('\n');
      }

      return {
        id: exp.id || `exp${idx + 1}`,
        role: exp.role || exp.title || exp.jobTitle || title,
        company: exp.company || exp.organization || 'Tech Innovations Inc.',
        location: exp.location || 'San Francisco, CA',
        duration: exp.duration || (exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : '2023 - Present'),
        startDate: exp.startDate || '2023',
        endDate: exp.endDate || 'Present',
        description: desc
      };
    });
  }

  // Education normalization
  let eduList: any[] = [];
  if (Array.isArray(raw.education)) {
    eduList = raw.education.map((edu: any, idx: number) => ({
      id: edu.id || `edu${idx + 1}`,
      degree: edu.degree || 'Bachelor of Science',
      fieldOfStudy: edu.fieldOfStudy || edu.major || 'Computer Science',
      institution: edu.institution || edu.university || 'University of California, Berkeley',
      location: edu.location || 'Berkeley, CA',
      duration: edu.duration || (edu.year ? `${edu.year}` : level === 'entry' ? '2022 - 2026' : level === 'senior' ? '2012 - 2016' : '2017 - 2021'),
      graduationDate: edu.graduationDate || edu.duration || (edu.year ? `${edu.year}` : '2021')
    }));
  }

  // Helper for item arrays (skills, tools, softSkills, achievements, languages, interests)
  const mapItems = (arr: any, prefix: string): { id: string; name: string }[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map((item: any, idx: number) => {
      if (typeof item === 'string') {
        return { id: `${prefix}${idx + 1}`, name: item };
      }
      return { id: item.id || `${prefix}${idx + 1}`, name: item.name || item.title || String(item) };
    });
  };

  // Projects normalization
  let projList: any[] = [];
  if (Array.isArray(raw.projects)) {
    projList = raw.projects.map((proj: any, idx: number) => {
      let tech = proj.technologies || proj.techStack || '';
      if (Array.isArray(tech)) {
        tech = tech.join(', ');
      }
      let desc = proj.description || proj.bullets || '';
      if (Array.isArray(desc)) {
        desc = desc.map((b: string) => b.startsWith('•') ? b : `• ${b}`).join('\n');
      }

      return {
        id: proj.id || `proj${idx + 1}`,
        name: proj.name || proj.title || `Project ${idx + 1}`,
        technologies: tech,
        description: desc,
        link: proj.link || proj.url || `https://github.com/alexmorgan-dev/project-${idx + 1}`,
        url: proj.link || proj.url || `https://github.com/alexmorgan-dev/project-${idx + 1}`
      };
    });
  }

  // Certifications normalization
  let certList: any[] = [];
  if (Array.isArray(raw.certifications)) {
    certList = raw.certifications.map((c: any, idx: number) => {
      if (typeof c === 'string') {
        return { id: `cert${idx + 1}`, name: c, issuer: 'Accredited Authority', date: '2024' };
      }
      return {
        id: c.id || `cert${idx + 1}`,
        name: c.name || c.title || String(c),
        issuer: c.issuer || 'Accredited Authority',
        date: c.date || '2024'
      };
    });
  }

  // Position of Responsibility
  let posList: any[] = [];
  if (Array.isArray(raw.positionsOfResponsibility)) {
    posList = raw.positionsOfResponsibility.map((pos: any, idx: number) => ({
      id: pos.id || `pos${idx + 1}`,
      role: pos.role || pos.title || 'Technical Lead & Mentor',
      organization: pos.organization || 'Developer Society',
      duration: pos.duration || '2023 - Present',
      description: pos.description || 'Led technical workshops and sprint planning sessions.'
    }));
  }

  const defaultOrder = level === 'entry'
    ? ['summary', 'education', 'skills', 'projects', 'experience', 'tools', 'softSkills', 'certifications', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references']
    : level === 'senior'
    ? ['summary', 'experience', 'skills', 'tools', 'softSkills', 'projects', 'certifications', 'education', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references']
    : ['summary', 'experience', 'skills', 'projects', 'tools', 'education', 'softSkills', 'certifications', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references'];

  return {
    personalInfo: {
      fullName,
      jobTitle,
      email,
      phone,
      location,
      summary,
      website,
      linkedin,
      github
    },
    experience: expList,
    education: eduList,
    skills: mapItems(raw.skills, 's'),
    tools: mapItems(raw.tools, 't'),
    softSkills: mapItems(raw.softSkills, 'ss'),
    projects: projList,
    certifications: certList,
    achievements: mapItems(raw.achievements, 'ach'),
    positionsOfResponsibility: posList,
    languages: mapItems(raw.languages, 'lang').length > 0 ? mapItems(raw.languages, 'lang') : [{ id: 'lang1', name: 'English' }],
    interests: mapItems(raw.interests, 'int'),
    references: [],
    sectionOrder: Array.isArray(raw.sectionOrder) && raw.sectionOrder.length > 0 ? raw.sectionOrder : defaultOrder,
    atsScore: raw.atsScore || 96
  };
};

export const generateFromJd = async (req: Request, res: Response) => {
  try {
    const { jobTitle, jobDescription, experienceLevel, keySkills } = req.body;

    if (!jobTitle && !jobDescription) {
      return res.status(400).json({ error: 'Please provide both Job Title and Job Description.' });
    }

    const title = jobTitle || 'Software Engineer';
    const level = (experienceLevel || 'mid').toLowerCase(); 
    const jdText = (jobDescription || '').toLowerCase();
    const titleText = title.toLowerCase();
    const combinedText = `${titleText} ${jdText} ${(keySkills || '').toLowerCase()}`;

    // Complete 12-Domain Detection Matrix
    const isPython = combinedText.includes('python') || combinedText.includes('django') || combinedText.includes('fastapi') || combinedText.includes('flask');
    const isJava = combinedText.includes('java') || combinedText.includes('spring') || combinedText.includes('hibernate') || combinedText.includes('springboot');
    const isAI = combinedText.includes('machine learning') || combinedText.includes(' ai ') || combinedText.includes('deep learning') || combinedText.includes('pytorch') || combinedText.includes('tensorflow') || combinedText.includes('nlp') || combinedText.includes('llm') || combinedText.includes('data scientist');
    const isDataAnalyst = combinedText.includes('data analyst') || combinedText.includes('business intelligence') || combinedText.includes('tableau') || combinedText.includes('power bi') || combinedText.includes('powerbi') || combinedText.includes('snowflake') || combinedText.includes('dbt');
    const isDevOps = combinedText.includes('devops') || combinedText.includes('cloud') || combinedText.includes('sre') || combinedText.includes('kubernetes') || combinedText.includes('terraform') || combinedText.includes('infrastructure') || combinedText.includes('aws') || combinedText.includes('docker');
    const isSecurity = combinedText.includes('security') || combinedText.includes('cyber') || combinedText.includes('soc') || combinedText.includes('penetration') || combinedText.includes('siem') || combinedText.includes('vulnerability');
    const isIOS = combinedText.includes('ios') || combinedText.includes('swift') || combinedText.includes('swiftui') || combinedText.includes('apple') || combinedText.includes('xcode');
    const isAndroid = combinedText.includes('android') || combinedText.includes('kotlin') || combinedText.includes('jetpack');
    const isSEO = combinedText.includes('seo') || combinedText.includes('marketing') || combinedText.includes('growth') || combinedText.includes('content') || combinedText.includes('google search console');
    const isProduct = combinedText.includes('product manager') || combinedText.includes('product management') || combinedText.includes('prd') || combinedText.includes('roadmap') || combinedText.includes('scrum master') || combinedText.includes('agile coach');
    const isQA = combinedText.includes('qa') || combinedText.includes('quality assurance') || combinedText.includes('automation engineer') || combinedText.includes('selenium') || combinedText.includes('cypress') || combinedText.includes('testing');

    let generatedResume: any = null;

    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        const systemPrompt = `You are an elite Principal Technical Recruiter and Chief ATS Resume Architect at a FAANG executive firm.
Your job is to construct a 100% tailor-fit ATS resume JSON extracting all core technologies, tools, and responsibilities directly from the provided Job Description.

CRITICAL INSTRUCTIONS:
1. STRICT JD KEYWORD EXTRACTION:
   - Extract the EXACT programming languages, frameworks, libraries, cloud platforms, and methodologies mentioned in the Job Description (e.g. if Python/Django/Celery is requested, do NOT use React/JavaScript!).
   - Weave these exact keywords into personalInfo.summary, skills, tools, experience bullets, and projects.
2. GOOGLE X-Y-Z BULLET FORMULA:
   - Every experience and project bullet point MUST strictly follow: "• Accomplished [X] as measured by [Y], by doing [Z]" with realistic quantifiable metrics (latency %, throughput, revenue, cost savings, test coverage).
3. SENIORITY CALIBRATION:
   - Entry / Fresher (0-2 yrs): Education 2022-2026, junior/intern roles, heavy emphasis on projects & computer science foundations.
   - Mid-Level (3-5 yrs): Education 2017-2021, full-time production engineering roles, scaling & CI/CD metrics.
   - Senior Level (5+ yrs): Education 2012-2016, Lead/Staff Architect roles, multi-team leadership, 99.99% SLA uptime, cloud cost reductions.
4. FORMAT: Return ONLY a valid JSON object matching this schema:
{
  "personalInfo": { "fullName": "Alex Morgan", "jobTitle": "...", "email": "alex.morgan.work@gmail.com", "phone": "+1 (555) 382-9104", "location": "San Francisco, CA", "summary": "2-3 sentence executive summary with JD keywords and metrics", "website": "https://alexmorgan.dev", "linkedin": "https://linkedin.com/in/alexmorgan-dev", "github": "https://github.com/alexmorgan-dev" },
  "education": [{ "degree": "Bachelor of Science in Computer Science", "fieldOfStudy": "Computer Science", "institution": "University of California, Berkeley", "location": "Berkeley, CA", "duration": "..." }],
  "experience": [{ "role": "...", "company": "...", "location": "San Francisco, CA", "duration": "...", "description": "• Bullet 1 with X-Y-Z\\n• Bullet 2 with X-Y-Z" }],
  "projects": [{ "name": "...", "technologies": "...", "description": "• Project bullet with X-Y-Z", "link": "https://github.com/alexmorgan-dev/..." }],
  "skills": ["<hard skill 1 from JD>", "<hard skill 2 from JD>", "<hard skill 3 from JD>", "<hard skill 4 from JD>", "<hard skill 5 from JD>", "<hard skill 6 from JD>"],
  "tools": ["<tool 1 from JD>", "<tool 2 from JD>", "<tool 3 from JD>", "<tool 4 from JD>", "<tool 5 from JD>"],
  "softSkills": ["Cross-Functional Collaboration", "Agile Sprint Delivery", "Technical Problem Solving"],
  "certifications": [{ "name": "<Recognized certification in this field>", "issuer": "...", "date": "2024" }],
  "achievements": ["1st Place Winner – National Hackathon 2024 (out of 250+ teams)"],
  "positionsOfResponsibility": [{ "organization": "Developer Community", "role": "Technical Lead & Mentor", "duration": "2023 - Present", "description": "Mentored 100+ developers in modern architecture and code quality." }],
  "languages": ["English"],
  "interests": ["Distributed Systems", "Open Source Development"],
  "atsScore": 96
}`;

        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { 
              role: 'user', 
              content: `Target Job Title: ${title}\nExperience Level: ${level}\n${keySkills ? `Priority Skills: ${keySkills}\n` : ''}Target Job Description & Requirements:\n"""\n${jobDescription || title}\n"""\n\nGenerate the 100% tailor-fit ATS resume JSON object now.` 
            }
          ],
          model: GROQ_MODEL,
          temperature: 0.25,
          max_tokens: 3500
        });

        let content = chatCompletion.choices[0]?.message?.content?.trim() || '{}';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          content = jsonMatch[0];
        }
        // Clean trailing commas before closing braces/brackets
        content = content.replace(/,\s*([\]}])/g, '$1');
        const parsed = JSON.parse(content);
        generatedResume = normalizeResumeData(parsed, title, level);
      } catch (err) {
        console.warn('Groq error generating resume, using fallback:', err);
      }
    }

    if (!generatedResume) {
      let domainSkills: { id: string; name: string }[] = [];
      let domainTools: { id: string; name: string }[] = [];
      let domainCertifications: { id: string; name: string; issuer: string; date: string }[] = [];
      let domainProjects: any[] = [];
      let domainBullets: { exp1: string; exp2: string } = { exp1: '', exp2: '' };
      let domainSummary = '';

      if (isIOS) {
        domainSummary = `Distinguished ${title} specializing in modern iOS application development with Swift, SwiftUI, Combine, and scalable VIPER/MVVM architectures. Proven track record of maintaining 99.98% crash-free sessions across 3M+ active app installations and optimizing frame rates to 120fps on ProMotion displays.`;
        domainSkills = [{ id: 's1', name: 'Swift (5.9/6.0)' }, { id: 's2', name: 'SwiftUI & UIKit' }, { id: 's3', name: 'Combine & Async/Await' }, { id: 's4', name: 'CoreData & SwiftData' }, { id: 's5', name: 'MVVM & VIPER Architecture' }, { id: 's6', name: 'REST & GraphQL APIs' }];
        domainTools = [{ id: 't1', name: 'Xcode & Instruments' }, { id: 't2', name: 'TestFlight & App Store Connect' }, { id: 't3', name: 'Fastlane & GitHub Actions CI' }, { id: 't4', name: 'CocoaPods & SPM' }, { id: 't5', name: 'XCTest & Quick/Nimble' }];
        domainCertifications = [{ id: 'cert1', name: 'Apple Certified iOS Developer', issuer: 'Apple', date: '2024' }, { id: 'cert2', name: 'Meta iOS Developer Professional Certificate', issuer: 'Meta', date: '2023' }];
        domainProjects = [
          { id: 'proj1', name: 'Next-Gen FinTech iOS Application', technologies: 'Swift, SwiftUI, Combine, SwiftData, Fastlane', description: '• Architected native iOS mobile banking client supporting biometric authentication and real-time biometric transactions with <0.02% crash rate.\n• Transitioned 60+ legacy UIKit view controllers to declarative SwiftUI, accelerating UI sprint delivery velocity by 45%.', link: 'https://github.com/alexmorgan-dev/ios-fintech' }
        ];
        domainBullets = {
          exp1: '• Accomplished a 99.98% crash-free session rate as measured by Firebase Crashlytics, by modernizing legacy UIKit codebase to Swift Concurrency and memory-safe actors.\n• Optimized memory allocations and render pipelines using Xcode Instruments, eliminating frame drops and achieving steady 120 FPS animations.\n• Automated App Store build and deployment workflows with Fastlane and GitHub Actions, cutting release distribution time from 4 hours to 15 minutes.',
          exp2: '• Engineered core networking layers with Combine and URLSession, caching offline transaction data via CoreData.\n• Mentored team of 6 iOS developers in reactive programming patterns and unit testing with XCTest, raising test coverage to 92%.'
        };
      } else if (isAndroid) {
        domainSummary = `Accomplished ${title} with deep expertise in Android SDK, Kotlin, Jetpack Compose, and modern clean MVVM architecture. Track record of reducing app startup time by 48% and publishing 5-star mobile experiences serving millions of global users.`;
        domainSkills = [{ id: 's1', name: 'Kotlin & Coroutines' }, { id: 's2', name: 'Jetpack Compose & Material 3' }, { id: 's3', name: 'Room Database & SQLite' }, { id: 's4', name: 'Dagger Hilt & Koin (DI)' }, { id: 's5', name: 'Retrofit & OkHttp' }, { id: 's6', name: 'Clean Architecture (MVI/MVVM)' }];
        domainTools = [{ id: 't1', name: 'Android Studio & Profiler' }, { id: 't2', name: 'Google Play Console' }, { id: 't3', name: 'Gradle & Kotlin DSL' }, { id: 't4', name: 'JUnit 5 & MockK' }, { id: 't5', name: 'Firebase & WorkManager' }];
        domainCertifications = [{ id: 'cert1', name: 'Google Associate Android Developer', issuer: 'Google', date: '2024' }, { id: 'cert2', name: 'Meta Android Developer Certificate', issuer: 'Meta', date: '2023' }];
        domainProjects = [
          { id: 'proj1', name: 'Real-Time Streaming & Commerce Android App', technologies: 'Kotlin, Jetpack Compose, Coroutines, Flow, Hilt', description: '• Built fluid multi-media Android application processing live audio/video streams with sub-100ms buffering latency.\n• Integrated offline-first data sync with Room database and WorkManager.', link: 'https://github.com/alexmorgan-dev/android-stream' }
        ];
        domainBullets = {
          exp1: '• Accomplished a 48% reduction in app cold start latency by optimizing dependency injection graphs with Dagger Hilt and baseline profiles.\n• Spearheaded the full migration from legacy XML layouts to Jetpack Compose, reducing UI codebase lines by 40%.\n• Integrated automated CI testing pipeline with Gradle and GitHub Actions, ensuring zero regression bugs across 200+ device models.',
          exp2: '• Developed high-performance REST networking client with Retrofit, Kotlin Flow, and custom OkHttp interceptors.\n• Authored comprehensive unit and UI tests using MockK and Espresso, elevating overall coverage to 90%.'
        };
      } else if (isDevOps) {
        domainSummary = `Results-oriented ${title} with extensive expertise in Kubernetes cluster orchestration, Terraform infrastructure as code (IaC), and AWS cloud architectures. Track record of achieving 99.99% system availability and cutting annual infrastructure costs by $150k+.`;
        domainSkills = [{ id: 's1', name: 'Kubernetes (EKS/GKE)' }, { id: 's2', name: 'Terraform & Infrastructure as Code' }, { id: 's3', name: 'AWS & Google Cloud Platform' }, { id: 's4', name: 'Docker & Container Security' }, { id: 's5', name: 'CI/CD (GitHub Actions/GitLab)' }, { id: 's6', name: 'Helm & ArgoCD (GitOps)' }];
        domainTools = [{ id: 't1', name: 'Prometheus & Grafana' }, { id: 't2', name: 'Datadog & ELK Stack' }, { id: 't3', name: 'HashiCorp Vault' }, { id: 't4', name: 'Ansible' }, { id: 't5', name: 'Linux Kernel & Bash' }];
        domainCertifications = [{ id: 'cert1', name: 'Certified Kubernetes Administrator (CKA)', issuer: 'Linux Foundation', date: '2024' }, { id: 'cert2', name: 'AWS Certified DevOps Engineer – Professional', issuer: 'Amazon Web Services', date: '2023' }];
        domainProjects = [
          { id: 'proj1', name: 'Zero-Downtime Multi-Region GitOps Deployment Platform', technologies: 'Kubernetes, Terraform, ArgoCD, Helm, AWS EKS', description: '• Architected multi-region Kubernetes platform with automated canary rollouts and zero-downtime cluster upgrades across 80+ microservices.', link: 'https://github.com/alexmorgan-dev/gitops-cloud' }
        ];
        domainBullets = {
          exp1: '• Accomplished a 75% reduction in production release deployment cycle time by implementing declarative GitOps pipelines with ArgoCD and Helm.\n• Engineered automated cloud auto-scaling policies on AWS EKS and Karpenter, decreasing compute spend by $150,000 annually.\n• Configured end-to-end observability with Prometheus, Grafana, and Datadog, reducing MTTR for Sev-1 incidents from 45 to 8 minutes.',
          exp2: '• Automated infrastructure provisioning across dev, staging, and prod using modular Terraform and HashiCorp Vault.\n• Hardened container images and cluster network policies, achieving 100% compliance with SOC2 Type II audits.'
        };
      } else if (isProduct) {
        domainSummary = `Strategic ${title} with a data-driven approach to product discovery, user experience optimization, and agile lifecycle execution. Proven track record of launching features that drove $12M+ in incremental ARR and lifted trial-to-paid conversion by 34%.`;
        domainSkills = [{ id: 's1', name: 'Product Strategy & Vision' }, { id: 's2', name: 'Product Requirements Documents (PRD)' }, { id: 's3', name: 'A/B Testing & Conversion Rate Opt' }, { id: 's4', name: 'User Journey Mapping' }, { id: 's5', name: 'Roadmap Prioritization (RICE/MoSCoW)' }, { id: 's6', name: 'SQL & Product Analytics' }];
        domainTools = [{ id: 't1', name: 'Jira & Confluence' }, { id: 't2', name: 'Amplitude & Mixpanel' }, { id: 't3', name: 'Figma & Miro' }, { id: 't4', name: 'Google Analytics 4' }, { id: 't5', name: 'Hotjar & UserTesting' }];
        domainCertifications = [{ id: 'cert1', name: 'Product School: Certified Product Manager (CPM)', issuer: 'Product School', date: '2024' }, { id: 'cert2', name: 'Scrum Alliance: Certified Scrum Product Owner (CSPO)', issuer: 'Scrum Alliance', date: '2023' }];
        domainProjects = [
          { id: 'proj1', name: 'Self-Serve Onboarding & Product Growth Engine', technologies: 'Amplitude, Figma, SQL, Jira, Mixpanel', description: '• Led cross-functional squad of 12 engineers and designers to launch revamped onboarding funnel, boosting user activation rate from 24% to 58%.', link: 'https://github.com/alexmorgan-dev/product-case-study' }
        ];
        domainBullets = {
          exp1: '• Accomplished a 34% lift in trial-to-paid subscription conversion by running iterative multivariate A/B tests on checkout and pricing tiers.\n• Authored 30+ comprehensive PRDs with clear acceptance criteria, driving 100% on-time sprint releases across two cross-functional engineering squads.\n• Analyzed user behavior funnels in Amplitude, identifying key drop-off bottlenecks and improving 30-day user retention by 22%.',
          exp2: '• Partnered with C-suite executives and enterprise clients to define and prioritize the annual product roadmap.\n• Conducted 50+ qualitative customer discovery interviews, directly shaping high-priority product initiatives.'
        };
      } else if (isQA) {
        domainSummary = `Detail-oriented ${title} specializing in end-to-end automated testing frameworks, API performance testing, and continuous quality assurance. Proven record of expanding test automation coverage from 20% to 94% and preventing critical defects in production.`;
        domainSkills = [{ id: 's1', name: 'Test Automation (Selenium/Cypress/Playwright)' }, { id: 's2', name: 'API Testing (Postman/RestAssured)' }, { id: 's3', name: 'BDD/TDD Frameworks (Cucumber)' }, { id: 's4', name: 'Performance Testing (JMeter/k6)' }, { id: 's5', name: 'Python & JavaScript for Automation' }, { id: 's6', name: 'Defect Triage & Root Cause Analysis' }];
        domainTools = [{ id: 't1', name: 'Playwright & Cypress' }, { id: 't2', name: 'Selenium WebDriver' }, { id: 't3', name: 'Jira & Xray' }, { id: 't4', name: 'GitHub Actions & Jenkins CI' }, { id: 't5', name: 'Docker & Selenium Grid' }];
        domainCertifications = [{ id: 'cert1', name: 'ISTQB Certified Tester – Advanced Level', issuer: 'ISTQB', date: '2024' }, { id: 'cert2', name: 'Selenium Automation Certified Professional', issuer: 'Test Automation University', date: '2023' }];
        domainProjects = [
          { id: 'proj1', name: 'Distributed Cross-Browser Playwright Automation Suite', technologies: 'Playwright, TypeScript, Docker, GitHub Actions, Allure Report', description: '• Built parallelized end-to-end test automation framework executing 1,500+ test scenarios across Chrome, Safari, and Firefox in under 8 minutes.', link: 'https://github.com/alexmorgan-dev/qa-automation-suite' }
        ];
        domainBullets = {
          exp1: '• Accomplished an 80% reduction in regression testing execution time by building a parallelized Playwright & TypeScript test framework integrated into GitHub Actions CI.\n• Increased automated test coverage from 22% to 94%, reducing production incident bug escapes by 65%.\n• Designed and executed load testing scripts in k6 simulating 20,000 concurrent users to validate payment gateway SLA resilience.',
          exp2: '• Authored comprehensive test plans, test matrices, and automated API tests using RestAssured and Postman.\n• Partnered with engineering teams in sprint planning to enforce shift-left testing methodologies.'
        };
      } else if (isAI) {
        domainSummary = `Innovative ${title} specializing in deep learning architectures, LLM fine-tuning, and scalable MLOps deployment pipelines. Proven track record of boosting model inference efficiency by 45% and shipping production AI systems serving millions of daily inferences.`;
        domainSkills = [{ id: 's1', name: 'Python' }, { id: 's2', name: 'PyTorch' }, { id: 's3', name: 'TensorFlow' }, { id: 's4', name: 'Hugging Face' }, { id: 's5', name: 'Scikit-Learn' }, { id: 's6', name: 'Vector DBs (Pinecone/Milvus)' }];
        domainTools = [{ id: 't1', name: 'CUDA & GPU Optimization' }, { id: 't2', name: 'Docker & Kubernetes' }, { id: 't3', name: 'MLflow & Weights & Biases' }, { id: 't4', name: 'AWS SageMaker' }, { id: 't5', name: 'FastAPI' }];
        domainCertifications = [{ id: 'cert1', name: 'AWS Certified Machine Learning – Specialty', issuer: 'Amazon Web Services', date: '2024' }, { id: 'cert2', name: 'TensorFlow Developer Certificate', issuer: 'Google', date: '2023' }];
        domainProjects = [
          { id: 'proj1', name: 'High-Throughput RAG & LLM Inference Pipeline', technologies: 'Python, PyTorch, LangChain, Pinecone, FastAPI', description: '• Architected low-latency retrieval-augmented generation pipeline processing 50k+ daily queries with sub-180ms response time.\n• Optimized transformer attention kernels with TensorRT-LLM, cutting GPU memory overhead by 40%.', link: 'https://github.com/alexmorgan-dev/rag-inference-engine' },
          { id: 'proj2', name: 'Real-Time Anomaly Detection & Vision System', technologies: 'PyTorch, OpenCV, Docker, Kafka, Python', description: '• Developed computer vision classification model achieving 98.4% F1-score across 1M+ industrial inspection images.', link: 'https://github.com/alexmorgan-dev/anomaly-vision' }
        ];
        domainBullets = {
          exp1: '• Accomplished a 45% reduction in model inference latency as measured by p99 benchmarks, by quantizing FP32 transformer models to INT8 using TensorRT.\n• Engineered automated continuous training and validation pipelines in MLflow and Kubernetes, reducing model retraining cycle from 2 weeks to 8 hours.\n• Deployed scalable FastAPI microservices handling 3,500 requests/sec with 99.98% uptime.',
          exp2: '• Built distributed data preprocessing pipelines with PySpark and Pandas, processing 15TB+ of multi-modal training datasets.\n• Collaborated with product teams to integrate conversational AI features, driving a 28% increase in user retention.'
        };
      } else if (isPython) {
        domainSummary = `Results-driven ${title} with deep expertise in Python, Django, FastAPI, and asynchronous backend microservices. Proven track record of scaling high-concurrency APIs, optimizing PostgreSQL query plans, and reducing server compute costs by 35%.`;
        domainSkills = [{ id: 's1', name: 'Python' }, { id: 's2', name: 'Django & Django REST Framework' }, { id: 's3', name: 'FastAPI & AsyncIO' }, { id: 's4', name: 'PostgreSQL & SQLAlchemy' }, { id: 's5', name: 'Redis & Celery' }, { id: 's6', name: 'REST & GraphQL APIs' }];
        domainTools = [{ id: 't1', name: 'Docker & Kubernetes' }, { id: 't2', name: 'AWS (ECS, Lambda, RDS)' }, { id: 't3', name: 'Kafka & RabbitMQ' }, { id: 't4', name: 'Git & GitHub Actions' }, { id: 't5', name: 'pytest & Postman' }];
        domainCertifications = [{ id: 'cert1', name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2024' }, { id: 'cert2', name: 'Certified Python Professional (PCPP1)', issuer: 'Python Institute', date: '2023' }];
        domainProjects = [
          { id: 'proj1', name: 'Asynchronous Distributed Task Processing Engine', technologies: 'Python, FastAPI, Celery, Redis, PostgreSQL', description: '• Engineered asynchronous task broker handling 2M+ background jobs daily with zero task loss and automated dead-letter queues.\n• Implemented database connection pooling, reducing database connection latency by 50%.', link: 'https://github.com/alexmorgan-dev/async-task-engine' },
          { id: 'proj2', name: 'High-Concurrency Financial Transaction API', technologies: 'Django, PostgreSQL, Docker, AWS', description: '• Built idempotent payment transaction ledger processing $10M+ monthly transactions with strict ACID compliance.', link: 'https://github.com/alexmorgan-dev/finance-api' }
        ];
        domainBullets = {
          exp1: '• Accomplished a 40% improvement in backend throughput as measured by requests per second, by migrating blocking synchronous endpoints to asynchronous FastAPI with AsyncPG.\n• Architected distributed caching layers with Redis and Celery, decreasing primary PostgreSQL read load by 65%.\n• Automated unit and integration testing in pytest, boosting code coverage from 62% to 94%.',
          exp2: '• Engineered RESTful APIs in Django REST Framework supporting 400k+ active users.\n• Optimized database schema and indexes, resolving slow query bottlenecks and reducing median response times by 3x.'
        };
      } else if (isJava) {
        domainSummary = `Enterprise-grade ${title} with extensive experience architecting Java, Spring Boot, and cloud-native microservices. Proven expertise in multi-threading, distributed caching, Kafka event streaming, and relational database tuning.`;
        domainSkills = [{ id: 's1', name: 'Java (17/21)' }, { id: 's2', name: 'Spring Boot & Spring Cloud' }, { id: 's3', name: 'Hibernate & JPA' }, { id: 's4', name: 'Microservices Architecture' }, { id: 's5', name: 'PostgreSQL & Oracle' }, { id: 's6', name: 'Apache Kafka' }];
        domainTools = [{ id: 't1', name: 'Docker & Kubernetes' }, { id: 't2', name: 'AWS (ECS, SQS, RDS)' }, { id: 't3', name: 'Maven & Gradle' }, { id: 't4', name: 'JUnit 5 & Mockito' }, { id: 't5', name: 'Prometheus & Grafana' }];
        domainCertifications = [{ id: 'cert1', name: 'Oracle Certified Professional: Java SE Developer', issuer: 'Oracle', date: '2024' }, { id: 'cert2', name: 'AWS Certified Developer – Associate', issuer: 'Amazon Web Services', date: '2023' }];
        domainProjects = [
          { id: 'proj1', name: 'Enterprise Event-Driven Order Fulfillment System', technologies: 'Java 21, Spring Boot, Kafka, PostgreSQL, Docker', description: '• Architected resilient asynchronous microservices processing 15,000 orders/min with distributed Saga pattern transaction management.\n• Cut inter-service communication latency by 45% using gRPC and Redis caching.', link: 'https://github.com/alexmorgan-dev/spring-fulfillment' }
        ];
        domainBullets = {
          exp1: '• Accomplished a 48% reduction in inter-service communication latency by refactoring monolithic services into decoupled Spring Boot microservices with Kafka streaming.\n• Optimized JVM garbage collection tuning (G1GC) and database connection pools (HikariCP), eliminating memory leaks and maintaining 99.99% SLA.\n• Spearheaded test automation with JUnit 5 and Testcontainers, elevating code quality and reducing bug escape rate by 40%.',
          exp2: '• Developed core REST APIs for enterprise banking portal supporting 1.2M daily transactions.\n• Managed Oracle to PostgreSQL database migration with zero customer downtime.'
        };
      } else if (isSecurity) {
        domainSummary = `Vigilant ${title} specializing in threat detection, SIEM log analysis, vulnerability management, and incident response. Proven track record of reducing Mean Time to Remediate (MTTR) by 50% and safeguarding enterprise infrastructure against advanced persistent threats (APTs).`;
        domainSkills = [{ id: 's1', name: 'SIEM (Splunk/Elastic)' }, { id: 's2', name: 'Incident Response & Triage' }, { id: 's3', name: 'Threat Intelligence (MITRE ATT&CK)' }, { id: 's4', name: 'Network Security & Wireshark' }, { id: 's5', name: 'Vulnerability Assessment (Nessus)' }, { id: 's6', name: 'Python for Security Automation' }];
        domainTools = [{ id: 't1', name: 'Splunk & QRadar' }, { id: 't2', name: 'CrowdStrike Falcon & EDR' }, { id: 't3', name: 'Wireshark & Nmap' }, { id: 't4', name: 'Burp Suite' }, { id: 't5', name: 'Linux Security & Firewalls' }];
        domainCertifications = [{ id: 'cert1', name: 'CompTIA Security+ (SY0-701)', issuer: 'CompTIA', date: '2024' }, { id: 'cert2', name: 'Certified Information Systems Security Professional (CISSP)', issuer: 'ISC2', date: '2023' }];
        domainProjects = [
          { id: 'proj1', name: 'Automated SOC Phishing & Threat Triage Bot', technologies: 'Python, Splunk API, VirusTotal, Docker, Slack API', description: '• Automated security event correlation and enrichment, reducing Tier 1 SOC analyst alert triage time from 25 minutes to 90 seconds.\n• Analyzed and blocked 1,200+ malicious indicators of compromise (IoCs) in real-time.', link: 'https://github.com/alexmorgan-dev/soc-triage-bot' }
        ];
        domainBullets = {
          exp1: '• Accomplished a 55% reduction in Mean Time to Detect (MTTD) by authoring 40+ custom Splunk correlation searches mapped to the MITRE ATT&CK framework.\n• Led incident response for 15+ critical security events, performing root-cause analysis, memory forensics, and containment within SLA limits.\n• Conducted bi-weekly vulnerability scans across 2,000+ endpoints using Nessus, coordinating remediation with DevOps teams.',
          exp2: '• Monitored real-time firewall and IDS/IPS logs, mitigating DDoS and brute-force intrusion attempts.\n• Developed automated Python scripts for IOC extraction and threat intelligence feed ingestion.'
        };
      } else if (isDataAnalyst) {
        domainSummary = `Insightful ${title} with deep expertise in SQL data modeling, automated ETL pipelines, and executive BI dashboards. Proven ability to translate complex multi-terabyte datasets into actionable business strategies, driving a 28% operational cost reduction.`;
        domainSkills = [{ id: 's1', name: 'Advanced SQL & Data Modeling' }, { id: 's2', name: 'Tableau & PowerBI' }, { id: 's3', name: 'Python (Pandas, NumPy)' }, { id: 's4', name: 'Snowflake & BigQuery' }, { id: 's5', name: 'dbt & Data Warehousing' }, { id: 's6', name: 'Statistical Data Analysis' }];
        domainTools = [{ id: 't1', name: 'Apache Airflow' }, { id: 't2', name: 'Git & GitHub' }, { id: 't3', name: 'Excel (VBA, PowerQuery)' }, { id: 't4', name: 'AWS Redshift' }, { id: 't5', name: 'Jupyter Notebooks' }];
        domainCertifications = [{ id: 'cert1', name: 'Microsoft Certified: Power BI Data Analyst Associate', issuer: 'Microsoft', date: '2024' }, { id: 'cert2', name: 'Tableau Certified Data Analyst', issuer: 'Tableau', date: '2023' }];
        domainProjects = [
          { id: 'proj1', name: 'Executive Revenue & Churn Intelligence Dashboard', technologies: 'SQL, Snowflake, dbt, Tableau, Python', description: '• Built automated ELT pipeline and interactive Tableau dashboard tracking $45M in annual recurring revenue across 8 business units.\n• Uncovered customer churn drivers, directly contributing to a 14% improvement in quarterly customer retention.', link: 'https://github.com/alexmorgan-dev/revenue-analytics' }
        ];
        domainBullets = {
          exp1: '• Accomplished a 55% reduction in daily reporting latency by re-architecting legacy SQL queries into optimized Snowflake data marts using dbt.\n• Designed and delivered 20+ executive BI dashboards adopted by VP-level leadership for strategic resource allocation.\n• Developed customer churn predictive machine learning models in Python, boosting forecasting precision to 92%.',
          exp2: '• Authored complex SQL queries and automated daily ETL pipelines extracting data from Salesforce and Stripe APIs.\n• Conducted A/B test statistical analysis, guiding feature optimization decisions that increased conversion by 18%.'
        };
      } else if (isSEO) {
        domainSummary = `Performance-driven ${title} with proven expertise in Technical SEO, Core Web Vitals optimization, and organic conversion funnels. Demonstrated track record of scaling organic domain traffic by 140%+ and securing #1 Google rankings for high-intent keywords.`;
        domainSkills = [{ id: 's1', name: 'Technical SEO Auditing' }, { id: 's2', name: 'Google Search Console & GA4' }, { id: 's3', name: 'Core Web Vitals Optimization' }, { id: 's4', name: 'Keyword Research & Clustering' }, { id: 's5', name: 'HTML5 Semantic Markup' }, { id: 's6', name: 'Ahrefs & SEMrush' }];
        domainTools = [{ id: 't1', name: 'Screaming Frog SEO Spider' }, { id: 't2', name: 'PageSpeed Insights & Lighthouse' }, { id: 't3', name: 'Schema.org JSON-LD' }, { id: 't4', name: 'WordPress & Webflow' }, { id: 't5', name: 'Looker Studio' }];
        domainCertifications = [{ id: 'cert1', name: 'Google Analytics Individual Qualification', issuer: 'Google', date: '2024' }, { id: 'cert2', name: 'HubSpot Inbound & SEO Certification', issuer: 'HubSpot', date: '2023' }];
        domainProjects = [
          { id: 'proj1', name: 'Enterprise SEO Site Architecture & CWV Revamp', technologies: 'Screaming Frog, Google Search Console, Schema.org, Lighthouse', description: '• Overhauled technical architecture across 400k+ URLs, elevating Core Web Vitals pass rate from 38% to 97% and boosting organic crawl efficiency by 65%.', link: 'https://github.com/alexmorgan-dev/technical-seo-framework' }
        ];
        domainBullets = {
          exp1: '• Accomplished a 140% increase in non-branded organic search traffic (2.5M monthly visits) by designing topical keyword clustering and internal linking hubs.\n• Optimized Core Web Vitals (LCP < 1.1s, INP < 70ms) across enterprise web properties, lifting organic search conversion rates by 24%.\n• Diagnosed and resolved critical indexing and canonicalization issues across 500k+ pages using Screaming Frog and GSC.',
          exp2: '• Managed end-to-end On-Page and Technical SEO strategies for high-growth e-commerce storefront.\n• Built automated Looker Studio dashboards tracking keyword ranking distributions and organic revenue attribution.'
        };
      } else {
        domainSummary = `High-impact ${title} with a strong foundation in scalable web architecture, microservices, and performance optimization. Track record of architecting distributed web applications, reducing API response latencies by 42%, and delivering mission-critical product features.`;
        domainSkills = [{ id: 's1', name: 'TypeScript & JavaScript' }, { id: 's2', name: 'React 19 & Next.js' }, { id: 's3', name: 'Node.js & Express' }, { id: 's4', name: 'PostgreSQL & MongoDB' }, { id: 's5', name: 'REST & GraphQL APIs' }, { id: 's6', name: 'State Management (Zustand/Redux)' }];
        domainTools = [{ id: 't1', name: 'AWS (ECS, Lambda, S3)' }, { id: 't2', name: 'Docker & Containerization' }, { id: 't3', name: 'Redis Distributed Cache' }, { id: 't4', name: 'Git & GitHub Actions CI/CD' }, { id: 't5', name: 'Jest & Cypress' }];
        domainCertifications = [{ id: 'cert1', name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', date: '2024' }, { id: 'cert2', name: 'Meta Certified Full-Stack Developer', issuer: 'Meta', date: '2023' }];
        domainProjects = [
          { id: 'proj1', name: 'Cloud-Scale Microservices Orchestrator', technologies: 'TypeScript, Node.js, Redis, Docker, AWS', description: '• Architected asynchronous message-driven microservices processing 5M+ daily requests with sub-40ms latency.\n• Integrated Redis distributed locks, decreasing primary database read load by 60%.', link: 'https://github.com/alexmorgan-dev/microservices-orchestrator' },
          { id: 'proj2', name: 'Real-Time Collaborative Analytics Engine', technologies: 'React 19, WebSockets, Python, FastAPI, Tailwind CSS', description: '• Developed live analytics dashboard with multi-user WebSocket data streams supporting 1,000+ concurrent clients with 94% anomaly alert accuracy.', link: 'https://github.com/alexmorgan-dev/realtime-analytics' }
        ];
        domainBullets = {
          exp1: '• Accomplished a 42% reduction in p99 API response latencies by refactoring backend microservices in Node.js, TypeScript, and Redis caching.\n• Engineered high-performance frontend interfaces in React 19, elevating Google Lighthouse scores from 74 to 99/100.\n• Automated CI/CD test and deployment workflows with Docker and GitHub Actions, reducing release deployment times from 40 to 6 minutes.',
          exp2: '• Engineered transactional RESTful APIs with PostgreSQL, increasing daily query throughput by 3.5x.\n• Built reusable UI component libraries with TypeScript and Tailwind CSS, increasing cross-team code reuse by 50%.'
        };
      }

      if (level === 'entry') {
        generatedResume = {
          personalInfo: {
            fullName: 'Alex Morgan',
            jobTitle: `Junior ${title}`,
            email: 'alex.morgan.dev@gmail.com',
            phone: '+1 (555) 382-9104',
            location: 'San Francisco, CA',
            summary: `High-energy Junior ${title} with strong foundations in Computer Science, Data Structures, and hands-on project delivery. Proven ability to build production-grade applications, win competitive hackathons, and contribute effectively during engineering internships.`,
            website: 'https://alexmorgan.dev',
            linkedin: 'https://linkedin.com/in/alexmorgan-dev',
            github: 'https://github.com/alexmorgan-dev'
          },
          education: [
            {
              id: 'edu1',
              degree: 'Bachelor of Science / Technology in Computer Science',
              fieldOfStudy: 'Computer Science (GPA: 3.85 / 4.0 - Top 5% of Class)',
              institution: 'University of California, Berkeley',
              location: 'Berkeley, CA',
              duration: '2022 - 2026'
            }
          ],
          experience: [
            {
              id: 'exp1',
              role: `${title} Intern`,
              company: 'InnovateTech Solutions',
              location: 'San Francisco, CA',
              duration: 'May 2024 - Aug 2024',
              description: domainBullets.exp1
            },
            {
              id: 'exp2',
              role: 'Technical Lead & Open Source Contributor',
              company: 'Campus Developer Community',
              location: 'Berkeley, CA',
              duration: '2023 - 2024',
              description: domainBullets.exp2
            }
          ],
          projects: domainProjects,
          skills: domainSkills,
          tools: domainTools,
          softSkills: [{ id: 'ss1', name: 'Analytical Problem Solving' }, { id: 'ss2', name: 'Agile Sprint Delivery' }, { id: 'ss3', name: 'Rapid Prototyping' }],
          languages: [{ id: 'lang1', name: 'English', proficiency: 'Native / Bilingual' }],
          certifications: domainCertifications,
          achievements: [
            { id: 'ach1', name: '1st Place Winner – National Collegiate Hackathon 2024 (out of 280+ engineering teams).' },
            { id: 'ach2', name: "Dean's Honor List for Academic Excellence (Consecutive 4 Semesters)." }
          ],
          positionsOfResponsibility: [
            { id: 'pos1', organization: 'Student Technical Society', role: 'Technical Lead & Workshop Mentor', duration: '2023 - Present', description: 'Mentored 150+ students in modern software architecture, Git workflows, and clean code principles.' }
          ],
          interests: [{ id: 'int1', name: 'Competitive Programming' }, { id: 'int2', name: 'Open-Source Contribution' }],
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
            summary: `Accomplished Lead ${title} with 8+ years of expertise architecting high-scale distributed systems and managing multi-disciplinary engineering teams. Track record of cutting infrastructure spend by $140k/year, driving 99.99% system availability, and accelerating sprint delivery velocity by 40%.`,
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
              description: domainBullets.exp1
            },
            {
              id: 'exp2',
              role: `Senior ${title}`,
              company: 'Nexus Enterprise Tech',
              location: 'Austin, TX',
              duration: '2019 - 2022',
              description: domainBullets.exp2
            },
            {
              id: 'exp3',
              role: title,
              company: 'CoreTech Software Inc.',
              location: 'Seattle, WA',
              duration: '2016 - 2019',
              description: '• Engineered transactional REST APIs and scalable microservices supporting 500k+ users with high reliability.\n• Automated deployment pipelines with Docker and Jenkins, slashing release cycle durations by 50%.'
            }
          ],
          education: [
            {
              id: 'edu1',
              degree: 'Bachelor of Science in Computer Science / Engineering',
              fieldOfStudy: 'Computer Science',
              institution: 'University of California, Berkeley',
              location: 'Berkeley, CA',
              duration: '2012 - 2016'
            }
          ],
          skills: domainSkills,
          tools: domainTools,
          softSkills: [{ id: 'ss1', name: 'Engineering Leadership & Hiring' }, { id: 'ss2', name: 'System Architecture & 99.99% SLA' }, { id: 'ss3', name: 'Cross-Functional Roadmaps' }],
          projects: domainProjects,
          languages: [{ id: 'lang1', name: 'English', proficiency: 'Native / Bilingual' }],
          certifications: domainCertifications,
          achievements: [
            { id: 'ach1', name: 'Recognized as Tech Innovator of the Year for engineering a $140k cloud cost reduction architecture.' },
            { id: 'ach2', name: 'Keynote Speaker at Regional Tech Architecture Conference 2024.' }
          ],
          positionsOfResponsibility: [
            { id: 'pos1', organization: 'Engineering Architecture Board', role: 'Principal Architecture Committee Chair', duration: '2022 - Present', description: 'Evaluated and standardized system design patterns and security compliance across 6 engineering teams.' }
          ],
          interests: [{ id: 'int1', name: 'High-Concurrency Distributed Systems' }, { id: 'int2', name: 'Technical Mentorship & Writing' }],
          sectionOrder: ['summary', 'experience', 'skills', 'tools', 'softSkills', 'projects', 'certifications', 'education', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references'],
          atsScore: 98
        };
      } else {
        // Mid-Level
        generatedResume = {
          personalInfo: {
            fullName: 'Alex Morgan',
            jobTitle: title,
            email: 'alex.morgan.work@gmail.com',
            phone: '+1 (555) 382-9104',
            location: 'San Francisco, CA',
            summary: domainSummary,
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
              description: domainBullets.exp1
            },
            {
              id: 'exp2',
              role: `${title} Developer`,
              company: 'Nexus Systems Inc.',
              location: 'Austin, TX',
              duration: '2021 - 2023',
              description: domainBullets.exp2
            }
          ],
          education: [
            {
              id: 'edu1',
              degree: 'Bachelor of Science in Computer Science / Engineering',
              fieldOfStudy: 'Computer Science',
              institution: 'University of California, Berkeley',
              location: 'Berkeley, CA',
              duration: '2017 - 2021'
            }
          ],
          skills: domainSkills,
          tools: domainTools,
          softSkills: [{ id: 'ss1', name: 'Agile Sprint Ownership' }, { id: 'ss2', name: 'Cross-Functional Collaboration' }, { id: 'ss3', name: 'Code Review & Quality Standards' }],
          projects: domainProjects,
          languages: [{ id: 'lang1', name: 'English', proficiency: 'Native / Bilingual' }],
          certifications: domainCertifications,
          achievements: [
            { id: 'ach1', name: '1st Place Winner – Regional Tech Hackathon (out of 200+ teams).' },
            { id: 'ach2', name: 'Authored popular open-source utility with 800+ GitHub stars.' }
          ],
          positionsOfResponsibility: [
            { id: 'pos1', organization: 'Developer Community', role: 'Sprint Tech Lead', duration: '2023 - Present', description: 'Led code reviews and sprint delivery for team of 6 engineers.' }
          ],
          interests: [{ id: 'int1', name: 'Distributed Systems' }, { id: 'int2', name: 'Open-Source Tooling' }],
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

