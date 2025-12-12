/// <reference types="vite/client" />
// API Configuration
// Automatically detect API URL based on environment

const getApiUrl = (): string => {
  // Use environment variable if available (works for both dev and prod if set in .env)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // If running in development with Vite, use localhost on port 3002
  if (import.meta.env.DEV) {
    return 'http://localhost:3002/api';
  }

  // Fallback (this was causing the issue in Tauri)
  return 'http://localhost:3002/api'; 
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
