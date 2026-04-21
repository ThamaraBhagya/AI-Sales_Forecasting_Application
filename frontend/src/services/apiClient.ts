/**
 * Base API Client Configuration
 * This file configures Axios to connect to  FastAPI backend.
 */
import axios from 'axios';


const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';


export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    
  },
  timeout: 15000, 
});


apiClient.interceptors.response.use(
  (response) => {
    
    return response;
  },
  (error) => {
    
    if (error.response) {
      const status = error.response.status;
      const detail = error.response.data?.detail || 'Unknown server error';

      
      if (status === 503) {
        console.error(' [API Error]: Machine Learning Model is Offline!');
        
      } else {
        console.error(` [API Error ${status}]:`, detail);
      }
    } 
    
    else if (error.request) {
      console.error(' [Network Error]: Could not connect to FastAPI. Is uvicorn running?');
    } 
    
    else {
      console.error(' [Request Error]:', error.message);
    }

    
    return Promise.reject(error);
  }
);