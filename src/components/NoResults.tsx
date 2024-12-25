interface NoResultsProps {
  query: string;
}

export function NoResults({ query }: NoResultsProps) {
  return (
    <div className="text-center py-12">
      <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
      <p className="text-gray-400">
        No documents matching "{query}" were found. Try different keywords or search terms.
      </p>
    </div>
  );
}