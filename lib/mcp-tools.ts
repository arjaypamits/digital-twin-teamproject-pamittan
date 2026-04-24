/**
 * MCP (Model Context Protocol) Tool Definitions & Handlers
 *
 * Exposes career-coaching and digital-twin tools that the LLM can invoke
 * mid-conversation via structured tool_use / function-calling.
 */

// ─── Tool Schemas (JSON-Schema style, OpenAI-compatible) ────────────────────

export interface McpToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export const MCP_TOOLS: McpToolDefinition[] = [
  // ── Existing tools ──────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'analyze_skill_gap',
      description:
        'Given a current role/skills and a target role, returns a structured skill-gap analysis with missing skills ranked by priority and suggested learning resources.',
      parameters: {
        type: 'object',
        properties: {
          current_role: { type: 'string', description: "The user's current job title or role" },
          current_skills: { type: 'array', items: { type: 'string' }, description: 'List of skills the user currently has' },
          target_role: { type: 'string', description: 'The role the user wants to transition to' },
        },
        required: ['current_role', 'target_role'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'score_resume',
      description: 'Scores a resume summary against a target role on key dimensions: relevance, impact language, keyword match, and overall strength.',
      parameters: {
        type: 'object',
        properties: {
          resume_summary: { type: 'string', description: "A brief summary or bullet points from the user's resume" },
          target_role: { type: 'string', description: 'The role the resume should be optimized for' },
        },
        required: ['resume_summary', 'target_role'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_interview_questions',
      description: 'Generates a set of role-specific interview questions (behavioral + technical) with evaluation criteria.',
      parameters: {
        type: 'object',
        properties: {
          role: { type: 'string', description: 'The job role to generate questions for' },
          difficulty: { type: 'string', enum: ['entry', 'mid', 'senior'], description: 'Difficulty level of the questions' },
          count: { type: 'number', description: 'Number of questions to generate (default 5)' },
        },
        required: ['role'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_career_path',
      description: 'Returns a suggested career progression path from a starting role to a target role, including intermediate steps, typical timelines, and key milestones.',
      parameters: {
        type: 'object',
        properties: {
          current_role: { type: 'string', description: "The user's current role" },
          target_role: { type: 'string', description: 'The desired end-goal role' },
          industry: { type: 'string', description: 'Industry context (e.g. tech, finance, healthcare)' },
        },
        required: ['current_role', 'target_role'],
      },
    },
  },

  // ── New tools ────────────────────────────────────────────────────────────
  {
    type: 'function',
    function: {
      name: 'get_member_profile',
      description: 'Returns the full structured profile of a Digital Twin team member by name, including personal info, department, skills, and certifications.',
      parameters: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Full or partial name of the team member' },
        },
        required: ['name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recommend_learning_resources',
      description: 'Returns curated, free and paid learning resources for a specific technology or skill — with platform, estimated duration, and difficulty.',
      parameters: {
        type: 'object',
        properties: {
          skill: { type: 'string', description: 'The technology or skill to learn (e.g. React, SQL, Laravel)' },
          level: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'], description: 'Current knowledge level' },
        },
        required: ['skill'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggest_certifications',
      description: 'Suggests relevant IT certifications for a student based on their target career path or technology stack.',
      parameters: {
        type: 'object',
        properties: {
          goal: { type: 'string', description: 'Career goal or target role (e.g. "web developer", "cybersecurity analyst")' },
          current_skills: { type: 'array', items: { type: 'string' }, description: 'Technologies the student already knows' },
        },
        required: ['goal'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generate_study_plan',
      description: 'Creates a week-by-week study plan for learning a technology or preparing for a certification, tailored to available hours per week.',
      parameters: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'Topic or technology to study (e.g. Next.js, PostgreSQL, cybersecurity)' },
          hours_per_week: { type: 'number', description: 'How many hours per week the student can commit' },
          duration_weeks: { type: 'number', description: 'How many weeks the plan should span (default 8)' },
        },
        required: ['topic'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'evaluate_tech_stack',
      description: 'Evaluates a proposed technology stack for a student project — assessing strengths, weaknesses, learning value, and alternatives.',
      parameters: {
        type: 'object',
        properties: {
          stack: { type: 'array', items: { type: 'string' }, description: 'List of technologies in the stack (e.g. ["React", "Laravel", "PostgreSQL"])' },
          project_type: { type: 'string', description: 'Type of project (e.g. "web app", "mobile app", "REST API", "capstone")' },
        },
        required: ['stack', 'project_type'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'assess_project_idea',
      description: 'Evaluates a student project idea for feasibility, learning value, complexity, and provides improvement suggestions and a suggested tech stack.',
      parameters: {
        type: 'object',
        properties: {
          idea: { type: 'string', description: 'Brief description of the project idea' },
          skills: { type: 'array', items: { type: 'string' }, description: 'Skills the student currently has' },
          timeline_weeks: { type: 'number', description: 'Available weeks to complete the project' },
        },
        required: ['idea'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_networking_tips',
      description: 'Provides actionable networking and professional growth tips for IT students — covering LinkedIn, GitHub, open source, events, and internships.',
      parameters: {
        type: 'object',
        properties: {
          focus: { type: 'string', description: 'Area to focus on (e.g. "linkedin", "github", "internships", "open source", "general")' },
          year_level: { type: 'string', description: 'Year level of the student (e.g. "1st year", "2nd year", "3rd year", "4th year")' },
        },
        required: [],
      },
    },
  },
];

// ─── Tool Handlers ──────────────────────────────────────────────────────────

interface SkillGapArgs { current_role: string; current_skills?: string[]; target_role: string; }

function analyzeSkillGap(args: SkillGapArgs): string {
  const { current_role, current_skills = [], target_role } = args;
  const skillDb: Record<string, string[]> = {
    'software engineer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Git', 'REST APIs', 'SQL', 'System Design'],
    'frontend developer': ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Accessibility'],
    'backend developer': ['Node.js', 'Python', 'SQL', 'REST APIs', 'Docker', 'CI/CD', 'System Design', 'Security'],
    'data scientist': ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Pandas', 'TensorFlow', 'Data Visualization', 'R'],
    'product manager': ['Agile', 'User Research', 'Roadmapping', 'A/B Testing', 'SQL', 'Data Analysis', 'Wireframing', 'Stakeholder Management'],
    'devops engineer': ['Docker', 'Kubernetes', 'CI/CD', 'AWS/GCP/Azure', 'Terraform', 'Linux', 'Monitoring', 'Scripting'],
    'ui/ux designer': ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Accessibility', 'Usability Testing', 'Information Architecture'],
    'full stack developer': ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'REST APIs', 'Docker', 'Next.js', 'Git'],
  };
  const requiredSkills = skillDb[target_role.toLowerCase()] ?? ['Communication', 'Problem Solving', 'Domain Knowledge', 'Technical Skills', 'Leadership'];
  const lowerCurrent = current_skills.map((s) => s.toLowerCase());
  const missing = requiredSkills.filter((s) => !lowerCurrent.includes(s.toLowerCase()));
  return JSON.stringify({
    current_role, target_role,
    skills_you_have: current_skills,
    missing_skills: missing.map((skill, i) => ({
      skill, priority: i < 3 ? 'high' : 'medium',
      suggested_resource: `Search for "${skill} course" on Coursera, Udemy, or freeCodeCamp`,
      estimated_time: i < 3 ? '4-6 weeks' : '2-4 weeks',
    })),
    match_percentage: Math.round(((requiredSkills.length - missing.length) / requiredSkills.length) * 100),
  });
}

interface ResumeScoreArgs { resume_summary: string; target_role: string; }

function scoreResume(args: ResumeScoreArgs): string {
  const { resume_summary, target_role } = args;
  const wordCount = resume_summary.split(/\s+/).length;
  const impactWords = ['led', 'built', 'increased', 'reduced', 'delivered', 'managed', 'designed', 'improved', 'launched', 'achieved'];
  const impactScore = Math.min(10, impactWords.filter((w) => resume_summary.toLowerCase().includes(w)).length * 2 + 3);
  const quantified = (resume_summary.match(/\d+%|\$\d+|\d+\s*(users|clients|projects|team)/gi) || []).length;
  const metricsScore = Math.min(10, quantified * 2 + 2);
  const relevanceScore = Math.min(10, Math.round(wordCount / 20) + 4);
  const overall = Math.round((impactScore + metricsScore + relevanceScore) / 3);
  return JSON.stringify({
    target_role,
    scores: {
      impact_language: { score: impactScore, max: 10, tip: impactScore < 6 ? 'Use more action verbs like "led", "built", "delivered"' : 'Good use of impact language' },
      quantified_results: { score: metricsScore, max: 10, tip: metricsScore < 6 ? 'Add numbers: percentages, team sizes, revenue figures' : 'Nice use of metrics' },
      relevance: { score: relevanceScore, max: 10, tip: relevanceScore < 6 ? `Tailor your summary more toward ${target_role} keywords` : 'Content looks relevant' },
      overall: { score: overall, max: 10 },
    },
    top_suggestion: overall < 6 ? 'Focus on adding measurable achievements and tailoring your language to the target role.' : 'Strong foundation — refine keyword alignment and quantify more results.',
  });
}

interface InterviewQuestionsArgs { role: string; difficulty?: string; count?: number; }

function generateInterviewQuestions(args: InterviewQuestionsArgs): string {
  const { role, difficulty = 'mid', count = 5 } = args;
  const behavioralPool = [
    { q: 'Tell me about a time you had to lead a project under a tight deadline.', criteria: 'STAR method, time management, leadership' },
    { q: 'Describe a situation where you disagreed with a teammate. How did you resolve it?', criteria: 'Conflict resolution, communication, empathy' },
    { q: 'Give an example of when you had to learn a new technology quickly.', criteria: 'Adaptability, self-learning, resourcefulness' },
    { q: 'Tell me about a failure and what you learned from it.', criteria: 'Self-awareness, growth mindset, honesty' },
    { q: 'Describe a time you went above and beyond for a project.', criteria: 'Initiative, dedication, impact' },
    { q: 'How do you prioritize tasks when everything seems urgent?', criteria: 'Prioritization, communication, decision-making' },
  ];
  const technicalPool = [
    { q: `What are the most important skills for a ${role} and why?`, criteria: 'Domain knowledge, self-awareness' },
    { q: `How would you approach improving a slow-performing system in a ${role} context?`, criteria: 'Problem-solving, analytical thinking' },
    { q: `Walk me through how you would onboard into a new ${role} position.`, criteria: 'Planning, communication, proactiveness' },
    { q: `What trends in the ${role} field excite you the most?`, criteria: 'Passion, industry awareness, forward-thinking' },
  ];
  const total = Math.min(count, 10);
  const behavioral = behavioralPool.slice(0, Math.ceil(total / 2));
  const technical = technicalPool.slice(0, Math.floor(total / 2));
  return JSON.stringify({
    role, difficulty,
    questions: [...behavioral.map((q) => ({ ...q, type: 'behavioral' })), ...technical.map((q) => ({ ...q, type: 'technical' }))],
    tips: difficulty === 'entry' ? 'Focus on demonstrating eagerness to learn and transferable skills.' : difficulty === 'senior' ? 'Emphasize leadership, strategic thinking, and measurable outcomes.' : 'Balance technical depth with clear communication of your approach.',
  });
}

interface CareerPathArgs { current_role: string; target_role: string; industry?: string; }

function getCareerPath(args: CareerPathArgs): string {
  const { current_role, target_role, industry = 'technology' } = args;
  return JSON.stringify({
    current_role, target_role, industry,
    path: [
      { step: 1, role: current_role, duration: 'Current', focus: 'Build foundational skills and domain knowledge' },
      { step: 2, role: `Senior ${current_role}`, duration: '1-2 years', focus: 'Deepen expertise, mentor others, take on larger projects' },
      { step: 3, role: 'Lead / Principal', duration: '2-3 years', focus: 'Develop leadership skills, drive cross-team initiatives' },
      { step: 4, role: target_role, duration: '3-5 years', focus: 'Strategic impact, organizational leadership, industry thought leadership' },
    ],
    key_milestones: [
      'Complete a relevant certification or advanced training',
      'Lead a high-impact project end-to-end',
      'Build a professional network in your target area',
      'Develop a portfolio or track record of measurable results',
    ],
  });
}

interface GetMemberProfileArgs { name: string; }

function getMemberProfile(args: GetMemberProfileArgs): string {
  const { name } = args;
  const members: Record<string, object> = {
    'aeron garma': { name: 'Aeron Garma', department: 'UI', role: 'UI Designer', birth_date: 'July 10, 2005', birthplace: 'Aparri, Cagayan', gender: 'Male', citizenship: 'Filipino', religion: 'Roman Catholic', address: 'Casambalangan, Sta. Ana, Cagayan', email: 'garmaaeron@gmail.com', education: 'BS Information Technology — St. Paul University Philippines (2023–Present)', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'SQL', 'Laravel', 'PostgreSQL'], certifications: ['Certificate of Recognition — SPUP Paskuhan 2023 Volleyball', 'Certificate of Participation — ITE Convention 2024 & 2025', 'Certificate of Participation — Cyber Summit 2023'] },
    'ethan macadangdang': { name: 'Prince Ethan Macadangdang', department: 'UI', role: 'UI Designer', birth_date: 'February 2, 2005', birthplace: 'Aparri, Cagayan', gender: 'Male', citizenship: 'Filipino', religion: 'Roman Catholic', address: 'Gaggabutan West, Rizal, Cagayan', email: 'papa.ethanmac@gmail.com', education: 'BS Information Technology — St. Paul University Philippines (2023–Present)', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'SQL', 'Laravel', 'PostgreSQL'], certifications: ['Certificate of Recognition — SPUP Paskuhan 2023 Volleyball', 'Certificate of Participation — ITE Convention 2024 & 2025', 'Certificate of Participation — Cyber Summit 2023'] },
    'john michael talbo': { name: 'John Michael Talbo', department: 'AI Chat Digital Twin', role: 'AI Chat Developer', education: 'BS Information Technology — St. Paul University Philippines (2023–Present)', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'SQL', 'Laravel', 'PostgreSQL'] },
    'arjay pamittan': { name: 'Arjay Pamittan', department: 'AI Chat Digital Twin', role: 'AI Chat Developer', education: 'BS Information Technology — St. Paul University Philippines (2023–Present)', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'SQL', 'Laravel', 'PostgreSQL'] },
    'marc ruben lucas': { name: 'Marc Ruben Lucas', department: 'AI Chat Digital Twin', role: 'AI Chat Developer', education: 'BS Information Technology — St. Paul University Philippines (2023–Present)', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'SQL', 'Laravel', 'PostgreSQL'] },
    'peter cauan': { name: 'Peter Cauan', department: 'UI', role: 'UI Designer', education: 'BS Information Technology — St. Paul University Philippines (2023–Present)', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'SQL', 'Laravel', 'PostgreSQL'] },
    'michael josh jacinto': { name: 'Michael Josh Jacinto', department: 'UI', role: 'UI Designer', education: 'BS Information Technology — St. Paul University Philippines (2023–Present)', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'SQL', 'Laravel', 'PostgreSQL'] },
    'aaron clerf sarambao': { name: 'Aaron Clerf Sarambao', department: 'Database Back End', role: 'Backend Developer', education: 'BS Information Technology — St. Paul University Philippines (2023–Present)', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'SQL', 'Laravel', 'PostgreSQL'] },
    'christian jerald martinez': { name: 'Christian Jerald Martinez', department: 'Database Back End', role: 'Backend Developer', education: 'BS Information Technology — St. Paul University Philippines (2023–Present)', skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'SQL', 'Laravel', 'PostgreSQL'] },
  };
  const key = name.toLowerCase().replace(/prince\s+/i, '');
  const found = Object.entries(members).find(([k]) => k.includes(key) || key.includes(k.split(' ')[0]));
  if (!found) return JSON.stringify({ error: `No member found matching "${name}"`, available_members: Object.values(members).map((m) => (m as Record<string, string>).name) });
  return JSON.stringify(found[1]);
}

