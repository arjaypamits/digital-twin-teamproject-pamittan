/**
 * MCP (Model Context Protocol) Tool Definitions & Handlers
 *
 * Exposes career-coaching tools that the LLM can invoke mid-conversation
 * via structured tool_use / function-calling.
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
  {
    type: 'function',
    function: {
      name: 'analyze_skill_gap',
      description:
        'Given a current role/skills and a target role, returns a structured skill-gap analysis with missing skills ranked by priority and suggested learning resources.',
      parameters: {
        type: 'object',
        properties: {
          current_role: { type: 'string', description: 'The user\'s current job title or role' },
          current_skills: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of skills the user currently has',
          },
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
      description:
        'Scores a resume summary against a target role on key dimensions: relevance, impact language, keyword match, and overall strength.',
      parameters: {
        type: 'object',
        properties: {
          resume_summary: { type: 'string', description: 'A brief summary or bullet points from the user\'s resume' },
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
      description:
        'Generates a set of role-specific interview questions (behavioral + technical) with evaluation criteria.',
      parameters: {
        type: 'object',
        properties: {
          role: { type: 'string', description: 'The job role to generate questions for' },
          difficulty: {
            type: 'string',
            enum: ['entry', 'mid', 'senior'],
            description: 'Difficulty level of the questions',
          },
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
      description:
        'Returns a suggested career progression path from a starting role to a target role, including intermediate steps, typical timelines, and key milestones.',
      parameters: {
        type: 'object',
        properties: {
          current_role: { type: 'string', description: 'The user\'s current role' },
          target_role: { type: 'string', description: 'The desired end-goal role' },
          industry: { type: 'string', description: 'Industry context (e.g. tech, finance, healthcare)' },
        },
        required: ['current_role', 'target_role'],
      },
    },
  },
];

// ─── Tool Handlers ──────────────────────────────────────────────────────────

interface SkillGapArgs {
  current_role: string;
  current_skills?: string[];
  target_role: string;
}

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

  const targetKey = target_role.toLowerCase();
  const requiredSkills = skillDb[targetKey] ?? ['Communication', 'Problem Solving', 'Domain Knowledge', 'Technical Skills', 'Leadership'];
  const lowerCurrent = current_skills.map((s) => s.toLowerCase());
  const missing = requiredSkills.filter((s) => !lowerCurrent.includes(s.toLowerCase()));

  return JSON.stringify({
    current_role,
    target_role,
    skills_you_have: current_skills,
    missing_skills: missing.map((skill, i) => ({
      skill,
      priority: i < 3 ? 'high' : 'medium',
      suggested_resource: `Search for "${skill} course" on Coursera, Udemy, or freeCodeCamp`,
      estimated_time: i < 3 ? '4-6 weeks' : '2-4 weeks',
    })),
    match_percentage: Math.round(((requiredSkills.length - missing.length) / requiredSkills.length) * 100),
  });
}

interface ResumeScoreArgs {
  resume_summary: string;
  target_role: string;
}

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
    top_suggestion: overall < 6
      ? 'Focus on adding measurable achievements and tailoring your language to the target role.'
      : 'Strong foundation — refine keyword alignment and quantify more results.',
  });
}

interface InterviewQuestionsArgs {
  role: string;
  difficulty?: string;
  count?: number;
}

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
    role,
    difficulty,
    questions: [
      ...behavioral.map((q) => ({ ...q, type: 'behavioral' })),
      ...technical.map((q) => ({ ...q, type: 'technical' })),
    ],
    tips: difficulty === 'entry'
      ? 'Focus on demonstrating eagerness to learn and transferable skills.'
      : difficulty === 'senior'
        ? 'Emphasize leadership, strategic thinking, and measurable outcomes.'
        : 'Balance technical depth with clear communication of your approach.',
  });
}

interface CareerPathArgs {
  current_role: string;
  target_role: string;
  industry?: string;
}

function getCareerPath(args: CareerPathArgs): string {
  const { current_role, target_role, industry = 'technology' } = args;

  return JSON.stringify({
    current_role,
    target_role,
    industry,
    path: [
      { step: 1, role: current_role, duration: 'Current', focus: 'Build foundational skills and domain knowledge' },
      { step: 2, role: `Senior ${current_role}`, duration: '1-2 years', focus: 'Deepen expertise, mentor others, take on larger projects' },
      { step: 3, role: `Lead / Principal`, duration: '2-3 years', focus: 'Develop leadership skills, drive cross-team initiatives' },
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

// ─── Dispatcher ─────────────────────────────────────────────────────────────

export function executeMcpTool(name: string, args: Record<string, unknown>): string {
  switch (name) {
    case 'analyze_skill_gap':
      return analyzeSkillGap(args as unknown as SkillGapArgs);
    case 'score_resume':
      return scoreResume(args as unknown as ResumeScoreArgs);
    case 'generate_interview_questions':
      return generateInterviewQuestions(args as unknown as InterviewQuestionsArgs);
    case 'get_career_path':
      return getCareerPath(args as unknown as CareerPathArgs);
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}
