import { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import InsightsPanel from '@/components/features/insights/InsightsPanel';

export const metadata: Metadata = {
  title: 'Model Insights & XAI | SalesForecast',
  description: 'Evaluate machine learning model performance, feature importance, and prediction residuals.',
};

export default function InsightsPage() {
  return (
    <div className="flex flex-col space-y-6">
      <PageHeader 
        title="Model Insights (XAI)" 
        description="Understand model performance metrics, error distributions, and feature importance (Explainable AI)."
      />

      {/* The InsightsPanel handles the parallel data fetching for 
        performance metrics, the scatter plot, and the feature importance charts. 
      */}
      <InsightsPanel />
      
    </div>
  );
}