interface RecommendResourcesArgs { skill: string; level?: string; }

function recommendLearningResources(args: RecommendResourcesArgs): string {
  const { skill, level = 'beginner' } = args;
  const resourceMap: Record<string, { free: object[]; paid: object[] }> = {
    react: { free: [{ platform: 'React Docs', url: 'react.dev', description: 'Official React documentation with interactive examples', duration: 'Self-paced' }, { platform: 'freeCodeCamp', url: 'freecodecamp.org', description: 'Full React curriculum with projects', duration: '8-10 hours' }], paid: [{ platform: 'Udemy', course: 'React — The Complete Guide (Maximilian Schwarzmüller)', price: '~$15', duration: '48 hours', rating: '4.8/5' }] },
    'next.js': { free: [{ platform: 'Next.js Docs', url: 'nextjs.org/learn', description: 'Official Next.js learn course — App Router focused', duration: '6-8 hours' }], paid: [{ platform: 'Udemy', course: 'Next.js & React — The Complete Guide', price: '~$15', duration: '25 hours', rating: '4.7/5' }] },
    sql: { free: [{ platform: 'SQLZoo', url: 'sqlzoo.net', description: 'Interactive SQL exercises', duration: 'Self-paced' }, { platform: 'Mode Analytics SQL Tutorial', url: 'mode.com/sql-tutorial', description: 'Real-world SQL practice', duration: '5-6 hours' }], paid: [{ platform: 'Udemy', course: 'The Complete SQL Bootcamp', price: '~$15', duration: '9 hours', rating: '4.7/5' }] },
    laravel: { free: [{ platform: 'Laravel Docs', url: 'laravel.com/docs', description: 'Official Laravel documentation', duration: 'Self-paced' }, { platform: 'Laracasts Free', url: 'laracasts.com', description: 'Free beginner Laravel series', duration: '4-5 hours' }], paid: [{ platform: 'Laracasts', course: 'Laravel From Scratch', price: '$20/month', duration: '10 hours', rating: '4.9/5' }] },
    postgresql: { free: [{ platform: 'PostgreSQL Tutorial', url: 'postgresqltutorial.com', description: 'Comprehensive PostgreSQL guide', duration: 'Self-paced' }], paid: [{ platform: 'Udemy', course: 'Complete Python PostgreSQL', price: '~$15', duration: '8 hours', rating: '4.6/5' }] },
    javascript: { free: [{ platform: 'javascript.info', url: 'javascript.info', description: 'The Modern JavaScript Tutorial', duration: 'Self-paced' }, { platform: 'freeCodeCamp', url: 'freecodecamp.org', description: 'JavaScript Algorithms and Data Structures', duration: '300 hours' }], paid: [{ platform: 'Udemy', course: 'The Complete JavaScript Course (Jonas Schmedtmann)', price: '~$15', duration: '69 hours', rating: '4.8/5' }] },
  };
  const key = skill.toLowerCase().replace(/\s+/g, '');
  const found = resourceMap[key] ?? resourceMap[Object.keys(resourceMap).find((k) => key.includes(k) || k.includes(key)) ?? ''];
  if (!found) return JSON.stringify({ skill, level, message: `Search for "${skill} tutorial" on freeCodeCamp, Coursera, or Udemy. Filter by ${level} level.`, general_tips: ['Start with official documentation', 'Build a small project while learning', 'Join a community (Reddit, Discord)', 'Practice daily — even 30 minutes counts'] });
  return JSON.stringify({ skill, level, resources: found });
}

