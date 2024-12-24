import { z } from 'zod';

const urlSchema = z.string()
  .min(1, 'URL is required')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'URL must start with http:// or https://'
  );

const envSchema = z.object({
  openai: z.object({
    apiKey: z.string().min(1, 'OpenAI API key is required'),
    baseUrl: urlSchema,
  }),
  qdrant: z.object({
    url: urlSchema,
    apiKey: z.string().min(1, 'Qdrant API key is required'),
  }),
});

type EnvConfig = z.infer<typeof envSchema>;

function validateEnvVars(): EnvConfig {
  const config = {
    openai: {
      apiKey: import.meta.env.VITE_OPENAI_API_KEY ?? '',
      baseUrl: import.meta.env.VITE_OPENAI_API_BASE_URL ?? '',
    },
    qdrant: {
      url: import.meta.env.VITE_QDRANT_URL ?? '',
      apiKey: import.meta.env.VITE_QDRANT_API_KEY ?? '',
    },
  };

  try {
    return envSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `- ${issue.path.join('.')}: ${issue.message}`).join('\n');
      throw new Error(
        'Environment configuration error:\n' +
        issues + '\n\n' +
        'Please ensure your .env file contains valid values:\n' +
        '- VITE_QDRANT_URL must start with http:// or https://\n' +
        '- VITE_OPENAI_API_BASE_URL must start with http:// or https://'
      );
    }
    throw error;
  }
}

export const config = validateEnvVars();