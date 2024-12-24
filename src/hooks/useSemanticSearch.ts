import { useState } from 'react';
import { searchLawDocuments } from '../services/search';

interface SearchResult {
  id: number;
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

export const useSemanticSearch = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const searchResults = await searchLawDocuments(query);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during search');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    search,
    results,
    isLoading,
    error
  };
};