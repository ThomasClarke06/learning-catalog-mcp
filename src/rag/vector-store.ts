import { SHARED_ORG_ID } from '../catalog.js';
import type { Chunk } from './chunking.js';

export interface SearchHit {
  chunk: Chunk;
  score: number;
}

interface StoredChunk {
  chunk: Chunk;
  vector: number[];
}

function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

// In-memory vector store with brute-force search. Fine for a few hundred chunks;
// a real product would use pgvector or OpenSearch k-NN with an approximate index.
export class VectorStore {
  private readonly items: StoredChunk[] = [];

  add(chunks: Chunk[], vectors: number[][]): void {
    chunks.forEach((chunk, i) => this.items.push({ chunk, vector: vectors[i] }));
  }

  // The org filter runs before scoring, so another org's chunks can never be returned.
  search(queryVector: number[], orgId: string, limit: number, minScore: number): SearchHit[] {
    return this.items
      .filter(item => item.chunk.orgId === SHARED_ORG_ID || item.chunk.orgId === orgId)
      .map(item => ({ chunk: item.chunk, score: dotProduct(queryVector, item.vector) }))
      .filter(hit => hit.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  get size(): number {
    return this.items.length;
  }
}
