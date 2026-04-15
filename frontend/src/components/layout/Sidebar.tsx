'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  BrainCircuit, 
  Briefcase, 
  LineChart, 
  Store 
} from 'lucide-react';
// Assuming you have the standard shadcn utils file. If not, you can replace cn() with template literals.
import { cn } from '@/lib/utils'; 

// Define the navigation items connecting to your page routes
const routes = [
  {
    label: 'Data Explorer',
    icon: BarChart3,
    href: '/explorer',
    color: 'text-sky-400',
  },
  {
    label: 'Predictive Simulator',
    icon: BrainCircuit,
    href: '/simulator',
    color: 'text-violet-400',
  },
  {
    label: 'Model Insights',
    icon: LineChart,
    href: '/insights',
    color: 'text-emerald-400',
  },
  {
    label: 'Business Insights',
    icon: Briefcase,
    href: '/business',
    color: 'text-yellow-400',
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-slate-950 text-white border-r border-slate-800">
      <div className="px-3 py-2 flex-1">
        {/* Logo and App Title */}
        <Link href="/explorer" className="flex items-center pl-3 mb-10 transition hover:opacity-80">
          <div className="relative h-8 w-8 mr-4 bg-blue-600 rounded-lg flex items-center justify-center">
            <Store className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            Sales<span className="text-blue-500">Forecast</span>
          </h1>
        </Link>
        
        {/* Navigation Links */}
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors",
                // Highlight the active route
                pathname === route.href ? "text-white bg-slate-800" : "text-slate-400"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      
      {/* Footer System Status */}
      <div className="px-6 py-4 mt-auto border-t border-slate-800">
        <div className="flex items-center gap-x-2 text-xs text-slate-400">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <p>API Systems Online</p>
        </div>
      </div>
    </div>
  );
}