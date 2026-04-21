/**
 * Analytics Service
 * Handles data fetching for the Dashboard and Data Explorer views.
 */
import { apiClient } from './apiClient';
import { 
  TrendResponse, 
  CategorySalesResponse, 
  StoreSalesResponse, 
  RegionSalesResponse,
  EnvironmentalDataResponse
} from '../types/api';

export const analyticsService = {
  
  getHistoricalTrends: async (storeId?: string, days: number = 90) => {
    
    const params: Record<string, any> = { days };
    if (storeId && storeId !== 'ALL') {
      params.store_id = storeId;
    }

    const response = await apiClient.get<TrendResponse>('/analytics/trends', { params });
    return response.data.data; 
  },

  
  getSalesByCategory: async () => {
    const response = await apiClient.get<CategorySalesResponse>('/analytics/categories');
    return response.data.data;
  },

  
  getTopStores: async (top: number = 10) => {
    const response = await apiClient.get<StoreSalesResponse>('/analytics/stores', {
      params: { top }
    });
    return response.data.data;
  },

 
  getSalesByRegion: async () => {
    const response = await apiClient.get<RegionSalesResponse>('/analytics/regions');
    return response.data.data;
  },

  
  getEnvironmentalImpact: async () => {
    const response = await apiClient.get<EnvironmentalDataResponse>('/analytics/environmental');
    return response.data.data;
  }
};