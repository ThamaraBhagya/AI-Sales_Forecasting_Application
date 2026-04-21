'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2, PieChart as PieChartIcon, Map } from 'lucide-react';
import { useSalesByCategory, useSalesByRegion } from '@/hooks/useAnalytics';


import BusinessInsights from '@/components/features/explorer/BusinessInsights';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b'];

export default function BusinessDashboard() {
  const { data: categoryData, isLoading: catLoading } = useSalesByCategory();
  const { data: regionData, isLoading: regionLoading } = useSalesByRegion();

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
      
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
            <PieChartIcon className="w-5 h-5 mr-2 text-blue-500" />
            Category Distribution
          </h3>
          <div className="flex-1 w-full relative">
            {catLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="sales"
                  nameKey="category"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CurrencyTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        
        <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-[400px] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
            <Map className="w-5 h-5 mr-2 text-blue-500" />
            Sales by Region
          </h3>
          <div className="flex-1 w-full relative">
            {regionLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            )}
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionData}
                  innerRadius={70} 
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="sales"
                  nameKey="region"
                  stroke="none"
                >
                  {regionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip content={<CurrencyTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      
      <BusinessInsights />

    </div>
  );
}