interface SuggestCertificationsArgs { goal: string; current_skills?: string[]; }

function suggestCertifications(args: SuggestCertificationsArgs): string {
  const { goal, current_skills = [] } = args;
  const allCerts = [
    { name: 'AWS Certified Cloud Practitioner', provider: 'Amazon', relevance: ['cloud', 'devops', 'backend', 'fullstack'], level: 'entry', cost: '$100', prep_time: '4-6 weeks', value: 'High — most recognized cloud cert' },
    { name: 'Google Associate Cloud Engineer', provider: 'Google', relevance: ['cloud', 'devops'], level: 'associate', cost: '$200', prep_time: '8-12 weeks', value: 'High — Google Cloud ecosystem' },
    { name: 'Meta Front-End Developer Certificate', provider: 'Meta / Coursera', relevance: ['frontend', 'web', 'ui', 'react'], level: 'entry', cost: '$49/month Coursera', prep_time: '7 months', value: 'High for entry-level frontend roles' },
    { name: 'Google UX Design Certificate', provider: 'Google / Coursera', relevance: ['ui', 'ux', 'design', 'frontend'], level: 'entry', cost: '$49/month Coursera', prep_time: '6 months', value: 'High for UI/UX roles' },
    { name: 'CompTIA Security+', provider: 'CompTIA', relevance: ['cybersecurity', 'security', 'networking'], level: 'entry', cost: '$370', prep_time: '8-12 weeks', value: 'Industry standard for cybersecurity entry' },
    { name: 'Oracle Certified Associate — Java', provider: 'Oracle', relevance: ['java', 'backend', 'enterprise'], level: 'associate', cost: '$245', prep_time: '6-8 weeks', value: 'Good for enterprise Java roles' },
    { name: 'GitHub Actions Certification', provider: 'GitHub', relevance: ['devops', 'ci/cd', 'backend'], level: 'entry', cost: '$99', prep_time: '3-4 weeks', value: 'Relevant for modern dev workflows' },
    { name: 'PostgreSQL Associate Certification', provider: 'EDB', relevance: ['database', 'backend', 'sql'], level: 'associate', cost: '$200', prep_time: '4-6 weeks', value: 'Good for DB-focused roles' },
  ];
  const goalLower = goal.toLowerCase();
  const relevant = allCerts.filter((c) => c.relevance.some((r) => goalLower.includes(r) || r.includes(goalLower.split(' ')[0])));
  const results = relevant.length > 0 ? relevant : allCerts.slice(0, 3);
  return JSON.stringify({ goal, current_skills, recommended_certifications: results, tip: 'Start with entry-level certs to build credibility, then advance as you gain experience.' });
}

