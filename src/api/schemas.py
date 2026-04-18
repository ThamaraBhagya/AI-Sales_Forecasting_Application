"""
Pydantic Schemas for Data Validation and API Documentation
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Dict, Any
from datetime import date as date_type


# PREDICTION SCHEMAS (The Simulator)


class PredictionRequest(BaseModel):
    date: date_type = Field(..., description="Prediction date")
    store_id: str = Field(..., description="Store ID (e.g., STORE_001)")
    product_id: str = Field(..., description="Product ID (e.g., PROD_001)")
    category: str = Field(..., description="Product category")
    location_type: str = Field(..., description="Store location type")
    store_size: str = Field(..., description="Store size")
    region: str = Field(..., description="Store region")
    price: float = Field(..., gt=0, description="Product price")
    base_price: float = Field(..., gt=0, description="Base price")
    discount: float = Field(0.0, ge=0, le=1, description="Discount percentage (0-1)")
    promotion: int = Field(0, ge=0, le=1, description="Promotion flag (0 or 1)")
    temperature: float = Field(..., description="Temperature (F)")
    fuel_price: float = Field(..., gt=0, description="Fuel price")
    cpi: float = Field(..., gt=0, description="Consumer Price Index")
    unemployment: float = Field(..., ge=0, description="Unemployment rate")
    stock_level: int = Field(..., ge=0, description="Stock level")
    competition_level: float = Field(0.5, ge=0, le=1, description="Competition level (0-1)")

    @field_validator('store_id')
    @classmethod
    def validate_store_id(cls, v):
        if not v.startswith('STORE_'): raise ValueError('store_id must start with STORE_')
        return v
    
    @field_validator('product_id')
    @classmethod
    def validate_product_id(cls, v):
        if not v.startswith('PROD_'): raise ValueError('product_id must start with PROD_')
        return v

class PredictionResponse(BaseModel):
    date: date_type
    store_id: str
    product_id: str
    category: str
    predicted_sales: float
    model_used: str
    prediction_timestamp: str

class BatchPredictionRequest(BaseModel):
    predictions: List[PredictionRequest] = Field(..., min_length=1, max_length=1000)

class BatchPredictionResponse(BaseModel):
    predictions: List[PredictionResponse]
    total_count: int
    model_used: str


# SYSTEM SCHEMAS


class ModelInfo(BaseModel):
    model_type: str
    model_path: str
    n_features: int
    feature_names: List[str]
    loaded_at: str
    status: str

class HealthResponse(BaseModel):
    status: str
    api_version: str
    model_loaded: bool
    timestamp: str


# ANALYTICS SCHEMAS (Real Historical Data)


class TrendDataPoint(BaseModel):
    date: str
    sales: float

class HistoricalDataResponse(BaseModel):
    data: List[TrendDataPoint]

class CategorySales(BaseModel):
    category: str
    sales: float

class StoreSales(BaseModel):
    store_id: str
    sales: float

class RegionSales(BaseModel):
    region: str
    sales: float


class EnvironmentalDataResponse(BaseModel):
    data: List[Dict[str, Any]]


# MODEL EVALUATION SCHEMAS (Real Metrics)


class FeatureImportance(BaseModel):
    feature: str
    importance: float

class ModelInsightsResponse(BaseModel):
    model_type: str
    top_features: List[FeatureImportance]

class ScatterPoint(BaseModel):
    actual: float
    predicted: float

class ResidualBin(BaseModel):
    error_range: str
    bin_center: float
    count: int


# WRAPPER SCHEMAS (For clean JSON responses)


class TrendResponse(BaseModel):
    data: List[TrendDataPoint]

class CategorySalesResponse(BaseModel):
    data: List[CategorySales]

class StoreSalesResponse(BaseModel):
    data: List[StoreSales]

class RegionSalesResponse(BaseModel):
    data: List[RegionSales]

class ScatterResponse(BaseModel):
    data: List[ScatterPoint]

class ResidualResponse(BaseModel):
    data: List[ResidualBin]

class ModelMetricsResponse(BaseModel):
    data: List[Dict[str, Any]] 