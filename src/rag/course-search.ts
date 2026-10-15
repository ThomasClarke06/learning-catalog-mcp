import { allCourses } from '../catalog.js';
import { chunkCourse } from './chunking.js';
import { courseContent } from './course-content.js';
import { embed } from './embedder.js';
import { VectorStore, type SearchHit } from './vector-store.js';

// Below this cosine similarity a chunk is usually unrelated, so it is better to return nothing.
const MIN_SIMILARITY = 0.25;

let index: Promise<VectorStore> | undefined;

async function buildIndex(): Promise<VectorStore> {
  const chunks = allCourses()
    .filter(course => courseContent[course.id])
    .flatMap(course => chunkCourse(course, courseContent[course.id]));

  // Embed "section: text" so the heading's meaning counts towards the match.
  const vectors = await embed(chunks.map(chunk => `${chunk.section}: ${chunk.text}`));

  const store = new VectorStore();
  store.add(chunks, vectors);
  console.error(`RAG index built: ${store.size} chunks`);
  return store;
}

// Built once, on the first search, so the server starts instantly.
function getIndex(): Promise<VectorStore> {
  index ??= buildIndex();
  return index;
}

export async function searchCourseContent(orgId: string, question: string, limit: number): Promise<SearchHit[]> {
  const [store, [queryVector]] = await Promise.all([getIndex(), embed([question])]);
  return store.search(queryVector, orgId, limit, MIN_SIMILARITY);
}
