/**
 * Models Service
 * Handles data fetching for Model Evaluation, Performance metrics, and XAI (Explainable AI).
 */
import { apiClient } from './apiClient';
import { 
  ModelInfo, 
  ModelInsightsResponse, 
  ModelMetricsResponse, 
  ScatterResponse, 
  ResidualResponse 
} from '../types/api';

export const modelsService = {
  
  getModelInfo: async () => {
    const response = await apiClient.get<ModelInfo>('/model/info');
    return response.data;
  },

  
  getPerformanceMetrics: async () => {
    const response = await apiClient.get<ModelMetricsResponse>('/model/performance');
    return response.data.data;
  },

  
  getFeatureImportance: async () => {
    const response = await apiClient.get<ModelInsightsResponse>('/model/feature-importance');
    return response.data; 
  },

  
  getScatterData: async (sampleSize: number = 500) => {
    const response = await apiClient.get<ScatterResponse>('/model/scatter', {
      params: { sample_size: sampleSize }
    });
    return response.data.data;
  },

  
  getResidualsData: async (bins: number = 20) => {
    const response = await apiClient.get<ResidualResponse>('/model/residuals', {
      params: { bins }
    });
    return response.data.data;
  },

  
  reloadModel: async () => {
    const response = await apiClient.post('/model/reload');
    return response.data;
  }
};