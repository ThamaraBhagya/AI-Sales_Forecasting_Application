'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { BrainCircuit, AlertCircle, Loader2 } from 'lucide-react';
import { modelsService } from '@/services/models';
import { ModelInsightsResponse } from '@/types/api';

export default function FeatureImportanceChart() {
  const [insights, setInsights] = useState<ModelInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        const data = await modelsService.getFeatureImportance();
        
        
        const sortedFeatures = data.top_features
          .sort((a, b) => b.importance - a.importance)
          .slice(0, 15);
          
        setInsights({
          ...data,
          top_features: sortedFeatures
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load feature importance');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

 
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-lg shadow-lg">
          <p className="font-medium text-slate-900 dark:text-white mb-1">{data.feature}</p>
          <p className="text-blue-600 dark:text-blue-400 font-mono">
            Importance: {(data.importance * 100).toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[500px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
            <BrainCircuit className="w-5 h-5 mr-2 text-blue-500" /> 
            Feature Importance (XAI)
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {insights?.model_type ? `Based on ${insights.model_type} weights` : 'Loading model weights...'}
          </p>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-950/50 z-10">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-slate-500">Extracting model weights...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <AlertCircle className="w-10 h-10 text-red-500 mb-2 opacity-50" />
            <p className="text-slate-600 dark:text-slate-400">Failed to load insights</p>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
        )}

        {insights && insights.top_features.length > 0 && !isLoading && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={insights.top_features}
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis 
                type="number" 
                tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} 
                stroke="#64748b"
                fontSize={12}
              />
              
              <YAxis 
                type="category" 
                dataKey="feature" 
                stroke="#64748b" 
                fontSize={12}
                width={120}
                tick={{ fill: '#64748b' }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
              <Bar 
                dataKey="importance" 
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                {insights.top_features.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index < 3 ? '#3b82f6' : '#94a3b8'} // Highlight top 3 features in Blue, rest in Slate
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}