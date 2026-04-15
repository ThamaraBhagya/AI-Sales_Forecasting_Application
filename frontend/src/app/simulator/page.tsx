import { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import SimulatorPanel from '@/components/features/simulator/SimulatorPanel';

export const metadata: Metadata = {
  title: 'Predictive Simulator | SalesForecast',
  description: 'Run real-time sales predictions using the LightGBM machine learning model.',
};

export default function SimulatorPage() {
  return (
    <div className="flex flex-col space-y-6">
      <PageHeader 
        title="Predictive Simulator" 
        description="Adjust market parameters to simulate sales outcomes using the live LightGBM inference engine."
      />

      {/* The SimulatorPanel handles all the complex form state, 
        API calls, and dynamic UI transitions. 
      */}
      <SimulatorPanel />
      
    </div>
  );
}