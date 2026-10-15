import { pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers';

// Small local embedding model (384 dimensions): no API key, and it runs offline once downloaded.
const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';

let extractor: Promise<FeatureExtractionPipeline> | undefined;

function getExtractor(): Promise<FeatureExtractionPipeline> {
  extractor ??= pipeline('feature-extraction', EMBEDDING_MODEL, { dtype: 'fp32' });
  return extractor;
}

// Vectors are normalised, so a dot product between two of them is their cosine similarity.
export async function embed(texts: string[]): Promise<number[][]> {
  const embedder = await getExtractor();
  const output = await embedder(texts, { pooling: 'mean', normalize: true });
  return output.tolist() as number[][];
}
