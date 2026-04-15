/**
 * Custom React Hook for the Predictive Simulator
 * Manages the loading state, errors, and results for ML inference requests.
 */
import { useState } from 'react';
import { predictionsService } from '../services/predictions';
import { PredictionRequest, PredictionResponse } from '../types/api';

export const useSimulator = () => {
  // State to hold the successful prediction result
  const [result, setResult] = useState<PredictionResponse | null>(null);
  
  // State for the loading spinner on the submit button
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // State for any API errors (e.g., model offline)
  const [error, setError] = useState<string | null>(null);

  /**
   * Submits the form data to the FastAPI backend to get a prediction.
   * @param formData The inputs from your UI matching the PredictionRequest schema
   */
  const simulatePrediction = async (formData: PredictionRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prediction = await predictionsService.predictSales(formData);
      setResult(prediction);
      return prediction; // Return it so the component can use it immediately if needed
    } catch (err: any) {
      // Safely extract the error message from Axios or fallback to a default
      const errorMessage = err.response?.data?.detail || err.message || 'Prediction failed';
      setError(errorMessage);
      console.error('Simulation error:', err);
      throw err; // Re-throw so the UI can catch it and show a toast notification
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears the current prediction result and errors.
   * Useful for a "Reset" button on the form.
   */
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