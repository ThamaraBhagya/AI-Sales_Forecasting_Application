/**
 * Base API Client Configuration
 * This file configures Axios to connect to your FastAPI backend.
 */
import axios from 'axios';

// Use an environment variable for the URL, but fallback to localhost:8000 for local development
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create the core Axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // 'Authorization': 'Bearer ...' // You can add auth tokens here later if needed
  },
  timeout: 15000, // Stop waiting if the ML model takes longer than 15 seconds
});

// ==========================================
// GLOBAL ERROR INTERCEPTOR
// ==========================================
// This automatically catches errors from FastAPI before they crash your React components
apiClient.interceptors.response.use(
  (response) => {
    // If the request is successful, just return the data directly
    return response;
  },
  (error) => {
    // 1. Server responded with an error (e.g., 404, 500, 503)
    if (error.response) {
      const status = error.response.status;
      const detail = error.response.data?.detail || 'Unknown server error';

      // Catch the exact 503 error we wrote in FastAPI when the model isn't loaded
      if (status === 503) {
        console.error('🚨 [API Error]: Machine Learning Model is Offline!');
        // You could trigger a global toast notification here in the future
      } else {
        console.error(`🚨 [API Error ${status}]:`, detail);
      }
    } 
    // 2. Request was made but no response was received (FastAPI is turned off)
    else if (error.request) {
      console.error('🚨 [Network Error]: Could not connect to FastAPI. Is uvicorn running?');
    } 
    // 3. Something else went wrong setting up the request
    else {
      console.error('🚨 [Request Error]:', error.message);
    }

    // Reject the promise so the specific component can also handle the error if it wants to
    return Promise.reject(error);
  }
);