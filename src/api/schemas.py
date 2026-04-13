"""
Pydantic schemas for request/response validation
"""
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import date as date_type

class PredictionRequest(BaseModel):
    """Single prediction request"""
    date: date_type = Field(..., description="Prediction date")
    store_id: str = Field(..., description="Store ID (e.g., STORE_001)")
    product_id: str = Field(..., description="Product ID (e.g., PROD_001)")
    category: str = Field(..., description="Product category")
    location_type: str = Field(..., description="Store location type")
    store_size: str = Field(..., description="Store size")
    region: str = Field(..., description="Store region")
    
    # Pricing
    price: float = Field(..., gt=0, description="Product price")
    base_price: float = Field(..., gt=0, description="Base price")
    discount: float = Field(0.0, ge=0, le=1, description="Discount percentage (0-1)")
    
    # Promotion
    promotion: int = Field(0, ge=0, le=1, description="Promotion flag (0 or 1)")
    
    # External factors
    temperature: float = Field(..., description="Temperature (F)")
    fuel_price: float = Field(..., gt=0, description="Fuel price")
    cpi: float = Field(..., gt=0, description="Consumer Price Index")
    unemployment: float = Field(..., ge=0, description="Unemployment rate")
    
    # Other
    stock_level: int = Field(..., ge=0, description="Stock level")
    competition_level: float = Field(0.5, ge=0, le=1, description="Competition level (0-1)")
    
    @field_validator('store_id')
    @classmethod
    def validate_store_id(cls, v):
        if not v.startswith('STORE_'):
            raise ValueError('store_id must start with STORE_')
        return v
    
    @field_validator('product_id')
    @classmethod
    def validate_product_id(cls, v):
        if not v.startswith('PROD_'):
            raise ValueError('product_id must start with PROD_')
        return v
    
    @field_validator('category')
    @classmethod
    def validate_category(cls, v):
        valid_categories = ['Grocery', 'Electronics', 'Clothing', 'Home & Garden', 
                          'Health & Beauty', 'Sports', 'Toys', 'Automotive']
        if v not in valid_categories:
            raise ValueError(f'category must be one of {valid_categories}')
        return v
    
    @field_validator('location_type')
    @classmethod
    def validate_location_type(cls, v):
        valid_types = ['Rural', 'Suburban', 'Urban']
        if v not in valid_types:
            raise ValueError(f'location_type must be one of {valid_types}')
        return v
    
    @field_validator('store_size')
    @classmethod
    def validate_store_size(cls, v):
        valid_sizes = ['Small', 'Medium', 'Large']
        if v not in valid_sizes:
            raise ValueError(f'store_size must be one of {valid_sizes}')
        return v
    
    @field_validator('region')
    @classmethod
    def validate_region(cls, v):
        valid_regions = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']
        if v not in valid_regions:
            raise ValueError(f'region must be one of {valid_regions}')
        return v
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "date": "2024-04-15",
                    "store_id": "STORE_001",
                    "product_id": "PROD_001",
                    "category": "Electronics",
                    "location_type": "Urban",
                    "store_size": "Large",
                    "region": "Northeast",
                    "price": 49.99,
                    "base_price": 59.99,
                    "discount": 0.17,
                    "promotion": 1,
                    "temperature": 72.5,
                    "fuel_price": 3.45,
                    "cpi": 225.5,
                    "unemployment": 5.2,
                    "stock_level": 150,
                    "competition_level": 0.65
                }
            ]
        }
    }

class PredictionResponse(BaseModel):
    """Single prediction response"""
    date: date_type
    store_id: str
    product_id: str
    category: str
    predicted_sales: float
    model_used: str
    prediction_timestamp: str

class BatchPredictionRequest(BaseModel):
    """Batch prediction request"""
    predictions: List[PredictionRequest] = Field(..., min_length=1, max_length=1000)

class BatchPredictionResponse(BaseModel):
    """Batch prediction response"""
    predictions: List[PredictionResponse]
    total_count: int
    model_used: str

class ModelInfo(BaseModel):
    """Model information"""
    model_type: str
    model_path: str
    n_features: int
    feature_names: List[str]
    loaded_at: str
    status: str

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    api_version: str
    model_loaded: bool
    timestamp: str