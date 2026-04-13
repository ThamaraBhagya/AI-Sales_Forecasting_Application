"""
FastAPI Application for Sales Forecasting
Production-grade API with model serving
"""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import uvicorn
import os

from schemas import (
    PredictionRequest, PredictionResponse,
    BatchPredictionRequest, BatchPredictionResponse,
    ModelInfo, HealthResponse
)
from utils.model_loader import ModelLoader
from utils.feature_engineer import InferenceFeatureEngineer
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs when the server starts
    try:
        model_loader.load_model()
        print("✅ Model loaded successfully")
    except Exception as e:
        print(f"⚠️ Warning: Could not load model on startup: {e}")
    yield
    # Anything down here runs when the server shuts down (clean up)

# Now attach it to your app like this:
app = FastAPI(
    title="Sales Forecasting API",
    description="Production ML API for retail sales forecasting",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan  # <--- Added this line
)


# CORS middleware (for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model loader
model_loader = ModelLoader()

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    try:
        model_loader.load_model()
        print("✅ Model loaded successfully")
    except Exception as e:
        print(f"⚠️ Warning: Could not load model on startup: {e}")

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "Sales Forecasting API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy" if model_loader.is_loaded() else "model not loaded",
        api_version="1.0.0",
        model_loaded=model_loader.is_loaded(),
        timestamp=datetime.now().isoformat()
    )

@app.get("/model/info", response_model=ModelInfo, tags=["Model"])
async def get_model_info():
    """Get loaded model information"""
    if not model_loader.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded"
        )
    
    model_data = model_loader.get_model()
    
    return ModelInfo(
        model_type=model_data['model_type'],
        model_path=model_loader.model_path,
        n_features=len(model_data['feature_cols']),
        feature_names=model_data['feature_cols'][:20],  # First 20 for brevity
        loaded_at=model_loader.loaded_at,
        status="loaded"
    )

@app.post("/predict", response_model=PredictionResponse, tags=["Predictions"])
async def predict_sales(request: PredictionRequest):
    """
    Make a single sales prediction
    """
    if not model_loader.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded. Please contact administrator."
        )
    
    try:
        # Get model and encoders
        model_data = model_loader.get_model()
        encoders = model_loader.get_encoders()
        
        # Engineer features
        feature_engineer = InferenceFeatureEngineer(encoders)
        features_df = feature_engineer.engineer_features(request.model_dump())
        
        # Select only the features the model expects
        model_features = model_data['feature_cols']
        
        # Add missing features with default value 0
        for col in model_features:
            if col not in features_df.columns:
                features_df[col] = 0
        
        # Select and order features correctly
        X = features_df[model_features]
        
        # Make prediction
        prediction = model_data['model'].predict(X)[0]
        
        # Return response
        return PredictionResponse(
            date=request.date,
            store_id=request.store_id,
            product_id=request.product_id,
            category=request.category,
            predicted_sales=float(max(0, prediction)),  # Ensure non-negative
            model_used=model_data['model_type'],
            prediction_timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed: {str(e)}"
        )

@app.post("/predict/batch", response_model=BatchPredictionResponse, tags=["Predictions"])
async def predict_sales_batch(request: BatchPredictionRequest):
    """
    Make batch predictions (up to 1000 at once)
    """
    if not model_loader.is_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model not loaded"
        )
    
    try:
        predictions = []
        
        for item in request.predictions:
            # Reuse single prediction logic
            result = await predict_sales(item)
            predictions.append(result)
        
        model_data = model_loader.get_model()
        
        return BatchPredictionResponse(
            predictions=predictions,
            total_count=len(predictions),
            model_used=model_data['model_type']
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch prediction failed: {str(e)}"
        )

@app.post("/model/reload", tags=["Model"])
async def reload_model():
    """
    Reload model from disk (useful after retraining)
    """
    try:
        model_loader.reload()
        return {
            "message": "Model reloaded successfully",
            "status": "success",
            "loaded_at": model_loader.loaded_at
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reload model: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )