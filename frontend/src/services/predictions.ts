/**
 * Predictions Service
 * Handles single and batch inference requests for the Predictive Simulator.
 */
import { apiClient } from './apiClient';
import { 
  PredictionRequest, 
  PredictionResponse, 
  BatchPredictionRequest, 
  BatchPredictionResponse 
} from '../types/api';

export const predictionsService = {
  
  predictSales: async (data: PredictionRequest) => {
    const response = await apiClient.post<PredictionResponse>('/predict', data);
    return response.data; 
  },

  
  predictBatch: async (data: BatchPredictionRequest) => {
    const response = await apiClient.post<BatchPredictionResponse>('/predict/batch', data);
    return response.data;
  }
};