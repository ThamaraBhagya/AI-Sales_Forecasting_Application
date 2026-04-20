"""
FastAPI Application for Sales Forecasting

"""
from pathlib import Path
import sys
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn
from contextlib import asynccontextmanager


if __package__ is None or __package__ == "":
    sys.path.insert(0, str(Path(__file__).resolve().parents[2]))


from src.api.schemas import (
    PredictionRequest, PredictionResponse,
    BatchPredictionRequest, BatchPredictionResponse,
    ModelInfo, HealthResponse,
    ModelInsightsResponse,HistoricalDataResponse
)


from src.api.utils.model_loader import ModelLoader
from src.api.utils.feature_engineer import InferenceFeatureEngineer
from src.api.utils.data_explorer import DataExplorer


model_loader = ModelLoader()
data_explorer = DataExplorer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    
    try:
        model_loader.load_model()
        print(" Backend Systems Online: ML Model Ready")
        print(" Data Explorer connected to Parquet/CSV storage")
    except Exception as e:
        print(f" Startup Warning: {e}")
    yield
    


app = FastAPI(
    title="Sales Forecasting API",
    description="Production ML API for retail sales forecasting and analytics",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# SYSTEM / HEALTH ENDPOINTS


@app.get("/", tags=["Root"])
async def root():
    return {"message": "Sales Forecasting API Version 2.0", "docs": "/docs"}

@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy" if model_loader.is_loaded() else "model offline",
        api_version="2.0.0",
        model_loaded=model_loader.is_loaded(),
        timestamp=datetime.now().isoformat()
    )


# ANALYTICS ENDPOINTS 


@app.get("/analytics/trends", tags=["Analytics Dashboard"])
async def get_historical_trends(
    store_id: Optional[str] = Query(None, description="Filter by specific STORE_ID or leave blank for all"),
    days: int = Query(90, description="Number of past days to fetch")
):
    """Returns REAL historical sales trends over time"""
    data = data_explorer.get_historical_trends(store_id, days)
    if not data:
        raise HTTPException(status_code=404, detail="No trend data found")
    return {"data": data}

@app.get("/analytics/categories", tags=["Analytics Dashboard"])
async def get_sales_by_category():
    """Returns REAL sales grouped by category"""
    return {"data": data_explorer.get_sales_by_category()}

@app.get("/analytics/stores", tags=["Analytics Dashboard"])
async def get_sales_by_store(top: int = 10):
    """Returns REAL sales for the top performing stores"""
    return {"data": data_explorer.get_sales_by_store(top_n=top)}

@app.get("/analytics/regions", tags=["Analytics Dashboard"])
async def get_sales_by_region():
    """Returns REAL sales grouped by region"""
    return {"data": data_explorer.get_sales_by_region()}

@app.get("/analytics/environmental", tags=["Analytics Dashboard"])
async def get_environmental_impact():
    """Returns REAL data showing correlation between Temp/Fuel and Sales"""
    return {"data": data_explorer.get_environmental_impact()}
@app.get("/analytics/seasonal", tags=["Analytics Dashboard"])
async def get_seasonal_patterns():
    """Returns REAL seasonal sales patterns by month"""
    return {"data": data_explorer.get_seasonal_patterns()}

@app.get("/analytics/promotions", tags=["Analytics Dashboard"])
async def get_promotion_effectiveness():
    """Returns REAL promotion effectiveness and revenue lift"""
    return {"data": data_explorer.get_promotion_effectiveness()}

#  MODEL PERFORMANCE ENDPOINTS 


@app.get("/model/performance", tags=["Model Evaluation"])
async def get_model_performance():
    """Returns REAL model metrics & comparison (XGBoost vs LightGBM)"""
    return {"data": data_explorer.get_model_metrics()}

@app.get("/model/scatter", tags=["Model Evaluation"])
async def get_prediction_scatter(sample_size: int = 500):
    """Returns REAL Actual vs Predicted data points for scatter charts"""
    return {"data": data_explorer.get_actual_vs_predicted(sample_size)}

@app.get("/model/residuals", tags=["Model Evaluation"])
async def get_error_distribution(bins: int = 20):
    """Returns REAL error distribution (residuals) for histograms"""
    return {"data": data_explorer.get_error_distribution(bins)}

@app.get("/model/feature-importance", response_model=ModelInsightsResponse, tags=["Model Evaluation"])
async def get_feature_importance():
    """Returns Feature Importance directly from the loaded ML Model"""
    if not model_loader.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded")
        
    importances = model_loader.get_feature_importance()
    model_data = model_loader.get_model()
    
    return ModelInsightsResponse(
        model_type=model_data['model_type'],
        top_features=importances[:20]  
    )

@app.get("/model/info", response_model=ModelInfo, tags=["Model Evaluation"])
async def get_model_info():
    """Get loaded model architecture information"""
    if not model_loader.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded")
    model_data = model_loader.get_model()
    return ModelInfo(
        model_type=model_data['model_type'],
        model_path=model_loader.model_path,
        n_features=len(model_data['feature_cols']),
        feature_names=model_data['feature_cols'][:20],
        loaded_at=model_loader.loaded_at,
        status="loaded"
    )

@app.post("/model/reload", tags=["Model Evaluation"])
async def reload_model():
    """Reload model from disk after retraining"""
    try:
        model_loader.reload()
        return {"status": "success", "loaded_at": model_loader.loaded_at}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


#  PREDICTION SIMULATOR 


@app.post("/predict", response_model=PredictionResponse, tags=["Inference Simulator"])
async def predict_sales(request: PredictionRequest):
    """Make a single real-time sales prediction based on user inputs"""
    if not model_loader.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        model_data = model_loader.get_model()
        encoders = model_loader.get_encoders()
        
        feature_engineer = InferenceFeatureEngineer(encoders)
        features_df = feature_engineer.engineer_features(request.model_dump())
        
        
        model_features = model_data['feature_cols']
        for col in model_features:
            if col not in features_df.columns:
                features_df[col] = 0
                
        X = features_df[model_features]
        prediction = model_data['model'].predict(X)[0]
        
        return PredictionResponse(
            date=request.date,
            store_id=request.store_id,
            product_id=request.product_id,
            category=request.category,
            predicted_sales=float(max(0, prediction)),
            model_used=model_data['model_type'],
            prediction_timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict/batch", response_model=BatchPredictionResponse, tags=["Inference Simulator"])
async def predict_sales_batch(request: BatchPredictionRequest):
    """Make batch predictions for what-if scenario planning"""
    if not model_loader.is_loaded():
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        predictions = []
        for item in request.predictions:
            result = await predict_sales(item)
            predictions.append(result)
            
        model_data = model_loader.get_model()
        return BatchPredictionResponse(
            predictions=predictions,
            total_count=len(predictions),
            model_used=model_data['model_type']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "src.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )