import { z } from 'zod';
import { config } from '../config/env';

const envValidation = z.object({
  qdrant: z.object({
    url: z.string().url('Invalid Qdrant URL'),
    apiKey: z.string().min(1, 'Qdrant API key is required'),
  }),
  openai: z.object({
    apiKey: z.string().min(1, 'OpenAI API key is required'),
    baseUrl: z.string().url('Invalid OpenAI base URL'),
  }),
});

export async function validateConfig() {
  try {
    await envValidation.parseAsync(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => issue.message).join(', ');
      throw new Error(`Configuration validation failed: ${issues}`);
    }
    throw error;
  }
}