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
  /**
   * Fetches basic architecture info about the currently loaded model.
   */
  getModelInfo: async () => {
    const response = await apiClient.get<ModelInfo>('/model/info');
    return response.data;
  },

  /**
   * Fetches the comparative metrics (MAE, RMSE, R2, etc.) for your models.
   */
  getPerformanceMetrics: async () => {
    const response = await apiClient.get<ModelMetricsResponse>('/model/performance');
    return response.data.data;
  },

  /**
   * Fetches the top features driving the model's predictions (XAI).
   */
  getFeatureImportance: async () => {
    const response = await apiClient.get<ModelInsightsResponse>('/model/feature-importance');
    return response.data; // Note: Not wrapped in .data because it uses the Pydantic schema directly
  },

  /**
   * Fetches a sample of Actual vs Predicted points for the scatter plot.
   * @param sampleSize Limit the dots on the chart so the browser doesn't lag (default: 500)
   */
  getScatterData: async (sampleSize: number = 500) => {
    const response = await apiClient.get<ScatterResponse>('/model/scatter', {
      params: { sample_size: sampleSize }
    });
    return response.data.data;
  },

  /**
   * Fetches the error distribution (residuals) for the histogram chart.
   * @param bins Number of bars in the histogram (default: 20)
   */
  getResidualsData: async (bins: number = 20) => {
    const response = await apiClient.get<ResidualResponse>('/model/residuals', {
      params: { bins }
    });
    return response.data.data;
  },

  /**
   * Triggers the backend to reload the .pkl file from disk.
   * Useful if you retrain the model in a Jupyter Notebook and want the API to use the new version.
   */
  reloadModel: async () => {
    const response = await apiClient.post('/model/reload');
    return response.data;
  }
};