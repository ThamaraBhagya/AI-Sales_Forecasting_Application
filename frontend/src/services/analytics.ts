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
  /**
   * Fetches historical sales trends over time.
   * @param storeId Optional filter for a specific store (e.g., 'STORE_001')
   * @param days Number of past days to fetch (defaults to 90)
   */
  getHistoricalTrends: async (storeId?: string, days: number = 90) => {
    // If storeId is "ALL" or empty, we don't send it as a parameter
    const params: Record<string, any> = { days };
    if (storeId && storeId !== 'ALL') {
      params.store_id = storeId;
    }

    const response = await apiClient.get<TrendResponse>('/analytics/trends', { params });
    return response.data.data; // Return just the array for easy charting
  },

  /**
   * Fetches sales distribution across different product categories.
   */
  getSalesByCategory: async () => {
    const response = await apiClient.get<CategorySalesResponse>('/analytics/categories');
    return response.data.data;
  },

  /**
   * Fetches the top performing stores by total sales volume.
   * @param top Number of stores to return (defaults to 10)
   */
  getTopStores: async (top: number = 10) => {
    const response = await apiClient.get<StoreSalesResponse>('/analytics/stores', {
      params: { top }
    });
    return response.data.data;
  },

  /**
   * Fetches total sales grouped by geographical region.
   */
  getSalesByRegion: async () => {
    const response = await apiClient.get<RegionSalesResponse>('/analytics/regions');
    return response.data.data;
  },

  /**
   * Fetches environmental data (Temperature, Fuel Price) correlated with Sales.
   * Used for scatter plots and deeper business insights.
   */
  getEnvironmentalImpact: async () => {
    const response = await apiClient.get<EnvironmentalDataResponse>('/analytics/environmental');
    return response.data.data;
  }
};