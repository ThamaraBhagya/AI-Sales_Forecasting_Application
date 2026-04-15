import Link from 'next/link';
import { 
  ArrowRight, 
  BarChart3, 
  BrainCircuit, 
  LineChart, 
  Server, 
  Database, 
  Cpu 
} from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';

export default function HomePage() {
  return (
    <div className="flex flex-col space-y-8 max-w-6xl mx-auto pb-10">
      
      {/* Welcome Banner */}
      <div className="bg-blue-600 rounded-2xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 text-blue-500 opacity-20 pointer-events-none">
          <BrainCircuit className="w-96 h-96" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            SalesForecast AI Pipeline
          </h1>
          <p className="text-lg text-blue-100 mb-8 leading-relaxed">
            An end-to-end machine learning system integrating real-time inference, 
            explainable AI (XAI), and high-performance data analytics.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/simulator" 
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
            >
              Launch Simulator <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Core Modules Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">System Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link href="/explorer" className="group block bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all hover:border-sky-400 dark:hover:border-sky-500">
            <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Data Explorer</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Interactive analytics dashboard parsing historical Parquet datasets to uncover sales trends, category distribution, and store performance.
            </p>
          </Link>

          <Link href="/simulator" className="group block bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all hover:border-violet-400 dark:hover:border-violet-500">
            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Predictive Simulator</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Real-time inference engine utilizing LightGBM. Adjust pricing, discounts, and macro-economic factors to forecast sales volume.
            </p>
          </Link>

          <Link href="/insights" className="group block bg-white dark:bg-slate-950 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all hover:border-emerald-400 dark:hover:border-emerald-500">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <LineChart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Model Insights</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Deep dive into Explainable AI (XAI). Review feature importance, residual distributions, and actual vs. predicted performance metrics.
            </p>
          </Link>

        </div>
      </div>

      {/* Architecture Section */}
      <div className="mt-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Technical Architecture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex items-start">
            <Server className="w-8 h-8 text-slate-400 mr-4 shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">FastAPI Backend</h4>
              <p className="text-sm text-slate-500 mt-1">High-performance async Python server managing API routes and model serving.</p>
            </div>
          </div>
          <div className="flex items-start">
            <Cpu className="w-8 h-8 text-slate-400 mr-4 shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Machine Learning</h4>
              <p className="text-sm text-slate-500 mt-1">Scikit-learn and LightGBM models serialized with Joblib for sub-50ms inference.</p>
            </div>
          </div>
          <div className="flex items-start">
            <Database className="w-8 h-8 text-slate-400 mr-4 shrink-0" />
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white">Data Processing</h4>
              <p className="text-sm text-slate-500 mt-1">Pandas optimized with Parquet file formats for rapid analytical queries.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}