interface StudyPlanArgs { topic: string; hours_per_week?: number; duration_weeks?: number; }

function generateStudyPlan(args: StudyPlanArgs): string {
  const { topic, hours_per_week = 10, duration_weeks = 8 } = args;
  const totalHours = hours_per_week * duration_weeks;
  const phases = [
    { phase: 'Foundation', weeks: `1-${Math.round(duration_weeks * 0.25)}`, focus: `Core concepts and syntax of ${topic}`, activities: ['Read official documentation or textbook', 'Watch 1-2 intro videos per session', 'Complete beginner exercises'], hours: Math.round(totalHours * 0.25) },
    { phase: 'Core Skills', weeks: `${Math.round(duration_weeks * 0.25) + 1}-${Math.round(duration_weeks * 0.6)}`, focus: `Intermediate features and real-world patterns in ${topic}`, activities: ['Build a small project from scratch', 'Follow along with a structured course', 'Read articles and blog posts'], hours: Math.round(totalHours * 0.35) },
    { phase: 'Practice & Projects', weeks: `${Math.round(duration_weeks * 0.6) + 1}-${Math.round(duration_weeks * 0.85)}`, focus: `Apply ${topic} in a personal or team project`, activities: ['Build and ship a complete project', 'Contribute to open source or GitHub', 'Seek code review feedback'], hours: Math.round(totalHours * 0.25) },
    { phase: 'Review & Polish', weeks: `${Math.round(duration_weeks * 0.85) + 1}-${duration_weeks}`, focus: 'Solidify knowledge and prepare for interviews/exams', activities: ['Review weak areas', 'Practice interview questions', 'Document what you built'], hours: Math.round(totalHours * 0.15) },
  ];
  return JSON.stringify({ topic, hours_per_week, duration_weeks, total_hours: totalHours, study_plan: phases, daily_tip: 'Consistency beats intensity — 1 hour daily is better than 7 hours on Sunday.' });
}

