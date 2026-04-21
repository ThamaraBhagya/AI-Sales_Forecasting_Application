/**
 * Custom React Hooks for Analytics Data
 * These hooks manage the loading states, error handling, and data fetching
 *  UI components can remain clean and focused on rendering charts.
 */
import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analytics';
import { 
  TrendDataPoint, 
  CategorySales, 
  StoreSales, 
  RegionSales 
} from '../types/api';


export const useHistoricalTrends = (storeId?: string, days: number = 90) => {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await analyticsService.getHistoricalTrends(storeId, days);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch trend data');
        console.error('Trend fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storeId, days]);

  return { data, isLoading, error };
};


export const useSalesByCategory = () => {
  const [data, setData] = useState<CategorySales[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await analyticsService.getSalesByCategory();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch category data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); 

  return { data, isLoading, error };
};


export const useTopStores = (top: number = 10) => {
  const [data, setData] = useState<StoreSales[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await analyticsService.getTopStores(top);
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch store data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [top]);

  return { data, isLoading, error };
};


export const useSalesByRegion = () => {
  const [data, setData] = useState<RegionSales[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await analyticsService.getSalesByRegion();
        setData(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch region data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
};