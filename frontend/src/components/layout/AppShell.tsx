'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const openSidebar = () => setIsMobileSidebarOpen(true);
  const closeSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <>
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 lg:z-50">
        <Sidebar />
      </div>

      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeSidebar}
            aria-hidden="true"
          />

          <div className="absolute inset-y-0 left-0 w-72 bg-slate-950 border-r border-slate-800">
            <div className="flex h-16 items-center justify-end px-4 border-b border-slate-800">
              <button
                type="button"
                onClick={closeSidebar}
                className="inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <span className="sr-only">Close sidebar</span>
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 lg:pl-72 w-full h-full">
        <Navbar onMenuClick={openSidebar} />

        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </>
  );
}