interface EvaluateTechStackArgs { stack: string[]; project_type: string; }

function evaluateTechStack(args: EvaluateTechStackArgs): string {
  const { stack, project_type } = args;
  const techInfo: Record<string, { strengths: string[]; weaknesses: string[]; best_for: string }> = {
    react: { strengths: ['Component reuse', 'Large ecosystem', 'Strong community'], weaknesses: ['Steep learning curve for beginners', 'Requires additional libraries for routing/state'], best_for: 'SPAs, dashboards, complex UIs' },
    'next.js': { strengths: ['SSR/SSG built-in', 'File-based routing', 'Full-stack capable', 'Vercel deployment'], weaknesses: ['More complex than plain React', 'Build times can be slow for large apps'], best_for: 'Full-stack web apps, portfolios, SaaS' },
    laravel: { strengths: ['Batteries included (auth, ORM, queue)', 'Elegant syntax', 'Strong in Philippines tech scene'], weaknesses: ['PHP can be slower than Node', 'Less popular in US startup market'], best_for: 'Web apps, REST APIs, admin panels' },
    postgresql: { strengths: ['ACID compliant', 'JSON support', 'Highly scalable', 'Free and open source'], weaknesses: ['Setup can be complex', 'Requires understanding of relational modeling'], best_for: 'Any production web app requiring structured data' },
    'tailwind css': { strengths: ['Fast prototyping', 'No context switching', 'Highly customizable'], weaknesses: ['Class-heavy HTML', 'Learning curve for utility-first approach'], best_for: 'Any web project, especially React/Next.js' },
  };
  const evaluation = stack.map((tech) => {
    const info = techInfo[tech.toLowerCase()] ?? { strengths: ['Widely used', 'Good community support'], weaknesses: ['Varies by use case'], best_for: 'Depends on context' };
    return { technology: tech, ...info };
  });
  const synergy = stack.includes('Next.js') && stack.includes('PostgreSQL') ? 'Excellent — Next.js + PostgreSQL is a modern, production-ready stack.' : stack.includes('Laravel') && stack.includes('PostgreSQL') ? 'Excellent — Laravel + PostgreSQL is a solid, battle-tested combination.' : 'Good combination — ensure you have a clear integration plan between layers.';
  return JSON.stringify({ project_type, stack, evaluation, overall_synergy: synergy, recommendation: `This stack is ${evaluation.length >= 3 ? 'comprehensive' : 'lean'} for a ${project_type}. ${synergy}` });
}

