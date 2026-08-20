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

// 50+ Power Executive Action Verbs categorized by function
export const ACTION_VERBS = [
  // Architectural & Engineering
  'Architected', 'Engineered', 'Spearheaded', 'Orchestrated', 'Designed', 'Constructed',
  'Automated', 'Pioneered', 'Streamlined', 'Deployed', 'Refactored', 'Standardized',
  // Performance & Scaling
  'Optimized', 'Accelerated', 'Scaled', 'Maximized', 'Elevated', 'Transformed',
  'Expanded', 'Overhauled', 'Restructured', 'Amplified', 'Consolidated',
  // Leadership & Delivery
  'Directed', 'Formulated', 'Delivered', 'Mobilized', 'Championed', 'Instituted',
  'Masterminded', 'Governed', 'Coordinated', 'Negotiated', 'Empowered'
];

/**
 * Enhances a single bullet point by converting weak verbs to action verbs, inserting metrics, and adding target keywords
 * following Google's X-Y-Z Formula ("Accomplished X as measured by Y, by doing Z").
 */
export function enhanceBulletText(bulletText: string, roleTitle?: string, keywords: string[] = []): string {
  let text = bulletText.trim().replace(/^[•*-]\s*/, '');

  // Strip previously added metrics so we can swap them out for new ones on subsequent clicks
  text = text.replace(/, (improving|reducing|driving|cutting|resulting in|scaling|increasing|boosting|elevating|lowering|saving).*$/i, '');

  // Strip previously added action verbs at the start
  const verbRegex = new RegExp(`^(${ACTION_VERBS.join('|')})\\s+`, 'i');
  text = text.replace(verbRegex, '');

  const role = (roleTitle || '').toLowerCase();
  const isData = role.includes('data') || role.includes('analyst') || role.includes('ai') || role.includes('ml');
  const isSEO = role.includes('seo') || role.includes('marketing') || role.includes('growth');
  const isCloud = role.includes('cloud') || role.includes('devops') || role.includes('infra') || role.includes('sre');

  if (!text || text.length < 8) {
    if (isSEO) {
      const seoPhrases = [
        'technical SEO site architecture and Core Web Vitals optimization',
        'keyword clustering strategy and on-page internal linking structure',
        'data-driven content conversion funnels and organic search indexation'
      ];
      text = seoPhrases[Math.floor(Math.random() * seoPhrases.length)];
    } else if (isData) {
      const dataPhrases = [
        'automated ELT pipelines and dimensional data models in Snowflake',
        'executive BI dashboards and predictive customer churn algorithms',
        'high-performance SQL query optimization and automated data validation suites'
      ];
      text = dataPhrases[Math.floor(Math.random() * dataPhrases.length)];
    } else if (isCloud) {
      const cloudPhrases = [
        'multi-region Kubernetes container infrastructure and GitOps deployment automation',
        'zero-downtime CI/CD release pipelines and automated infrastructure-as-code scripts',
        'centralized telemetry and cloud cost governance frameworks across AWS environments'
      ];
      text = cloudPhrases[Math.floor(Math.random() * cloudPhrases.length)];
    } else {
      const devPhrases = [
        'event-driven microservices architecture and asynchronous message streaming',
        'responsive frontend client components and state caching layers',
        'RESTful and GraphQL API services handling high-concurrency workloads'
      ];
      text = devPhrases[Math.floor(Math.random() * devPhrases.length)];
    }
  }

  const verb = ACTION_VERBS[Math.floor(Math.random() * ACTION_VERBS.length)];
  
  const metricEndings = isSEO ? [
    ', boosting organic search traffic by ' + (Math.floor(Math.random() * 80) + 60) + '% YoY.',
    ', improving Core Web Vitals pass rate to ' + (Math.floor(Math.random() * 5) + 95) + '% and increasing organic conversion by ' + (Math.floor(Math.random() * 15) + 15) + '%.',
    ', achieving top 3 Google ranking across ' + (Math.floor(Math.random() * 40) + 30) + '+ high-intent target keywords.',
    ', reducing page load times by ' + (Math.floor(Math.random() * 35) + 25) + '%, driving a ' + (Math.floor(Math.random() * 20) + 15) + '% increase in click-through rates.'
  ] : isData ? [
    ', cutting daily data warehouse query latency by ' + (Math.floor(Math.random() * 30) + 40) + '%.',
    ', identifying $' + (Math.floor(Math.random() * 9) + 1) + '.' + (Math.floor(Math.random() * 8) + 1) + 'M in actionable operational efficiencies across business units.',
    ', improving predictive model forecasting accuracy from 74% to ' + (Math.floor(Math.random() * 6) + 91) + '%.',
    ', automating data ingestion for ' + (Math.floor(Math.random() * 50) + 50) + '0M+ daily records with 99.99% data integrity.'
  ] : isCloud ? [
    ', reducing production deployment duration by ' + (Math.floor(Math.random() * 40) + 50) + '% while maintaining 99.99% SLA uptime.',
    ', decreasing AWS cloud compute spend by $' + (Math.floor(Math.random() * 15) + 10) + 'k/month through auto-scaling and spot instances.',
    ', cutting Mean Time to Resolution (MTTR) by ' + (Math.floor(Math.random() * 30) + 40) + '% using automated monitoring triggers.'
  ] : [
    ', reducing p99 API response latencies by ' + (Math.floor(Math.random() * 25) + 35) + '% across ' + (Math.floor(Math.random() * 5) + 2) + 'M+ daily active sessions.',
    ', improving overall system throughput by ' + (Math.floor(Math.random() * 30) + 25) + '% under peak load conditions.',
    ', cutting client-side bundle size by ' + (Math.floor(Math.random() * 20) + 25) + '%, boosting Lighthouse performance scores to 98/100.',
    ', elevating automated test coverage from 55% to ' + (Math.floor(Math.random() * 8) + 90) + '%, cutting regression defects by half.',
    ', scaling backend infrastructure to support ' + (Math.floor(Math.random() * 50) + 20) + '0,000+ concurrent users with zero downtime.'
  ];
  
  const metric = metricEndings[Math.floor(Math.random() * metricEndings.length)];

  let tech = '';
  if (keywords.length > 0) {
    const missingKw = keywords[Math.floor(Math.random() * keywords.length)];
    if (!text.toLowerCase().includes(missingKw.toLowerCase())) {
      tech = ` utilizing ${missingKw}`;
    }
  }

  return `• ${verb} ${text.charAt(0).toLowerCase()}${text.slice(1)}${tech}${metric}`;
}

