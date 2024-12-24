import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../config/env';
import { getEmbedding } from './openai';
import type { LegalDocument, SearchResult } from '../types';

const COLLECTION_NAME = 'legal_documents';
const VECTOR_SIZE = 1536; // Size of text-embedding-3-small embeddings
const SEARCH_LIMIT = 10;

let client: QdrantClient | null = null;

function getClient(): QdrantClient {
  if (!client) {
    const url = config.qdrant.url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      throw new Error(
        'Invalid Qdrant URL. Please ensure VITE_QDRANT_URL starts with http:// or https://'
      );
    }
    
    client = new QdrantClient({
      url: config.qdrant.url,
      apiKey: config.qdrant.apiKey,
    });
  }
  return client;
}

async function initializeCollection() {
  try {
    const collections = await getClient().getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

    if (!exists) {
      await getClient().createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: 'Cosine',
        },
      });
    }
  } catch (error) {
    console.error('Failed to initialize collection:', error);
    throw new Error('Failed to initialize vector database. Please check your Qdrant configuration.');
  }
}

export async function indexDocument(document: LegalDocument): Promise<void> {
  await initializeCollection();
  
  const embedding = await getEmbedding(document.title + ' ' + document.content);
  
  await getClient().upsert(COLLECTION_NAME, {
    points: [{
      id: document.id,
      vector: embedding,
      payload: document,
    }],
  });
}

export async function searchDocuments(query: string): Promise<SearchResult[]> {
  if (!query.trim()) {
    return [];
  }

  try {
    await initializeCollection();
    
    const queryEmbedding = await getEmbedding(query);
    
    const searchResults = await getClient().search(COLLECTION_NAME, {
      vector: queryEmbedding,
      limit: SEARCH_LIMIT,
      with_payload: true,
    });

    return searchResults.map(result => {
      const document = result.payload as LegalDocument;
      const relevanceScore = result.score || 0;

      // Extract matching segments (simplified for demo)
      const content = document.content.toLowerCase();
      const queryTerms = query.toLowerCase().split(' ');
      const matchedSegments: string[] = [];

      queryTerms.forEach(term => {
        const index = content.indexOf(term);
        if (index !== -1) {
          const start = Math.max(0, index - 40);
          const end = Math.min(content.length, index + term.length + 40);
          matchedSegments.push(`...${content.slice(start, end)}...`);
        }
      });

      return {
        document,
        relevanceScore,
        matchedSegments: [...new Set(matchedSegments)],
      };
    });
  } catch (error) {
    console.error('Search failed:', error);
    throw new Error('Search failed. Please check your configuration and try again.');
  }
}