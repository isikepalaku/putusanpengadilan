import { initializeClient, getClient } from './client';
import { initializeCollection } from './collection';
import { COLLECTION_NAME, SEARCH_LIMIT } from './constants';
import { getEmbedding } from '../openai';
import type { LegalDocument, SearchResult } from '../../types';
import { extractMatchedSegments } from './utils';

export async function searchDocuments(query: string): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    await initializeClient();
    await initializeCollection();
    const client = getClient();
    
    const queryEmbedding = await getEmbedding(query);
    
    const searchResults = await client.search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: SEARCH_LIMIT,
      with_payload: true,
    });

    return searchResults.map(result => ({
      document: result.payload as LegalDocument,
      relevanceScore: result.score || 0,
      matchedSegments: extractMatchedSegments(
        (result.payload as LegalDocument).content,
        query
      ),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Search error:', message);
    throw new Error(`Search failed: ${message}`);
  }
}