import React from 'react';

export function SearchSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-700 rounded"></div>
            <div className="h-8 w-24 bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
