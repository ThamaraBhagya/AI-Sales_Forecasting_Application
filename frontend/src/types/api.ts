/**
 * TypeScript Interfaces mapping to FastAPI Pydantic Schemas.
 * This ensures end-to-end type safety between Python and Next.js.
 */


export interface PredictionRequest {
  date: string; 
  store_id: string;
  product_id: string;
  category: string;
  location_type: string;
  store_size: string;
  region: string;
  price: number;
  base_price: number;
  discount: number; 
  promotion: number; 
  temperature: number;
  fuel_price: number;
  cpi: number;
  unemployment: number;
  stock_level: number;
  competition_level: number; 
}

export interface PredictionResponse {
  date: string;
  store_id: string;
  product_id: string;
  category: string;
  predicted_sales: number;
  model_used: string;
  prediction_timestamp: string;
}

export interface BatchPredictionRequest {
  predictions: PredictionRequest[];
}

export interface BatchPredictionResponse {
  predictions: PredictionResponse[];
  total_count: number;
  model_used: string;
}



export interface ModelInfo {
  model_type: string;
  model_path: string;
  n_features: number;
  feature_names: string[];
  loaded_at: string;
  status: string;
}

export interface HealthResponse {
  status: string;
  api_version: string;
  model_loaded: boolean;
  timestamp: string;
}



export interface TrendDataPoint {
  date: string;
  sales: number;
}

export interface CategorySales {
  category: string;
  sales: number;
}

export interface StoreSales {
  store_id: string;
  sales: number;
}

export interface RegionSales {
  region: string;
  sales: number;
}

export interface TrendResponse {
  data: TrendDataPoint[];
}

export interface CategorySalesResponse {
  data: CategorySales[];
}

export interface StoreSalesResponse {
  data: StoreSales[];
}

export interface RegionSalesResponse {
  data: RegionSales[];
}

export interface EnvironmentalDataResponse {
  
  data: Record<string, string | number>[];
}



export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface ModelInsightsResponse {
  model_type: string;
  top_features: FeatureImportance[];
}

export interface ScatterPoint {
  actual: number;
  predicted: number;
}

export interface ResidualBin {
  error_range: string;
  bin_center: number;
  count: number;
}

export interface ScatterResponse {
  data: ScatterPoint[];
}

export interface ResidualResponse {
  data: ResidualBin[];
}

export interface ModelMetricsResponse {
  
  data: Record<string, string | number>[];
}