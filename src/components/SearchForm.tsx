import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface SearchFormProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(42, textarea.scrollHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setQuery(''); // Clear text after search
      if (textareaRef.current) {
        textareaRef.current.style.height = '42px'; // Reset height
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey) {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim());
        setQuery(''); // Clear text after search
        if (textareaRef.current) {
          textareaRef.current.style.height = '42px'; // Reset height
        }
      }
    }
  };

  const handleReset = () => {
    setQuery('');
    onSearch('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '42px'; // Reset height
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl sticky top-2 z-10 mb-6">
      <div className="relative">
        <div className="relative w-full flex items-center bg-neutral-900/95 border border-neutral-700/50 shadow-sm px-3 gap-3 rounded-xl transition-all duration-200 hover:border-neutral-600 focus-within:border-neutral-600 focus-within:ring-2 focus-within:ring-neutral-500/30 overflow-hidden">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Masukkan kronologi singkat..."
            disabled={isLoading}
            rows={1}
            className="w-full py-2 pr-20 pl-0 min-h-[42px] bg-transparent border-0 text-base text-white placeholder:text-neutral-400 resize-none focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={handleReset}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 transition-colors"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  className="h-4 w-4"
                  strokeWidth="2"
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                <span className="sr-only">Clear input</span>
              </button>
            )}
            
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="h-8 w-8 rounded-lg flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <ArrowUp className="h-5 w-5" />
              )}
              <span className="sr-only">Submit</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}