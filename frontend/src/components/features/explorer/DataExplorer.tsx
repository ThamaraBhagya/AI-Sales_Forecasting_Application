'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { Calendar, Store, Tag, TrendingUp, Loader2, Filter } from 'lucide-react';

import SalesChart from './SalesChart';
import { 
  useHistoricalTrends, 
  useSalesByCategory, 
  useTopStores, 
  useSalesByRegion 
} from '@/hooks/useAnalytics';

export default function DataExplorer() {
  // Global Filters State
  const [days, setDays] = useState<number>(90);
  const [storeId, setStoreId] = useState<string>('ALL');

  // Fetch Data using our Custom Hooks
  const { data: trendData, isLoading: trendLoading } = useHistoricalTrends(storeId, days);
  const { data: categoryData, isLoading: catLoading } = useSalesByCategory();
  const { data: storeData, isLoading: storeLoading } = useTopStores(10);
  const { data: regionData, isLoading: regionLoading } = useSalesByRegion();

  // Compute summary metrics for KPI cards
  const totalSales = useMemo(() => {
    return trendData.reduce((sum, item) => sum + item.sales, 0);
  }, [trendData]);

  const topCategory = useMemo(() => {
    if (!categoryData.length) return { category: 'N/A', sales: 0 };
    return categoryData.reduce((prev, current) => (prev.sales > current.sales) ? prev : current);
  }, [categoryData]);

  const isLoading = trendLoading || catLoading || storeLoading || regionLoading;

  // Formatting for currency tooltips
  const CurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 dark:text-white mb-1">{label}</p>
          <p className="text-blue-600 dark:text-blue-400 font-mono">
            ${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* FILTER CONTROLS */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center text-slate-700 dark:text-slate-300 font-medium">
          <Filter className="w-5 h-5 mr-2" /> Global Filters
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-slate-500">Store:</label>
            <select 
              value={storeId} 
              onChange={(e) => setStoreId(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="ALL">All Stores</option>
              {storeData.map(store => (
                <option key={store.store_id} value={store.store_id}>{store.store_id}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm text-slate-500">Timeframe:</label>
            <select 
              value={days} 
              onChange={(e) => setDays(Number(e.target.value))}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
              <option value={180}>Last 6 Months</option>
              <option value={365}>Last 1 Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Volume</h4>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : `$${(totalSales / 1000).toFixed(1)}k`}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Based on current filters</p>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Top Category</h4>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"><Tag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : topCategory.category || 'Loading'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Highest grossing product line</p>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Stores</h4>
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg"><Store className="w-5 h-5 text-violet-600 dark:text-violet-400" /></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : storeData.length}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Tracking locations</p>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">Days Analyzed</h4>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg"><Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" /></div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {days} Days
          </h2>
          <p className="text-xs text-slate-500 mt-1">Historical lookback period</p>
        </div>
      </div>

      {/* MAIN CHART */}
      <SalesChart data={trendData} isLoading={trendLoading} />

     
      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-[400px] flex flex-col">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">Top Performing Stores</h3>
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={storeData} margin={{ top: 5, right: 10, left: 20, bottom: 5 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis 
                type="number" 
                stroke="#64748b" 
                fontSize={12}
                tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`} 
              />
              <YAxis 
                type="category" 
                dataKey="store_id" 
                stroke="#64748b" 
                fontSize={12} 
                width={80}
              />
              <RechartsTooltip content={<CurrencyTooltip />} />
             
              <Bar dataKey="sales" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}