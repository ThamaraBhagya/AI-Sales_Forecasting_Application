import { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import DataExplorer from '@/components/features/explorer/DataExplorer';

export const metadata: Metadata = {
  title: 'Data Explorer | SalesForecast',
  description: 'Analyze real historical sales data, trends, and store performance.',
};

export default function ExplorerPage() {
  return (
    <div className="flex flex-col space-y-6">
      {/* The PageHeader ensures standard typography and spacing across your app.
        You can pass a title and description. 
      */}
      <PageHeader 
        title="Data Explorer" 
        description="Interactive analytics dashboard powered by historical Parquet sales data."
      />

      {/* The DataExplorer component contains all the Recharts, 
        KPI cards, and custom data-fetching hooks.
      */}
      <DataExplorer />
      
    </div>
  );
}