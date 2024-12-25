const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5086/api';

export async function initializeDocuments() {
  try {
    const response = await fetch(`${API_URL}/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Failed to initialize documents');
    }

    return await response.json();
  } catch (error) {
    console.error('Error initializing documents:', error);
    throw error;
  }
}