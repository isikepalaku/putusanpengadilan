import { z } from 'zod';

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string(),
  VITE_OPENAI_API_KEY: z.string().optional(),
  VITE_SITE_URL: z.string().url().optional(),
  VITE_GOOGLE_CLIENT_ID: z.string().optional()
});

function getBaseUrl(): string {
  if (import.meta.env.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL;
  }
  return typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5086';
}

interface EnvType {
  supabaseUrl: string;
  supabaseAnonKey: string;
  openaiApiKey?: string;
  siteUrl: string;
  googleClientId?: string;
}

try {
  const rawConfig = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
    VITE_SITE_URL: import.meta.env.VITE_SITE_URL,
    VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID
  };
  
  envSchema.parse(rawConfig);
} catch (error) {
  if (error instanceof z.ZodError) {
    const issues = error.issues.map((issue: z.ZodIssue) => 
      `${issue.path.join('.')}: ${issue.message}`
    ).join('\n');
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  throw error;
}

export const config = {
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
    baseUrl: 'https://api.openai.com/v1'
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL as string,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  },
  site: {
    url: getBaseUrl()
  },
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID as string
  }
};

export const env: EnvType = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  siteUrl: getBaseUrl(),
  ...(import.meta.env.VITE_OPENAI_API_KEY && {
    openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY
  }),
  ...(import.meta.env.VITE_GOOGLE_CLIENT_ID && {
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID
  })
};