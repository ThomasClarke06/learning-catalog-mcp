import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { coursesForOrg, findCourse, learningPath, searchCourses, type Course } from './catalog.js';

const levelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

function formatCourse(course: Course): string {
  return `- ${course.title} (id: ${course.id}, ${course.level}, ${course.durationMinutes} min): ${course.description}`;
}

function textResult(text: string) {
  return { content: [{ type: 'text' as const, text }] };
}

// orgId comes from server config (in a real product: the authenticated user's token), never from the model.
export function createServer(orgId: string): McpServer {
  const server = new McpServer({ name: 'learning-catalog', version: '1.0.0' });

  server.registerTool(
    'search_courses',
    {
      title: 'Search courses',
      description: 'Search the learning catalogue by keyword (title, description or skill). Optionally filter by level.',
      inputSchema: {
        query: z.string().min(1).describe('Keywords, e.g. "rag embeddings" or "aws"'),
        level: levelSchema.optional().describe('Only return courses at this level'),
      },
      annotations: { readOnlyHint: true },
    },
    async ({ query, level }) => {
      const results = searchCourses(orgId, query, level);
      if (!results.length) {
        return textResult(`No courses found for "${query}".`);
      }
      return textResult(results.map(formatCourse).join('\n'));
    },
  );

  server.registerTool(
    'get_course',
    {
      title: 'Get course',
      description: 'Get full details of one course by its id.',
      inputSchema: { id: z.string().describe('Course id from search_courses') },
      annotations: { readOnlyHint: true },
    },
    async ({ id }) => {
      const course = findCourse(orgId, id);
      if (!course) {
        return { ...textResult(`No course with id "${id}".`), isError: true };
      }
      return textResult(JSON.stringify(course, null, 2));
    },
  );

  server.registerTool(
    'recommend_learning_path',
    {
      title: 'Recommend learning path',
      description: 'Return the courses that teach a skill, ordered from beginner to advanced.',
      inputSchema: { skill: z.string().describe('A skill, e.g. "ai", "typescript", "aws"') },
      annotations: { readOnlyHint: true },
    },
    async ({ skill }) => {
      const path = learningPath(orgId, skill);
      if (!path.length) {
        return textResult(`No courses teach "${skill}" yet.`);
      }
      return textResult(path.map((course, i) => `${i + 1}. ${formatCourse(course).slice(2)}`).join('\n'));
    },
  );

  server.registerResource(
    'catalog',
    'catalog://courses',
    {
      title: 'Course catalogue',
      description: 'Every course visible to this organisation, as JSON.',
      mimeType: 'application/json',
    },
    async uri => ({
      contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(coursesForOrg(orgId), null, 2) }],
    }),
  );

  server.registerPrompt(
    'study_plan',
    {
      title: 'Study plan',
      description: 'Ask the assistant to build a weekly study plan for a skill using the catalogue tools.',
      argsSchema: {
        skill: z.string().describe('The skill to learn'),
        hoursPerWeek: z.string().describe('How many hours a week the learner has'),
      },
    },
    ({ skill, hoursPerWeek }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Use recommend_learning_path to find courses for "${skill}", then build a week-by-week study plan that fits ${hoursPerWeek} hours a week. Only use courses that the tools return.`,
          },
        },
      ],
    }),
  );

  return server;
}
