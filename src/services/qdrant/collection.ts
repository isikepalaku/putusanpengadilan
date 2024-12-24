import { initializeClient, getClient } from './client';
import { COLLECTION_NAME, VECTOR_SIZE } from './constants';

export async function initializeCollection(): Promise<void> {
  try {
    await initializeClient();
    const client = getClient();
    
    const collections = await client.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

    if (!exists) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: 'Cosine',
        },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to initialize collection: ${message}`);
  }
}