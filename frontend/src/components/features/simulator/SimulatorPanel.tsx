'use client';

import React, { useState, useEffect } from 'react';
import { useSimulator } from '@/hooks/useSimulator';
import { PredictionRequest } from '@/types/api';
import { AlertCircle, BrainCircuit } from 'lucide-react';
import PredictionForm from './PredictionForm';

export default function SimulatorPanel() {
  const { result, isLoading, error, simulatePrediction, resetSimulation } = useSimulator();

  // Initialize with sensible defaults for a fast demo
  const [formData, setFormData] = useState<PredictionRequest>({
    date: new Date().toISOString().split('T')[0], // Today's date
    store_id: 'STORE_001',
    product_id: 'PROD_001',
    category: 'Electronics',
    location_type: 'Urban',
    store_size: 'Large',
    region: 'Northeast',
    base_price: 199.99,
    price: 199.99,
    discount: 0.0,
    promotion: 0,
    temperature: 72.0,
    fuel_price: 3.5,
    cpi: 215.0,
    unemployment: 5.0,
    stock_level: 500,
    competition_level: 0.5,
  });

  // Auto-calculate the final price whenever base_price or discount changes
  useEffect(() => {
    const calculatedPrice = formData.base_price * (1 - formData.discount);
    setFormData(prev => ({ ...prev, price: parseFloat(calculatedPrice.toFixed(2)) }));
  }, [formData.base_price, formData.discount]);

  // Handle standard input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: any = value;
    if (type === 'number' || type === 'range') {
      parsedValue = parseFloat(value);
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  // Handle the toggle for Promotion
  const handleTogglePromo = () => {
    setFormData(prev => ({ ...prev, promotion: prev.promotion === 1 ? 0 : 1 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await simulatePrediction(formData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT COLUMN: The Input Form */}
      <div className="lg:col-span-2 space-y-6">
        <PredictionForm 
          formData={formData}
          isLoading={isLoading}
          onChange={handleChange}
          onTogglePromo={handleTogglePromo}
          onSubmit={handleSubmit}
          onReset={resetSimulation}
        />
      </div>

      {/* RIGHT COLUMN: Results Panel (Sticky) */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 bg-slate-900 rounded-xl shadow-xl border border-slate-800 overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-slate-800 bg-slate-950/50">
            <h3 className="text-lg font-semibold text-white">Inference Engine</h3>
            <p className="text-sm text-slate-400 mt-1">LightGBM Regression Output</p>
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center relative">
            {error ? (
              <div className="text-center text-red-400">
                <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Inference Failed</p>
                <p className="text-xs mt-1 opacity-70">{error}</p>
              </div>
            ) : isLoading ? (
              <div className="text-center text-blue-400">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="animate-pulse">Engineering features...</p>
              </div>
            ) : result ? (
              <div className="text-center w-full animate-in fade-in zoom-in duration-300">
                <p className="text-sm text-slate-400 mb-2 uppercase tracking-wider">Forecasted Volume</p>
                
                {/* Glowing Result Number */}
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full"></div>
                  <h2 className="text-5xl font-bold text-white relative z-10 font-mono tracking-tight">
                    ${result.predicted_sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-4 text-left border-t border-slate-800 pt-6 w-full">
                  <div>
                    <p className="text-xs text-slate-500">Model Used</p>
                    <p className="text-sm text-slate-300 font-medium">{result.model_used}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Latency</p>
                    <p className="text-sm text-emerald-400 font-medium">{'<'} 45ms</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500">
                <BrainCircuit className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Awaiting parameters.</p>
                <p className="text-sm mt-1">Adjust inputs and click Predict.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}