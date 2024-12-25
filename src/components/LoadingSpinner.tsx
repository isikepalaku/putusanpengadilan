interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'white' | 'gray';
  className?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'blue',
  className = ''
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  } as const;

  const colorClasses = {
    blue: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600'
  } as const;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        role="status"
        aria-label="Loading"
        data-testid="loading-spinner"
        className={`
          animate-spin rounded-full 
          border-2 border-t-transparent
          ${sizeClasses[size]}
          ${colorClasses[color]}
        `}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}