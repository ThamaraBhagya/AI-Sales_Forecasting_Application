import { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import BusinessDashboard from '@/components/features/business/BusinessDashboard';

export const metadata: Metadata = {
  title: 'Business Insights | SalesForecast',
  description: 'Analyze category distribution, regional performance, and marketing ROI.',
};

export default function BusinessPage() {
  return (
    <div className="flex flex-col space-y-6">
      <PageHeader 
        title="Business Insights" 
        description="Strategic overview of category distribution, regional performance, seasonality, and promotion ROI."
      />

      <BusinessDashboard />
      
    </div>
  );
}