'use client';

import React, { useState, useEffect } from 'react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell,
  Legend
} from 'recharts';
import { Target, Activity, Crosshair, AlertCircle, Loader2 } from 'lucide-react';
import { modelsService } from '@/services/models';
import { ScatterPoint, ResidualBin } from '@/types/api';
import FeatureImportanceChart from './FeatureImportanceChart';

export default function InsightsPanel() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [scatterData, setScatterData] = useState<ScatterPoint[]>([]);
  const [residualsData, setResidualsData] = useState<ResidualBin[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllInsights = async () => {
      try {
        setIsLoading(true);
        
        const [metricsRes, scatterRes, residualsRes] = await Promise.all([
          modelsService.getPerformanceMetrics(),
          modelsService.getScatterData(300), 
          modelsService.getResidualsData(15) 
        ]);

        setMetrics(metricsRes);
        setScatterData(scatterRes);
        setResidualsData(residualsRes);
      } catch (err: any) {
        setError(err.message || 'Failed to load model evaluation data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllInsights();
  }, []);

  
  const primaryModel = metrics.find(m => m.Model === 'LIGHTGBM') || metrics[0] || {};

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">Evaluating ML Models...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4 opacity-50" />
        <p className="text-slate-800 dark:text-slate-200 font-medium">Analysis Failed</p>
        <p className="text-slate-500 text-sm mt-1">{error}</p>
      </div>
    );
  }

  
  const maxVal = Math.max(
    ...scatterData.map(d => d.actual), 
    ...scatterData.map(d => d.predicted)
  );

  return (
    <div className="space-y-6">
      
     
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-4">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">R² Score (Accuracy)</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">
              {primaryModel['Test R²'] ? (Number(primaryModel['Test R²']) * 100).toFixed(2) + '%' : 'N/A'}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg mr-4">
            <Crosshair className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Mean Absolute Error (MAE)</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              ${primaryModel['Test MAE'] ? Number(primaryModel['Test MAE']).toFixed(2) : 'N/A'}
            </h4>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center">
          <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-lg mr-4">
            <Activity className="w-6 h-6 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Root Mean Squared Error</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
              ${primaryModel['Test RMSE'] ? Number(primaryModel['Test RMSE']).toFixed(2) : 'N/A'}
            </h4>
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
        
        
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">
            Error Comparison <span className="text-sm font-normal text-slate-500">(Lower is Better)</span>
          </h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="Model" stroke="#64748b" fontSize={12} tickMargin={10} />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  tickFormatter={(val) => `$${val >= 1000 ? (val/1000).toFixed(1) + 'k' : val}`} 
                />
                <RechartsTooltip 
                  cursor={{ fill: '#334155', opacity: 0.1 }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Bar dataKey="Test MAE" fill="#10b981" radius={[4, 4, 0, 0]} name="Mean Absolute Error (MAE)" maxBarSize={60} />
                <Bar dataKey="Test RMSE" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Root Mean Squared Error" maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Accuracy (R² Score) */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6">
            Predictive Accuracy <span className="text-sm font-normal text-slate-500">(Higher is Better)</span>
          </h3>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="Model" stroke="#64748b" fontSize={12} tickMargin={10} />
                
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12} 
                  domain={[0.85, 0.95]} 
                  tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} 
                />
                <RechartsTooltip 
                  cursor={{ fill: '#334155', opacity: 0.1 }}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '8px' }}
                  formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'Accuracy (R²)']}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Bar dataKey="Test R²" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Test Accuracy (R² Score)" maxBarSize={80} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

     
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        
        <FeatureImportanceChart />

       
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[500px]">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Error Distribution (Residuals)</h3>
            <p className="text-sm text-slate-500 mt-1">Normal distribution indicates an unbiased model.</p>
          </div>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={residualsData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis 
                  dataKey="bin_center" 
                  tickFormatter={(val) => `$${val}`}
                  stroke="#64748b" 
                  fontSize={12} 
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {residualsData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      
                      fill={Math.abs(entry.bin_center) < 100 ? '#10b981' : Math.abs(entry.bin_center) < 500 ? '#f59e0b' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      
      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-[500px] flex flex-col">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Actual vs. Predicted Sales</h3>
          <p className="text-sm text-slate-500 mt-1">Dots closer to the diagonal line represent highly accurate predictions.</p>
        </div>
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
              <XAxis 
                type="number" 
                dataKey="actual" 
                name="Actual Sales" 
                unit="$" 
                stroke="#64748b" 
                fontSize={12}
                domain={[0, maxVal * 1.05]} 
              />
              <YAxis 
                type="number" 
                dataKey="predicted" 
                name="Predicted Sales" 
                unit="$" 
                stroke="#64748b" 
                fontSize={12}
                domain={[0, maxVal * 1.05]}
              />
              <RechartsTooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Scatter name="Predictions" data={scatterData} fill="#3b82f6" fillOpacity={0.6} />
              
              
              <ReferenceLine 
                segment={[{ x: 0, y: 0 }, { x: maxVal, y: maxVal }]} 
                stroke="#ef4444" 
                strokeWidth={2} 
                strokeDasharray="5 5" 
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}