import { useState } from 'react';
import { SearchForm } from './SearchForm';
import { DocumentCard } from './DocumentCard';
import { SearchSkeleton } from './SearchSkeleton';
import { NoResults } from './NoResults';
import { ErrorMessage } from './ErrorMessage';
import { Logo } from './Logo';
import { useVectorSearch } from '../hooks/useVectorSearch';
import { Footer } from './Footer';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export function AppContent() {
  const { results: searchResults, isLoading, error, performSearch } = useVectorSearch();
  const [lastQuery, setLastQuery] = useState('');
  const { signOut } = useAuth();

  const handleSearch = (query: string) => {
    setLastQuery(query);
    if (query.trim()) {
      performSearch(query);
    } else {
      // Reset results when query is cleared
      performSearch('');
    }
  };

  const showResults = lastQuery.trim() || searchResults.length > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative">
      <div className="container mx-auto px-4 py-8 relative">
        <div className="max-w-5xl mx-auto">
          {/* Header with Logout */}
          <div className="flex justify-end mb-8">
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Search Section */}
          <div className="sticky top-0 z-10 bg-gray-900 pt-4 pb-6">
            <div className={`transition-all duration-300 ${showResults ? 'h-40' : 'min-h-[40vh]'} 
                          flex flex-col justify-center mb-8 md:mb-4`}>
              <div className={`transition-all duration-300 ${showResults ? 'scale-90' : 'scale-100'}`}>
                <Logo />
              </div>
              <SearchForm onSearch={handleSearch} isLoading={isLoading} />
              {error && <ErrorMessage message={error} />}
            </div>
          </div>

          {/* Results Section */}
          <div className="mt-8 pb-24">
            {isLoading ? (
              <SearchSkeleton />
            ) : searchResults.length === 0 && lastQuery ? (
              <NoResults query={lastQuery} />
            ) : (
              <div className="space-y-6">
                {searchResults.map(result => (
                  <DocumentCard
                    key={result.document.id}
                    document={result.document}
                    matchedSegments={result.matchedSegments}
                    relevanceScore={result.relevanceScore}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}