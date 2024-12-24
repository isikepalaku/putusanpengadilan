import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from '../../config/env';
import { validateConfig } from '../validation';

let client: QdrantClient | null = null;

export async function initializeClient(): Promise<QdrantClient> {
  if (!client) {
    try {
      await validateConfig();
      
      client = new QdrantClient({
        url: config.qdrant.url,
        apiKey: config.qdrant.apiKey,
      });

      // Test connection
      await client.healthCheck();
      
      return client;
    } catch (error) {
      client = null;
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize Qdrant client: ${message}`);
    }
  }
  return client;
}

export function getClient(): QdrantClient {
  if (!client) {
    throw new Error('Qdrant client not initialized. Call initializeClient() first.');
  }
  return client;
}