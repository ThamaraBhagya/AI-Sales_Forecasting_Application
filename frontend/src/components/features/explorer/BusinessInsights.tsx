'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Sparkles, TrendingUp, CalendarDays, Loader2 } from 'lucide-react';

export default function BusinessInsights() {
  const [seasonalData, setSeasonalData] = useState<any[]>([]);
  const [promoData, setPromoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const [seasonalRes, promoRes] = await Promise.all([
          axios.get('http://localhost:8000/analytics/seasonal'),
          axios.get('http://localhost:8000/analytics/promotions')
        ]);
        setSeasonalData(seasonalRes.data.data);
        setPromoData(promoRes.data.data);
      } catch (error) {
        console.error("Failed to fetch business insights", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const CurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-lg text-white">
          <p className="font-medium mb-1">{label}</p>
          <p className="text-emerald-400 font-mono">
            Avg: ${Number(payload[0].value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading || !promoData) {
    return <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      
      {/* SEASONAL PATTERNS */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-[400px] flex flex-col lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2 flex items-center">
          <CalendarDays className="w-5 h-5 mr-2 text-blue-500" />
          Annual Seasonal Patterns
        </h3>
        <p className="text-sm text-slate-500 mb-4">Average monthly sales volume across all recorded years.</p>
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={seasonalData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
              <RechartsTooltip content={<CurrencyTooltip />} />
              <Area type="monotone" dataKey="avg_sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PROMOTION EFFECTIVENESS */}
      <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-[400px] flex flex-col relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
        
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-6 flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-emerald-500" />
          Promotion Effectiveness
        </h3>
        
        {/* KPI Lift Metric */}
        <div className="mb-6 flex items-baseline space-x-2">
          <h2 className="text-5xl font-bold text-emerald-500">+{promoData.lift_percentage}%</h2>
          <span className="text-slate-500 font-medium">Revenue Lift</span>
        </div>
        
        <div className="flex-1 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={promoData.chart_data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
              <XAxis dataKey="status" stroke="#64748b" fontSize={12} />
              <RechartsTooltip cursor={{ fill: '#334155', opacity: 0.1 }} content={<CurrencyTooltip />} />
              <Bar dataKey="sales" radius={[6, 6, 0, 0]} maxBarSize={80}>
                {promoData.chart_data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#94a3b8' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}