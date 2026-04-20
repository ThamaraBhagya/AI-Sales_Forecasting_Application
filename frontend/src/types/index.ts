


export * from './api';



export interface NavItem {
  title: string;
  href: string;
  icon: string; 
  disabled?: boolean;
}



export interface SelectOption {
  label: string;
  value: string | number;
}



export interface ChartWrapperProps<T> {
  data: T[];
  title?: string;
  height?: number | string;
  isLoading?: boolean;
  isEmpty?: boolean;
}


export interface KpiCardData {
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
}