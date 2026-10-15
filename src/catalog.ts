export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  id: string;
  // 'shared' courses are visible to every organisation; anything else belongs to one org only.
  orgId: string;
  title: string;
  description: string;
  skills: string[];
  level: Level;
  durationMinutes: number;
}

export const SHARED_ORG_ID = 'shared';

const courses: Course[] = [
  {
    id: 'ts-101',
    orgId: SHARED_ORG_ID,
    title: 'TypeScript Fundamentals',
    description: 'Types, interfaces, generics and strict mode for JavaScript developers.',
    skills: ['typescript', 'javascript'],
    level: 'beginner',
    durationMinutes: 90,
  },
  {
    id: 'node-apis',
    orgId: SHARED_ORG_ID,
    title: 'Building REST APIs with Node.js',
    description: 'Design, validate and test REST APIs with Node.js, async patterns and error handling.',
    skills: ['node.js', 'rest', 'apis', 'async'],
    level: 'intermediate',
    durationMinutes: 120,
  },
  {
    id: 'llm-intro',
    orgId: SHARED_ORG_ID,
    title: 'Introduction to Large Language Models',
    description: 'Tokens, context windows, prompting and structured outputs for building with LLMs.',
    skills: ['llms', 'ai', 'prompt engineering'],
    level: 'beginner',
    durationMinutes: 60,
  },
  {
    id: 'rag-patterns',
    orgId: SHARED_ORG_ID,
    title: 'Retrieval-Augmented Generation Patterns',
    description: 'Chunking, embeddings, vector search, hybrid search and re-ranking for grounded answers.',
    skills: ['rag', 'embeddings', 'vector databases', 'ai'],
    level: 'advanced',
    durationMinutes: 150,
  },
  {
    id: 'mcp-servers',
    orgId: SHARED_ORG_ID,
    title: 'Building MCP Servers',
    description: 'Expose tools, resources and prompts to AI assistants with the Model Context Protocol.',
    skills: ['mcp', 'ai', 'agents', 'typescript'],
    level: 'intermediate',
    durationMinutes: 75,
  },
  {
    id: 'llm-evals',
    orgId: SHARED_ORG_ID,
    title: 'Evaluating LLM Features',
    description: 'Golden datasets, LLM-as-judge, regression testing and production feedback loops.',
    skills: ['evaluation', 'llms', 'ai', 'testing'],
    level: 'advanced',
    durationMinutes: 90,
  },
  {
    id: 'aws-serverless',
    orgId: SHARED_ORG_ID,
    title: 'Serverless on AWS',
    description: 'Lambda, SQS, SNS and S3 for event-driven backends.',
    skills: ['aws', 'lambda', 'sqs', 's3'],
    level: 'intermediate',
    durationMinutes: 100,
  },
  {
    id: 'acme-onboarding',
    orgId: 'acme',
    title: 'Acme Engineering Onboarding',
    description: 'How Acme ships software: our stack, code review and release process.',
    skills: ['onboarding', 'process'],
    level: 'beginner',
    durationMinutes: 45,
  },
  {
    id: 'acme-ai-policy',
    orgId: 'acme',
    title: 'Acme Responsible AI Policy',
    description: 'What data you may send to AI tools at Acme, and how AI output is reviewed.',
    skills: ['ai', 'governance', 'safety'],
    level: 'beginner',
    durationMinutes: 30,
  },
  {
    id: 'globex-sales-kickoff',
    orgId: 'globex',
    title: 'Globex Sales Kickoff 2026',
    description: 'Globex internal sales targets and messaging for the year.',
    skills: ['sales'],
    level: 'beginner',
    durationMinutes: 60,
  },
];

const levelOrder: Level[] = ['beginner', 'intermediate', 'advanced'];

// Tenant isolation lives here, not in the tool arguments, so the model can never ask for another org's content.
export function coursesForOrg(orgId: string): Course[] {
  return courses.filter(course => course.orgId === SHARED_ORG_ID || course.orgId === orgId);
}

export function findCourse(orgId: string, id: string): Course | undefined {
  return coursesForOrg(orgId).find(course => course.id === id);
}

export function searchCourses(orgId: string, query: string, level?: Level): Course[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);

  return coursesForOrg(orgId)
    .filter(course => !level || course.level === level)
    .map(course => {
      const haystack = [course.title, course.description, ...course.skills].join(' ').toLowerCase();
      const score = terms.filter(term => haystack.includes(term)).length;
      return { course, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.course);
}

export function learningPath(orgId: string, skill: string): Course[] {
  const wanted = skill.toLowerCase();

  return coursesForOrg(orgId)
    .filter(course => course.skills.includes(wanted))
    .sort((a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level));
}
