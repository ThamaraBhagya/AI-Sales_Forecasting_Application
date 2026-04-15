'use client';

import { Menu } from 'lucide-react';

type NavbarProps = {
  onMenuClick?: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-slate-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:bg-slate-950 dark:border-slate-800">
      
      {/* Mobile Menu Button - Hidden on desktop screens */}
      <button 
        type="button" 
        className="-m-2.5 p-2.5 text-slate-700 lg:hidden hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Vertical separator for mobile */}
      <div className="h-6 w-px bg-slate-200 lg:hidden dark:bg-slate-800" aria-hidden="true" />

      
    </header>
  );
}