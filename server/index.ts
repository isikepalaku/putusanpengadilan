import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('Missing OPENAI_API_KEY environment variable');
  process.exit(1);
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Print environment variables for debugging (without sensitive parts)
console.log('Environment:', {
  SUPABASE_URL: process.env.SUPABASE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY?.slice(0, 5) + '...',
});

// Supabase setup
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Generate embedding using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    console.log('Generating embedding for text:', text);
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float"
    });
    console.log('Embedding generated successfully');
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Function to add a document with its embedding
async function addDocument(content: string, metadata?: any) {
  try {
    console.log('Adding document:', { content: content.slice(0, 100), metadata });
    const embedding = await generateEmbedding(content);
    
    const { data, error } = await supabase
      .from('documents')
      .insert([
        {
          content,
          embedding,
          metadata
        }
      ]);

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Document added successfully:', data);
    return data;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

// Search documents function
async function searchDocuments(embedding: number[], matchThreshold = 0.3, matchCount = 10) {
  try {
    console.log('Searching documents with parameters:', { matchThreshold, matchCount });
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount
    });

    if (error) {
      console.error('Supabase search error:', error);
      throw error;
    }

    console.log('Search results:', data?.length || 0, 'documents found');
    return data || [];
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
}

interface SearchResult {
  id: number;
  content: string;
  metadata: {
    title?: string;
    category?: string;
    dateAdded?: string;
    tags?: string[];
  };
  similarity: number;
}

// Search endpoint
app.post('/api/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log('Processing search query:', query);
    const embedding = await generateEmbedding(query);
    const results = await searchDocuments(embedding) as SearchResult[];
    
    // Map results and highlight matched segments
    const formattedResults = results.map(row => {
      // Get the content and normalize spaces
      const content = row.content.replace(/\s+/g, ' ').trim();
      
      // Get query terms and create a regex pattern
      const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
      const searchPattern = new RegExp(`(.{0,50})(${queryTerms.join('|')})(.{0,50})`, 'gi');
      
      // Find matches in the content
      const matches = [...content.matchAll(searchPattern)];
      const matchedSegments = matches.map(match => {
        const [, before = '', term = '', after = ''] = match;
        return `...${before}<mark class="bg-yellow-200 text-black">${term}</mark>${after}...`;
      });

      // If no specific matches, show the first part of the content
      if (matchedSegments.length === 0) {
        matchedSegments.push(content.slice(0, 200) + '...');
      }

      return {
        document: {
          id: String(row.id),
          title: row.metadata?.title || 'Untitled Document',
          content: content,
          category: row.metadata?.category || 'regulation',
          dateAdded: row.metadata?.dateAdded || new Date().toISOString(),
          tags: row.metadata?.tags || []
        },
        relevanceScore: row.similarity,
        matchedSegments
      };
    });

    console.log('Sending back', formattedResults.length, 'results');
    res.json(formattedResults);
  } catch (error: any) {
    console.error('Error in /api/search:', error);
    res.status(500).json({
      error: 'Search failed',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});