import type { SearchResult } from '../types';
import { supabase } from './supabase';

async function getEmbedding(query: string): Promise<number[]> {
  // Preprocess the query to improve search quality
  const processedQuery = query
    .trim()
    .toLowerCase()
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Remove special characters but keep spaces between words
    .replace(/[^\w\s]/g, '');
  
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: processedQuery,
      model: "text-embedding-3-small",
      dimensions: 1536, // Explicitly set dimensions for consistency
      encoding_format: "float" // Ensure consistent encoding
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to generate embedding: ${error.error?.message || 'Unknown error'}`);
  }

  const result = await response.json();
  return result.data[0].embedding;
}

export const searchLawDocuments = async (query: string): Promise<SearchResult[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    // Get embedding for the search query
    const embedding = await getEmbedding(query);

    // Perform vector similarity search with a higher threshold for better relevance
    let { data: documents, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.6, // Higher threshold for better relevance
      match_count: 10 // Get more results initially for better filtering
    });

    if (error) {
      console.error('Supabase search error:', error);
      throw error;
    }

    if (!documents || documents.length === 0) {
      // Fallback search with lower threshold if no results
      const { data: fallbackDocuments, error: fallbackError } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.4, // Lower threshold for fallback
        match_count: 5
      });

      if (fallbackError) throw fallbackError;
      documents = fallbackDocuments || [];
    }

    // Format and enhance results
    const results: SearchResult[] = documents.map((doc: any) => {
      // Construct the complete file URL if it's a relative path
      const fileUrl = doc.file_url?.startsWith('http') 
        ? doc.file_url 
        : doc.file_url 
          ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${doc.file_url}`
          : null;

      // Extract a more relevant snippet around the matching content
      let matchedSegment = '';
      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
      const content = doc.content.toLowerCase();
      let bestMatchIndex = -1;
      let bestMatchScore = 0;

      // Find the best matching section of the content using a sliding window
      const windowSize = 300;
      for (let i = 0; i < content.length - windowSize; i += 50) {
        const window = content.substring(i, i + windowSize);
        const matchScore = searchTerms.reduce((score, term) => {
          const regex = new RegExp(term, 'g');
          const matches = window.match(regex);
          return score + (matches ? matches.length : 0);
        }, 0);

        if (matchScore > bestMatchScore) {
          bestMatchScore = matchScore;
          bestMatchIndex = i;
        }
      }

      // Extract the best matching segment
      if (bestMatchIndex !== -1) {
        matchedSegment = doc.content.substring(
          bestMatchIndex,
          bestMatchIndex + windowSize
        );
      } else {
        // Fallback to the beginning of the content
        matchedSegment = doc.content.substring(0, windowSize);
      }

      // Highlight search terms in the matched segment
      const highlightedSegment = searchTerms.reduce((text, term) => {
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
      }, matchedSegment);

      // Calculate normalized relevance score (0-100)
      const normalizedScore = Math.round(doc.similarity * 100);

      return {
        document: {
          id: doc.id,
          title: doc.title,
          content: doc.content,
          category: doc.category,
          dateAdded: doc.dateAdded,
          tags: doc.tags,
          file_path: doc.file_path,
          file_url: fileUrl,
          metadata: {
            ...doc.metadata,
            file_url: fileUrl
          }
        },
        relevanceScore: normalizedScore,
        matchedSegments: [highlightedSegment + '...']
      };
    });

    // Sort by relevance and limit to top 5 results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
};