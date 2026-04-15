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
  /**
   * Makes a single real-time sales prediction based on user inputs.
   * This powers the main "Predictive Simulator" form.
   * * @param data The form data matching the PredictionRequest interface
   * @returns The predicted sales value and model metadata
   */
  predictSales: async (data: PredictionRequest) => {
    const response = await apiClient.post<PredictionResponse>('/predict', data);
    return response.data; // Pydantic returns the flat object directly
  },

  /**
   * Makes multiple predictions at once.
   * Useful for "Scenario Planning" or "Compare Promotions" features
   * where you want to send the same data twice but toggle the discount.
   * * @param data Object containing an array of PredictionRequests
   * @returns Array of predictions and a total count
   */
  predictBatch: async (data: BatchPredictionRequest) => {
    const response = await apiClient.post<BatchPredictionResponse>('/predict/batch', data);
    return response.data;
  }
};