interface AssessProjectIdeaArgs { idea: string; skills?: string[]; timeline_weeks?: number; }

function assessProjectIdea(args: AssessProjectIdeaArgs): string {
  const { idea, skills = [], timeline_weeks = 12 } = args;
  const wordCount = idea.split(' ').length;
  const complexity = wordCount > 30 ? 'high' : wordCount > 15 ? 'medium' : 'low';
  const feasibility = timeline_weeks >= 12 ? 'High' : timeline_weeks >= 6 ? 'Medium' : 'Low — consider reducing scope';
  return JSON.stringify({
    idea,
    assessment: {
      complexity,
      feasibility,
      learning_value: 'High — building a real project is the best way to solidify skills',
      estimated_timeline: `${timeline_weeks} weeks (${Math.round(timeline_weeks * 10)} total hours at 10hrs/week)`,
    },
    suggested_tech_stack: skills.includes('React') || skills.includes('Next.js') ? ['Next.js', 'PostgreSQL', 'Tailwind CSS', 'Vercel'] : ['Laravel', 'PostgreSQL', 'Bootstrap', 'PHP'],
    improvements: [
      'Add user authentication to make it production-ready',
      'Include a dashboard with analytics or reporting',
      'Make it mobile-responsive from the start',
      'Deploy early — even an MVP — to get real feedback',
    ],
    capstone_tip: 'Document your process with a README, screenshots, and a short demo video. This makes it portfolio-worthy.',
  });
}

