import { getClient } from './client';
import { initializeCollection } from './collection';
import { COLLECTION_NAME } from './constants';
import { getEmbedding } from '../openai';
import type { LegalDocument } from '../../types';

export async function indexDocument(document: LegalDocument): Promise<void> {
  try {
    await initializeCollection();
    
    const embedding = await getEmbedding(document.title + ' ' + document.content);
    
    await getClient().upsert(COLLECTION_NAME, {
      points: [{
        id: document.id,
        vector: embedding,
        payload: document,
      }],
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to index document: ${error.message}`);
    }
    throw new Error('Failed to index document. Please check your configuration.');
  }
}