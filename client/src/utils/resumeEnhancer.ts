import type { ResumeData, Experience, Skill } from '../types/resume';

export interface ATSAnalysisResult {
  atsScore: number; // 0 - 100
  matchingKeywords: string[];
  missingKeywords: string[];
  missingKeywordGuidance?: { keyword: string; targetSection: string; placementAdvice: string }[];
  unnecessaryKeywords?: { term: string; reason: string; category?: string }[];
  contentMistakes: { title: string; desc: string; type: 'critical' | 'warning' }[];
  bulletImprovements: { original: string; improved: string; reason: string }[];
  scoreBreakdown: {
    keywordMatch: number;
    formatting: number;
    metricsAndImpact: number;
    sectionCompleteness: number;
  };
}

const ACTION_VERBS = [
  'Architected', 'Spearheaded', 'Engineered', 'Optimized', 'Accelerated',
  'Developed', 'Formulated', 'Pioneered', 'Streamlined', 'Deployed',
  'Orchestrated', 'Delivered', 'Expanded', 'Transformed', 'Masterminded'
];

/**
 * Enhances a single bullet point by converting weak verbs to action verbs, inserting metrics, and adding target keywords.
 */
export function enhanceBulletText(bulletText: string, _roleTitle?: string, keywords: string[] = []): string {
  let text = bulletText.trim().replace(/^[•*-]\s*/, '');

  // Strip previously added metrics so we can swap them out for new ones on subsequent clicks
  text = text.replace(/, (improving|reducing|driving|cutting|resulting in|scaling|increasing|boosting).*$/i, '');

  // Strip previously added action verbs at the start
  const verbRegex = new RegExp(`^(${ACTION_VERBS.join('|')})\\s+`, 'i');
  text = text.replace(verbRegex, '');

  if (!text || text.length < 10) {
    const middlePhrases = [
      'key technical projects', 'critical system architecture', 'cross-functional team initiatives', 
      'core product features', 'backend microservices', 'frontend optimizations'
    ];
    text = middlePhrases[Math.floor(Math.random() * middlePhrases.length)];
  }

  const verb = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
  
  const metricEndings = [
    ', improving overall system efficiency by ' + (Math.floor(Math.random() * 30) + 15) + '%.',
    ', reducing latency by ' + (Math.floor(Math.random() * 40) + 20) + '% across workloads.',
    ', driving a ' + (Math.floor(Math.random() * 25) + 10) + '% increase in engagement.',
    ', cutting deployment times by ' + (Math.floor(Math.random() * 40) + 20) + '%.',
    ', scaling the platform to support ' + (Math.floor(Math.random() * 90) + 10) + '0,000+ users.',
    ', increasing test coverage by ' + (Math.floor(Math.random() * 30) + 30) + '%.'
  ];
  const metric = metricEndings[Math.floor(Math.random() * metricEndings.length)];

  let tech = '';
  if (keywords.length > 0) {
    const missingKw = keywords[Math.floor(Math.random() * keywords.length)];
    if (!text.toLowerCase().includes(missingKw.toLowerCase())) {
      tech = ` using ${missingKw}`;
    }
  }

  return `• ${verb} ${text.charAt(0).toLowerCase()}${text.slice(1)}${tech}${metric}`;
}

/**
 * Rewrites a professional summary to incorporate target job title and missing skills.
 */
export function enhanceProfessionalSummary(_currentSummary: string, targetTitle: string, missingKeywords: string[] = []): string {
  const title = targetTitle || 'Senior Professional';
  const kwList = missingKeywords.length > 0 ? missingKeywords.slice(0, 4).join(', ') : 'modern tech stacks and cross-functional leadership';

  const templates = [
    `High-impact ${title} with demonstrated expertise in ${kwList}. Track record of architecting scalable solutions, accelerating deployment velocity, and collaborating with cross-functional teams to deliver key product milestones with measurable business impact.`,
    `Results-driven ${title} specializing in ${kwList}. Proven ability to lead complex initiatives, optimize performance by over 40%, and align strategies with core business objectives to drive revenue growth.`,
    `Innovative ${title} bringing deep experience in ${kwList}. Passionate about building robust, user-centric solutions. Recognized for improving operational efficiencies, mentoring juniors, and consistently delivering projects ahead of schedule.`,
    `Dynamic ${title} with a strong foundation in ${kwList}. Adept at solving complex challenges, streamlining workflows, and fostering a culture of continuous improvement across global teams.`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}
