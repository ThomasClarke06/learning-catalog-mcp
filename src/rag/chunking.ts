import type { Course } from '../catalog.js';

export interface Chunk {
  id: string;
  courseId: string;
  courseTitle: string;
  orgId: string;
  section: string;
  text: string;
}

const SECTION_HEADING = /^## (.+)$/m;

// One chunk per "## " section: each section is one idea, and the heading becomes the citation.
export function chunkCourse(course: Course, content: string): Chunk[] {
  return content
    .split(/^(?=## )/m)
    .map(part => part.trim())
    .filter(part => SECTION_HEADING.test(part))
    .map((part, index) => {
      const section = part.match(SECTION_HEADING)![1].trim();
      const text = part.replace(SECTION_HEADING, '').trim();

      return {
        id: `${course.id}#${index}`,
        courseId: course.id,
        courseTitle: course.title,
        orgId: course.orgId,
        section,
        text,
      };
    });
}
