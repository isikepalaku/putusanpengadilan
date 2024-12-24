import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  query: string;
  setQuery: (query: string) => void;
}

export function SearchBar({ query, setQuery }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-2xl">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                 bg-white/50 backdrop-blur-sm shadow-sm
                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                 placeholder-gray-400 transition-all duration-200
                 hover:bg-white/70"
        placeholder="Search legal documents..."
      />
    </div>
  );
}