/**
 * Custom React Hook for the Predictive Simulator
 * Manages the loading state, errors, and results for ML inference requests.
 */
import { useState } from 'react';
import { predictionsService } from '../services/predictions';
import { PredictionRequest, PredictionResponse } from '../types/api';

export const useSimulator = () => {
 
  const [result, setResult] = useState<PredictionResponse | null>(null);
  
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const [error, setError] = useState<string | null>(null);

  
  const simulatePrediction = async (formData: PredictionRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prediction = await predictionsService.predictSales(formData);
      setResult(prediction);
      return prediction; 
    } catch (err: any) {
      
      const errorMessage = err.response?.data?.detail || err.message || 'Prediction failed';
      setError(errorMessage);
      console.error('Simulation error:', err);
      throw err; 
    } finally {
      setIsLoading(false);
    }
  };

  
  const resetSimulation = () => {
    setResult(null);
    setError(null);
  };

  return {
    result,
    isLoading,
    error,
    simulatePrediction,
    resetSimulation
  };
};