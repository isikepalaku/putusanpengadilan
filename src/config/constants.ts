// Search configuration
export const SEARCH_CONFIG = {
  DEBOUNCE_MS: 300,
  MIN_QUERY_LENGTH: 2,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  SEARCH_FAILED: 'Search failed. Please check your search query and try again.',
  CONNECTION_ERROR: 'Unable to connect to search service. Please check your configuration.',
  INVALID_CONFIG: 'Invalid configuration. Please check your environment variables.',
  INITIALIZATION_ERROR: 'Failed to initialize search service.',
  MIN_QUERY_LENGTH: 'Please enter at least 2 characters to search.',
} as const;