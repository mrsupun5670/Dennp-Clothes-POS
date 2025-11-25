// API Configuration
// Automatically detect API URL based on environment

const getApiUrl = (): string => {
  // If running in development with Vite, use localhost on port 3002
  if ((import.meta as any).env?.DEV) {
    return 'http://localhost:3002/api/v1';
  }

  // If running in Electron or production, use relative paths
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:3002/api/v1';
  }

  // Default to relative API path for production
  return '/api/v1';
};

export const API_URL = getApiUrl();
export const API_BASE_URL = API_URL.replace('/api/v1', '');

// Helper function to make API calls
export const apiCall = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const url = `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};
