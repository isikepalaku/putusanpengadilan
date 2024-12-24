export function LoadingCard() {
  return (
    <div className="p-6 bg-gray-800 rounded-lg animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-gray-700 rounded w-1/3"></div>
        <div className="h-6 bg-gray-700 rounded w-20"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-700 rounded w-4/6"></div>
      </div>
    </div>
  );
}