interface NetworkingTipsArgs { focus?: string; year_level?: string; }

function getNetworkingTips(args: NetworkingTipsArgs): string {
  const { focus = 'general', year_level = '3rd year' } = args;
  const tipsByFocus: Record<string, object> = {
    linkedin: { platform: 'LinkedIn', tips: ['Add a professional headshot', 'Write a headline: "BS IT Student | React | Next.js | Open to Internships"', 'Connect with classmates, professors, and alumni', 'Post your projects and learnings weekly', 'Engage with posts from companies you want to work for', 'Reach out to alumni at target companies for informational interviews'] },
    github: { platform: 'GitHub', tips: ['Push projects consistently — even small ones', 'Write clear READMEs with screenshots', 'Pin your best 6 repositories', 'Contribute to open source (start with documentation fixes)', 'Keep a green contribution graph', 'Star and fork projects you learn from'] },
    internships: { platform: 'Internships', tips: ['Apply 3-4 months before you want to start', 'Target local tech companies, startups, and BPOs', 'Prepare 2-3 portfolio projects to showcase', 'Tailor your resume for each application', 'Follow up 1 week after applying', 'Ask professors and alumni for referrals'] },
    'open source': { platform: 'Open Source', tips: ['Start with documentation or bug fixes', 'Look for "good first issue" labels on GitHub', 'Read the contributing guide before submitting', 'Be patient — maintainers are volunteers', 'Join the project\'s Discord or Slack', 'Mention contributions on your resume and LinkedIn'] },
    general: { tips: ['Attend ITE Conventions and tech events — collect contacts', 'Join the DICT, PSITE, or local tech Facebook groups', 'Build in public — share your projects on Facebook/LinkedIn', 'Find a mentor — a senior student or professional in your field', 'Volunteer at tech events to meet organizers and speakers', 'Start a simple blog or YouTube channel about what you\'re learning'] },
  };
  const found = tipsByFocus[focus.toLowerCase()] ?? tipsByFocus.general;
  return JSON.stringify({ focus, year_level, networking_guide: found, reminder: `As a ${year_level} IT student, networking NOW gives you a 6-12 month head start on your peers when job hunting.` });
}

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export function executeMcpTool(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case 'analyze_skill_gap':           return analyzeSkillGap(args as unknown as SkillGapArgs);
    case 'score_resume':                return scoreResume(args as unknown as ResumeScoreArgs);
    case 'generate_interview_questions':return generateInterviewQuestions(args as unknown as InterviewQuestionsArgs);
    case 'get_career_path':             return getCareerPath(args as unknown as CareerPathArgs);
    case 'get_member_profile':          return getMemberProfile(args as unknown as GetMemberProfileArgs);
    case 'recommend_learning_resources':return recommendLearningResources(args as unknown as RecommendResourcesArgs);
    case 'suggest_certifications':      return suggestCertifications(args as unknown as SuggestCertificationsArgs);
    case 'generate_study_plan':         return generateStudyPlan(args as unknown as StudyPlanArgs);
    case 'evaluate_tech_stack':         return evaluateTechStack(args as unknown as EvaluateTechStackArgs);
    case 'assess_project_idea':         return assessProjectIdea(args as unknown as AssessProjectIdeaArgs);
    case 'get_networking_tips':         return getNetworkingTips(args as unknown as NetworkingTipsArgs);
    default:                            return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
