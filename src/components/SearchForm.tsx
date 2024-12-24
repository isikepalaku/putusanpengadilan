import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { Search, X } from 'lucide-react';

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleReset = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Masukkan kronologi singkat..."
            className="w-full p-4 pl-12 rounded-lg bg-gray-800 text-white placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleReset}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 
                       hover:text-white focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium 
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2 justify-center
                   w-full sm:w-auto"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Search</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}