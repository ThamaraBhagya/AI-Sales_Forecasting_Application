/**
 * Shared Frontend Types
 * This file acts as the central hub for all TypeScript interfaces in the app.
 */

// 1. Re-export all API types so you can just import from '@/types'
export * from './api';

// ==========================================
// 2. UI & NAVIGATION TYPES
// ==========================================

export interface NavItem {
  title: string;
  href: string;
  icon: string; // Can be a string identifier for Lucide icons or an SVG path
  disabled?: boolean;
}

// ==========================================
// 3. FORM TYPES (For Simulator Dropdowns)
// ==========================================

export interface SelectOption {
  label: string;
  value: string | number;
}

// ==========================================
// 4. CHARTING & COMPONENT TYPES
// ==========================================

export interface ChartWrapperProps<T> {
  data: T[];
  title?: string;
  height?: number | string;
  isLoading?: boolean;
  isEmpty?: boolean;
}

// Standardized structure for the KPIs shown at the top of the dashboard
export interface KpiCardData {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
}