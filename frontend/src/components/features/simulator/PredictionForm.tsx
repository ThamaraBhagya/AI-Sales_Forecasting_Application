'use client';

import React from 'react';
import { PredictionRequest } from '@/types/api';
import { Calculator, DollarSign, TrendingUp, AlertCircle, RefreshCcw } from 'lucide-react';


interface PredictionFormProps {
  formData: PredictionRequest;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onTogglePromo: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
}

export default function PredictionForm({
  formData,
  isLoading,
  onChange,
  onTogglePromo,
  onSubmit,
  onReset
}: PredictionFormProps) {
  return (
    <form onSubmit={onSubmit} className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-blue-500" /> Product & Pricing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select name="category" value={formData.category} onChange={onChange} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              {['Electronics', 'Grocery', 'Clothing', 'Home & Garden', 'Health & Beauty', 'Sports', 'Toys', 'Automotive'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Base Price ($)</label>
            <input type="number" name="base_price" step="0.01" min="1" value={formData.base_price} onChange={onChange} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Discount: {(formData.discount * 100).toFixed(0)}%
            </label>
            <input type="range" name="discount" min="0" max="0.9" step="0.05" value={formData.discount} onChange={onChange} className="w-full accent-blue-600" />
          </div>

          <div className="flex flex-col justify-center">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Active Promotion</label>
            <button type="button" onClick={onTogglePromo} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${formData.promotion === 1 ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.promotion === 1 ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
          <span className="text-sm text-slate-500 dark:text-slate-400">Final Computed Price: </span>
          <span className="font-mono font-medium text-slate-900 dark:text-white">${formData.price.toFixed(2)}</span>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800 mb-8" />

      
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" /> Store Context
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Store ID</label>
            <input type="text" name="store_id" value={formData.store_id} onChange={onChange} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Store Size</label>
            <select name="store_size" value={formData.store_size} onChange={onChange} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location</label>
            <select name="location_type" value={formData.location_type} onChange={onChange} className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option value="Urban">Urban</option>
              <option value="Suburban">Suburban</option>
              <option value="Rural">Rural</option>
            </select>
          </div>
        </div>
      </div>

      <hr className="border-slate-200 dark:border-slate-800 mb-8" />

      
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-orange-500" /> Macro Environment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Temperature (°F): {formData.temperature}</label>
            <input type="range" name="temperature" min="10" max="110" value={formData.temperature} onChange={onChange} className="w-full accent-orange-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Competition Intensity: {formData.competition_level}</label>
            <input type="range" name="competition_level" min="0" max="1" step="0.1" value={formData.competition_level} onChange={onChange} className="w-full accent-red-500" />
          </div>
        </div>
      </div>

      
      <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
        <button 
          type="button" 
          onClick={onReset}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-transparent hover:text-slate-900 mr-4 dark:text-slate-400 dark:hover:text-white"
        >
          Clear Results
        </button>
        <button 
          type="submit" 
          disabled={isLoading}
          className="flex items-center justify-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <><RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
          ) : (
            <><Calculator className="w-4 h-4 mr-2" /> Predict Sales</>
          )}
        </button>
      </div>
    </form>
  );
}