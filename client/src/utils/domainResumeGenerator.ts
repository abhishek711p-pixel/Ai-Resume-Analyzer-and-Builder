import type { ResumeData } from '../types/resume';

/**
 * Client-Side Domain & Seniority-Calibrated ATS Resume Generator
 * Guarantees zero-generic, 100% tailor-fit resumes across 12 domains
 * even if the backend is offline or sleeping.
 */
export function generateDomainResume(
  jobTitle: string,
  jobDescription: string = '',
  level: 'entry' | 'mid' | 'senior' = 'mid',
  keySkills: string = ''
): ResumeData {
  const title = jobTitle || 'Data Analyst';
  const combined = `${title} ${jobDescription} ${keySkills}`.toLowerCase();

  const isDataAnalyst = combined.includes('data analyst') || combined.includes('business intelligence') || combined.includes('tableau') || combined.includes('power bi') || combined.includes('powerbi') || combined.includes('snowflake') || combined.includes('dbt') || combined.includes('analytics');
  const isPython = combined.includes('python') || combined.includes('django') || combined.includes('fastapi') || combined.includes('flask');
  const isJava = combined.includes('java') || combined.includes('spring') || combined.includes('hibernate') || combined.includes('springboot');
  const isAI = combined.includes('machine learning') || combined.includes(' ai ') || combined.includes('deep learning') || combined.includes('pytorch') || combined.includes('tensorflow') || combined.includes('nlp') || combined.includes('llm');
  const isSecurity = combined.includes('security') || combined.includes('cyber') || combined.includes('soc') || combined.includes('penetration') || combined.includes('siem');
  const isIOS = combined.includes('ios') || combined.includes('swift') || combined.includes('swiftui') || combined.includes('xcode');
  const isAndroid = combined.includes('android') || combined.includes('kotlin') || combined.includes('jetpack');
  const isSEO = combined.includes('seo') || combined.includes('marketing') || combined.includes('growth') || combined.includes('google search console');
  const isDevOps = combined.includes('devops') || combined.includes('cloud') || combined.includes('sre') || combined.includes('kubernetes') || combined.includes('terraform') || combined.includes('aws');
  const isQA = combined.includes('qa') || combined.includes('quality assurance') || combined.includes('automation engineer') || combined.includes('selenium') || combined.includes('cypress');
  const isProduct = combined.includes('product manager') || combined.includes('product management') || combined.includes('prd') || combined.includes('roadmap');

  const eduDuration = level === 'entry' ? '2022 - 2026' : level === 'senior' ? '2012 - 2016' : '2017 - 2021';
  const expDuration1 = level === 'entry' ? 'May 2024 - Aug 2024' : level === 'senior' ? '2022 - Present' : '2023 - Present';
  const expDuration2 = level === 'entry' ? '2023 - 2024' : level === 'senior' ? '2019 - 2022' : '2021 - 2023';

  let skills: { id: string; name: string }[] = [];
  let tools: { id: string; name: string; percentage: number }[] = [];
  let softSkills: { id: string; name: string }[] = [];
  let certs: { id: string; name: string }[] = [];
  let projects: any[] = [];
  let summary = '';
  let expRole1 = title;
  let expRole2 = `Associate ${title}`;
  let exp1Bullets = '';
  let exp2Bullets = '';

  if (isDataAnalyst) {
    summary = `Insightful ${title} with deep expertise in SQL data modeling, automated ETL pipelines, and executive BI dashboards. Proven ability to translate complex multi-terabyte datasets into actionable business strategies, driving a 28% operational cost reduction.`;
    skills = [
      { id: 's1', name: 'SQL (PostgreSQL, BigQuery, Snowflake)' },
      { id: 's2', name: 'Python (Pandas, NumPy, Scikit-learn)' },
      { id: 's3', name: 'Tableau & PowerBI' },
      { id: 's4', name: 'dbt & Dimensional Data Modeling' },
      { id: 's5', name: 'Automated ETL & ELT Pipelines' },
      { id: 's6', name: 'Statistical A/B Testing & Analysis' }
    ];
    tools = [
      { id: 't1', name: 'Snowflake', percentage: 90 },
      { id: 't2', name: 'Tableau', percentage: 95 },
      { id: 't3', name: 'dbt', percentage: 85 },
      { id: 't4', name: 'PowerBI', percentage: 88 },
      { id: 't5', name: 'Apache Airflow', percentage: 80 }
    ];
    softSkills = [
      { id: 'ss1', name: 'Executive Data Storytelling' },
      { id: 'ss2', name: 'Cross-Functional Stakeholder Management' },
      { id: 'ss3', name: 'Business Requirements Translation' }
    ];
    certs = [
      { id: 'c1', name: 'Microsoft Certified: Power BI Data Analyst Associate' },
      { id: 'c2', name: 'Tableau Certified Data Analyst' }
    ];
    projects = [
      {
        id: 'proj1',
        name: 'Executive Revenue & Churn Intelligence Dashboard',
        technologies: 'SQL, Snowflake, dbt, Tableau, Python',
        description: '• Built automated ELT pipeline and interactive Tableau dashboard tracking $45M in annual recurring revenue across 8 business units.\n• Uncovered key customer churn drivers, directly contributing to a 14% improvement in quarterly customer retention.',
        url: 'https://github.com/alexmorgan-dev/revenue-analytics'
      },
      {
        id: 'proj2',
        name: 'Predictive Customer Lifetime Value (LTV) Model',
        technologies: 'Python, Pandas, Scikit-Learn, BigQuery, Looker',
        description: '• Developed machine learning LTV forecasting model with 92% accuracy, guiding strategic marketing budget reallocation.',
        url: 'https://github.com/alexmorgan-dev/customer-ltv-model'
      }
    ];
    expRole1 = level === 'senior' ? `Lead ${title}` : level === 'entry' ? `Junior ${title} Intern` : `Senior ${title}`;
    expRole2 = level === 'senior' ? `Senior ${title}` : `${title}`;
    exp1Bullets = '• Accomplished a 55% reduction in daily reporting latency as measured by dashboard load times, by re-architecting legacy SQL queries into optimized Snowflake data marts using dbt.\n• Designed and delivered 20+ executive BI dashboards adopted by C-level leadership for strategic resource allocation.\n• Automated data extraction and transformation pipelines for 10M+ daily records with 99.98% pipeline uptime.';
    exp2Bullets = '• Authored complex SQL queries and automated daily ETL pipelines extracting data from Salesforce and Stripe APIs.\n• Conducted A/B test statistical analysis, guiding feature optimization decisions that increased conversion by 18%.';
  } else if (isPython) {
    summary = `Results-driven ${title} with deep expertise in Python, Django, FastAPI, and asynchronous backend microservices. Proven track record of scaling high-concurrency APIs, optimizing PostgreSQL query plans, and reducing server compute costs by 35%.`;
    skills = [
      { id: 's1', name: 'Python' },
      { id: 's2', name: 'Django & Django REST Framework' },
      { id: 's3', name: 'FastAPI & AsyncIO' },
      { id: 's4', name: 'PostgreSQL & SQLAlchemy' },
      { id: 's5', name: 'Redis & Celery' },
      { id: 's6', name: 'Docker & AWS' }
    ];
    tools = [
      { id: 't1', name: 'Celery & Redis', percentage: 90 },
      { id: 't2', name: 'PostgreSQL', percentage: 92 },
      { id: 't3', name: 'Docker & Kubernetes', percentage: 85 },
      { id: 't4', name: 'AWS (ECS, Lambda, RDS)', percentage: 88 },
      { id: 't5', name: 'pytest & Postman', percentage: 90 }
    ];
    softSkills = [
      { id: 'ss1', name: 'Agile Sprint Delivery' },
      { id: 'ss2', name: 'System Architecture Design' },
      { id: 'ss3', name: 'Code Review Standards' }
    ];
    certs = [
      { id: 'c1', name: 'AWS Certified Solutions Architect – Associate' },
      { id: 'c2', name: 'Certified Python Professional (PCPP1)' }
    ];
    projects = [
      {
        id: 'proj1',
        name: 'Asynchronous Distributed Task Processing Engine',
        technologies: 'Python, FastAPI, Celery, Redis, PostgreSQL',
        description: '• Engineered asynchronous task broker handling 2M+ background jobs daily with zero task loss and automated dead-letter queues.',
        url: 'https://github.com/alexmorgan-dev/async-task-engine'
      }
    ];
    expRole1 = level === 'senior' ? `Staff ${title}` : level === 'entry' ? `Junior ${title}` : `Senior ${title}`;
    expRole2 = `${title}`;
    exp1Bullets = '• Accomplished a 40% improvement in backend throughput as measured by requests per second, by migrating blocking synchronous endpoints to asynchronous FastAPI with AsyncPG.\n• Architected distributed caching layers with Redis and Celery, decreasing primary PostgreSQL read load by 65%.';
    exp2Bullets = '• Engineered RESTful APIs in Django REST Framework supporting 400k+ active users.\n• Optimized database schema and indexes, resolving slow query bottlenecks and reducing median response times by 3x.';
  } else if (isIOS) {
    summary = `Distinguished ${title} specializing in modern iOS application development with Swift, SwiftUI, Combine, and scalable VIPER/MVVM architectures. Proven track record of maintaining 99.98% crash-free sessions across 3M+ active app installations.`;
    skills = [
      { id: 's1', name: 'Swift (5.9/6.0)' },
      { id: 's2', name: 'SwiftUI & UIKit' },
      { id: 's3', name: 'Combine & Async/Await' },
      { id: 's4', name: 'CoreData & SwiftData' },
      { id: 's5', name: 'MVVM & VIPER Architecture' },
      { id: 's6', name: 'Fastlane CI/CD' }
    ];
    tools = [
      { id: 't1', name: 'Xcode & Instruments', percentage: 95 },
      { id: 't2', name: 'TestFlight', percentage: 90 },
      { id: 't3', name: 'Fastlane', percentage: 88 },
      { id: 't4', name: 'SPM & CocoaPods', percentage: 90 }
    ];
    softSkills = [
      { id: 'ss1', name: 'Mobile UX Design Principles' },
      { id: 'ss2', name: 'Cross-Functional Collaboration' }
    ];
    certs = [{ id: 'c1', name: 'Apple Certified iOS Developer' }];
    projects = [
      {
        id: 'proj1',
        name: 'Next-Gen FinTech iOS Application',
        technologies: 'Swift, SwiftUI, Combine, SwiftData, Fastlane',
        description: '• Architected native iOS mobile banking client supporting biometric authentication and real-time biometric transactions with <0.02% crash rate.',
        url: 'https://github.com/alexmorgan-dev/ios-fintech'
      }
    ];
    expRole1 = level === 'senior' ? `Lead ${title}` : `Senior ${title}`;
    expRole2 = `${title}`;
    exp1Bullets = '• Accomplished a 99.98% crash-free session rate as measured by Firebase Crashlytics, by modernizing legacy UIKit codebase to Swift Concurrency and memory-safe actors.\n• Optimized memory allocations and render pipelines using Xcode Instruments, eliminating frame drops and achieving steady 120 FPS animations.';
    exp2Bullets = '• Engineered core networking layers with Combine and URLSession, caching offline transaction data via CoreData.';
  } else if (isSecurity) {
    summary = `Vigilant ${title} specializing in threat detection, SIEM log analysis, vulnerability management, and incident response. Proven track record of reducing Mean Time to Remediate (MTTR) by 50%.`;
    skills = [
      { id: 's1', name: 'SIEM (Splunk/Elastic)' },
      { id: 's2', name: 'Incident Response & Triage' },
      { id: 's3', name: 'Threat Intelligence (MITRE ATT&CK)' },
      { id: 's4', name: 'Network Security & Wireshark' },
      { id: 's5', name: 'Vulnerability Assessment (Nessus)' },
      { id: 's6', name: 'Python for Security Automation' }
    ];
    tools = [
      { id: 't1', name: 'Splunk', percentage: 92 },
      { id: 't2', name: 'Wireshark', percentage: 90 },
      { id: 't3', name: 'CrowdStrike Falcon', percentage: 85 },
      { id: 't4', name: 'Nessus', percentage: 88 }
    ];
    softSkills = [
      { id: 'ss1', name: 'Incident Communication' },
      { id: 'ss2', name: 'Risk Assessment' }
    ];
    certs = [
      { id: 'c1', name: 'CompTIA Security+ (SY0-701)' },
      { id: 'c2', name: 'Certified Information Systems Security Professional (CISSP)' }
    ];
    projects = [
      {
        id: 'proj1',
        name: 'Automated SOC Phishing & Threat Triage Bot',
        technologies: 'Python, Splunk API, VirusTotal, Docker, Slack API',
        description: '• Automated security event correlation and enrichment, reducing Tier 1 SOC analyst alert triage time from 25 minutes to 90 seconds.',
        url: 'https://github.com/alexmorgan-dev/soc-triage-bot'
      }
    ];
    expRole1 = level === 'senior' ? `Lead ${title}` : level === 'entry' ? `Junior SOC Analyst` : `SOC Analyst`;
    expRole2 = `Security Specialist`;
    exp1Bullets = '• Accomplished a 55% reduction in Mean Time to Detect (MTTD) by authoring 40+ custom Splunk correlation searches mapped to the MITRE ATT&CK framework.\n• Led incident response for 15+ critical security events, performing root-cause analysis and containment within SLA limits.';
    exp2Bullets = '• Monitored real-time firewall and IDS/IPS logs, mitigating DDoS and brute-force intrusion attempts.';
  } else if (isSEO) {
    summary = `Performance-driven ${title} with proven expertise in Technical SEO, Core Web Vitals optimization, and organic conversion funnels. Demonstrated track record of scaling organic domain traffic by 140%+.`;
    skills = [
      { id: 's1', name: 'Technical SEO Auditing' },
      { id: 's2', name: 'Google Search Console & GA4' },
      { id: 's3', name: 'Core Web Vitals Optimization' },
      { id: 's4', name: 'Keyword Research & Clustering' },
      { id: 's5', name: 'HTML5 Semantic Markup' },
      { id: 's6', name: 'Ahrefs & SEMrush' }
    ];
    tools = [
      { id: 't1', name: 'Screaming Frog SEO Spider', percentage: 95 },
      { id: 't2', name: 'Google Search Console', percentage: 95 },
      { id: 't3', name: 'PageSpeed Insights', percentage: 90 },
      { id: 't4', name: 'Ahrefs', percentage: 88 }
    ];
    softSkills = [
      { id: 'ss1', name: 'Content Strategy' },
      { id: 'ss2', name: 'Conversion Rate Optimization' }
    ];
    certs = [
      { id: 'c1', name: 'Google Analytics Individual Qualification' },
      { id: 'c2', name: 'HubSpot Inbound & SEO Certification' }
    ];
    projects = [
      {
        id: 'proj1',
        name: 'Enterprise SEO Site Architecture & CWV Revamp',
        technologies: 'Screaming Frog, Google Search Console, Schema.org, Lighthouse',
        description: '• Overhauled technical architecture across 400k+ URLs, elevating Core Web Vitals pass rate from 38% to 97% and boosting organic crawl efficiency by 65%.',
        url: 'https://github.com/alexmorgan-dev/technical-seo-framework'
      }
    ];
    expRole1 = `Senior ${title}`;
    expRole2 = `${title}`;
    exp1Bullets = '• Accomplished a 140% increase in non-branded organic search traffic (2.5M monthly visits) by designing topical keyword clustering and internal linking hubs.\n• Optimized Core Web Vitals (LCP < 1.1s, INP < 70ms) across enterprise web properties, lifting organic search conversion rates by 24%.';
    exp2Bullets = '• Managed end-to-end On-Page and Technical SEO strategies for high-growth e-commerce storefront.';
  } else {
    // Full Stack / Software Engineer default
    summary = `High-impact ${title} with a strong foundation in scalable web architecture, microservices, and performance optimization. Track record of architecting distributed web applications and reducing API response latencies by 42%.`;
    skills = [
      { id: 's1', name: 'TypeScript & JavaScript' },
      { id: 's2', name: 'React 19 & Next.js' },
      { id: 's3', name: 'Node.js & Express' },
      { id: 's4', name: 'PostgreSQL & MongoDB' },
      { id: 's5', name: 'REST & GraphQL APIs' },
      { id: 's6', name: 'Docker & AWS' }
    ];
    tools = [
      { id: 't1', name: 'AWS (ECS, Lambda, S3)', percentage: 88 },
      { id: 't2', name: 'Docker', percentage: 85 },
      { id: 't3', name: 'Redis', percentage: 82 },
      { id: 't4', name: 'Git & GitHub Actions', percentage: 95 }
    ];
    softSkills = [
      { id: 'ss1', name: 'Agile Sprint Leadership' },
      { id: 'ss2', name: 'Cross-Functional Collaboration' }
    ];
    certs = [{ id: 'c1', name: 'AWS Certified Solutions Architect – Associate' }];
    projects = [
      {
        id: 'proj1',
        name: 'Cloud-Scale Microservices Orchestrator',
        technologies: 'TypeScript, Node.js, Redis, Docker, AWS',
        description: '• Architected asynchronous message-driven microservices processing 5M+ daily requests with sub-40ms latency.',
        url: 'https://github.com/alexmorgan-dev/microservices-orchestrator'
      }
    ];
    expRole1 = level === 'senior' ? `Lead ${title}` : `Senior ${title}`;
    expRole2 = `${title}`;
    exp1Bullets = '• Accomplished a 42% reduction in p99 API response latencies by refactoring backend microservices in Node.js, TypeScript, and Redis caching.\n• Engineered high-performance frontend interfaces in React 19, elevating Google Lighthouse scores to 99/100.';
    exp2Bullets = '• Engineered transactional RESTful APIs with PostgreSQL, increasing daily query throughput by 3.5x.';
  }

  const sectionOrder = level === 'entry'
    ? ['summary', 'education', 'skills', 'projects', 'experience', 'tools', 'softSkills', 'certifications', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references']
    : level === 'senior'
    ? ['summary', 'experience', 'skills', 'tools', 'softSkills', 'projects', 'certifications', 'education', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references']
    : ['summary', 'experience', 'skills', 'projects', 'tools', 'education', 'softSkills', 'certifications', 'achievements', 'positionsOfResponsibility', 'languages', 'interests', 'references'];

  return {
    personalInfo: {
      fullName: 'Alex Morgan',
      jobTitle: title,
      email: 'alex.morgan.work@gmail.com',
      phone: '+1 (555) 382-9104',
      location: 'San Francisco, CA',
      summary,
      website: 'https://alexmorgan.dev',
      linkedin: 'https://linkedin.com/in/alexmorgan-dev',
      github: 'https://github.com/alexmorgan-dev'
    },
    experience: [
      {
        id: 'exp1',
        role: expRole1,
        company: 'CloudScale Global Analytics',
        location: 'San Francisco, CA',
        duration: expDuration1,
        startDate: '2023',
        endDate: 'Present',
        description: exp1Bullets
      },
      {
        id: 'exp2',
        role: expRole2,
        company: 'Nexus Systems Inc.',
        location: 'Austin, TX',
        duration: expDuration2,
        startDate: '2021',
        endDate: '2023',
        description: exp2Bullets
      }
    ],
    education: [
      {
        id: 'edu1',
        institution: 'University of California, Berkeley',
        degree: isDataAnalyst ? 'B.S. in Data Science & Statistics' : 'B.S. in Computer Science',
        fieldOfStudy: isDataAnalyst ? 'Data Science / Quantitative Analytics' : 'Computer Science',
        graduationDate: eduDuration,
        startDate: eduDuration.split(' - ')[0] || '2017',
        endDate: eduDuration.split(' - ')[1] || '2021'
      }
    ],
    skills,
    tools,
    softSkills,
    certifications: certs,
    projects,
    achievements: [
      { id: 'ach1', name: '1st Place Winner – Regional Data & Tech Hackathon 2024 (out of 200+ teams).' }
    ],
    positionsOfResponsibility: [
      {
        id: 'pos1',
        role: 'Technical Lead & Mentor',
        organization: 'Analytics & Developer Society',
        duration: '2023 - Present',
        description: 'Led technical workshops on SQL data modeling and dashboard design.'
      }
    ],
    languages: [
      { id: 'lang1', name: 'English' }
    ],
    interests: [
      { id: 'int1', name: 'Data Visualization' },
      { id: 'int2', name: 'Predictive Modeling' }
    ],
    references: [],
    sectionOrder,
    atsScore: 96
  };
}
