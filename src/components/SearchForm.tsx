import React, { useState, useRef, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ArrowUp, X } from 'lucide-react';

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-adjust height based on content with a smaller maximum height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 100); // Reduced maximum height to 100px
      textarea.style.height = `${newHeight}px`;
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
    } else if (e.key === 'Enter' && e.shiftKey) {
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
    <form onSubmit={handleSubmit} className="w-full max-w-3xl sticky top-2 z-10 mb-6">
      <div className="relative flex flex-col bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Masukkan kronologi singkat..."
          className="w-full px-4 py-2 pr-14 rounded-lg bg-transparent text-white placeholder-gray-400 
                   focus:outline-none focus:ring-0
                   disabled:opacity-50 disabled:cursor-not-allowed
                   min-h-[42px] max-h-[100px] resize-none
                   overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent
                   hover:scrollbar-thumb-gray-500 text-sm"
          disabled={isLoading}
          style={{ 
            lineHeight: '1.5',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(75 85 99) transparent'
          }}
        />
        
        {/* Clear button */}
        {query && !isLoading && (
          <button
            type="button"
            onClick={handleReset}
            className="absolute right-12 top-2 text-gray-400 
                     hover:text-white focus:outline-none p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-3 bottom-1.5 text-gray-400 hover:text-white focus:outline-none
                   p-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500
                   transition-colors duration-200"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" color="white" />
          ) : (
            <ArrowUp className="w-4 h-4 text-white" />
          )}
        </button>
      </div>
      
      {/* Optional helper text */}
      <div className="mt-1 text-xs text-gray-400 text-center">
        Press Enter to submit, Shift + Enter for new line
      </div>
    </form>
  );
}