/**
 * Rewrites a professional summary to incorporate target job title and missing skills with high-impact executive presence.
 */
export function enhanceProfessionalSummary(_currentSummary: string, targetTitle: string, missingKeywords: string[] = []): string {
  const title = targetTitle || 'Senior Full Stack Engineer';
  const kwList = missingKeywords.length > 0 ? missingKeywords.slice(0, 4).join(', ') : 'modern full-stack architecture and high-scale systems';

  const templates = [
    `Performance-driven ${title} with proven expertise in ${kwList}. Track record of architecting mission-critical platforms, reducing p99 response latencies by over 40%, and driving cross-functional sprint delivery to consistently ship high-impact features.`,
    `Results-oriented ${title} specializing in ${kwList}. Demonstrated ability to scale production systems to millions of users, eliminate architectural bottlenecks, and translate complex product roadmaps into reliable, maintainable codebases.`,
    `Innovative ${title} bringing deep hands-on expertise in ${kwList}. Recognized for engineering resilient cloud services, accelerating CI/CD velocity, and fostering high-standard engineering cultures through proactive mentoring and rigorous code reviews.`,
    `High-impact ${title} with a solid foundation in ${kwList}. Adept at designing resilient distributed architectures, optimizing resource utilization by 35%+, and leading technical initiatives that directly elevate core business metrics.`
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

/**
 * Local client-side ATS audit fallback for offline/Vercel static execution
 */
export function auditResumeLocally(resume: ResumeData, targetJobTitle: string = '', jobDescription: string = ''): ATSAnalysisResult {
  const combinedJd = `${targetJobTitle} ${jobDescription}`.toLowerCase();
  const resumeText = JSON.stringify(resume).toLowerCase();

  const isData = combinedJd.includes('data') || combinedJd.includes('analyst') || combinedJd.includes('tableau') || combinedJd.includes('sql');
  const isPython = combinedJd.includes('python') || combinedJd.includes('django') || combinedJd.includes('fastapi');
  const isSecurity = combinedJd.includes('security') || combinedJd.includes('cyber') || combinedJd.includes('siem');
  const isSEO = combinedJd.includes('seo') || combinedJd.includes('search console');
  const isDevOps = combinedJd.includes('devops') || combinedJd.includes('kubernetes') || combinedJd.includes('aws');

  let domainKeywords: string[] = [];
  if (isData) {
    domainKeywords = ['SQL', 'Python', 'Tableau', 'PowerBI', 'Snowflake', 'dbt', 'ETL Pipelines', 'A/B Testing', 'Data Modeling', 'BigQuery'];
  } else if (isPython) {
    domainKeywords = ['Python', 'Django', 'FastAPI', 'Celery', 'Redis', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs', 'pytest'];
  } else if (isSecurity) {
    domainKeywords = ['SIEM', 'Splunk', 'Wireshark', 'Threat Hunting', 'Incident Response', 'Nessus', 'EDR', 'MITRE ATT&CK', 'Vulnerability Assessment'];
  } else if (isSEO) {
    domainKeywords = ['Technical SEO', 'Google Search Console', 'GA4', 'Core Web Vitals', 'Keyword Research', 'Screaming Frog', 'Schema Markup'];
  } else if (isDevOps) {
    domainKeywords = ['Kubernetes', 'Terraform', 'AWS', 'Docker', 'CI/CD', 'ArgoCD', 'Prometheus', 'Grafana', 'Helm'];
  } else {
    domainKeywords = ['TypeScript', 'React 19', 'Node.js', 'Next.js', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs', 'CI/CD'];
  }

  const matchingKeywords: string[] = [];
  const missingKeywords: string[] = [];

  domainKeywords.forEach(kw => {
    if (resumeText.includes(kw.toLowerCase())) {
      matchingKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  const keywordMatchScore = Math.min(100, Math.round((matchingKeywords.length / domainKeywords.length) * 100));
  const overallScore = Math.max(65, Math.min(98, Math.round(keywordMatchScore * 0.5 + 45)));

  return {
    atsScore: overallScore,
    matchingKeywords,
    missingKeywords,
    missingKeywordGuidance: missingKeywords.map(kw => ({
      keyword: kw,
      targetSection: 'skills',
      placementAdvice: `Add ${kw} under Core Skills and mention its practical usage in recent work experience.`
    })),
    unnecessaryKeywords: [],
    contentMistakes: missingKeywords.length > 3 ? [
      {
        title: 'Missing Critical Domain Keywords',
        desc: `Your resume is missing key requirements for ${targetJobTitle || 'this role'}: ${missingKeywords.slice(0, 3).join(', ')}.`,
        type: 'critical'
      }
    ] : [],
    bulletImprovements: [
      {
        original: resume.experience[0]?.description?.split('\n')[0] || 'Worked on key features.',
        improved: `• Accomplished 40% performance gain as measured by latency benchmarks, by engineering scalable pipelines utilizing ${domainKeywords[0] || 'modern architecture'}.`,
        reason: 'Adds measurable metrics and Google X-Y-Z formula structure.'
      }
    ],
    scoreBreakdown: {
      keywordMatch: keywordMatchScore,
      formatting: 95,
      metricsAndImpact: 88,
      sectionCompleteness: 92
    }
  };
}
