import React, { useState, useRef, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { Search, X } from 'lucide-react';

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-adjust height based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query);
      }
    } else if (e.key === 'Enter' && e.shiftKey && e.ctrlKey) {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      setQuery(query.substring(0, start) + '\n' + query.substring(end));
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 1;
          textareaRef.current.selectionEnd = start + 1;
        }
      }, 0);
    }
  };

  const handleReset = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Masukkan kronologi singkat..."
            className="w-full px-3 py-2 pr-12 rounded-lg bg-gray-800 text-white placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     min-h-[42px] max-h-[200px] resize-none
                     overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent
                     hover:scrollbar-thumb-gray-500"
            disabled={isLoading}
            style={{ 
              lineHeight: '1.5',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgb(75 85 99) transparent'
            }}
          />
          
          {/* Mobile search/clear buttons */}
          <div className="absolute right-2 top-2 flex flex-col gap-1.5 sm:hidden">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="text-gray-400 hover:text-white focus:outline-none p-1 disabled:opacity-50
                       bg-gray-800/50 rounded-md hover:bg-gray-700/50"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
            {query && !isLoading && (
              <button
                type="button"
                onClick={handleReset}
                className="text-gray-400 hover:text-white focus:outline-none p-1
                         bg-gray-800/50 rounded-md hover:bg-gray-700/50"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Desktop clear button */}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleReset}
              className="hidden sm:block absolute right-3 top-2 text-gray-400 
                       hover:text-white focus:outline-none p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Desktop search button */}
        <button
          type="submit"
          className="hidden sm:flex px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium 
                   hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   items-center gap-1.5 justify-center self-start text-sm"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" color="white" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}