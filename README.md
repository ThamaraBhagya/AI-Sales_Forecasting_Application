# Sales Forecasting Platform

End-to-end retail sales forecasting system with:
- A FastAPI inference and analytics backend
- A feature engineering + model training pipeline (XGBoost, LightGBM)
- A Next.js dashboard for business analytics, model insights, and what-if simulation

This repository is designed to demonstrate production-style ML application architecture: data preparation, model training, model serving, and interactive decision support.

## 1. Project Highlights

- Problem: forecast weekly Walmart sales at the store level from historical demand, promotions, calendar effects, and store metadata
- Approach: tree-based regression forecasting with XGBoost and LightGBM, using lag, rolling, expanding, cyclic, and interaction features
- Validation: strict date-based train/validation/test split to avoid leakage
- Result: LightGBM achieved the best test score in the current run with RMSE 6,216.45, MAE 3,919.32, and MAPE 18.00%

## 2. Technical Overview

### Core capabilities
- Historical sales analytics by trends, categories, stores, regions, seasonality, and promotions
- Real-time single and batch weekly store-level forecasting using a trained LightGBM model
- Model evaluation views (performance metrics, residuals, scatter, feature importance)
- Synthetic product-level enrichment on top of Walmart sales data to support richer simulation inputs

### Architecture (high level)
- Data layer: raw and processed parquet/csv artifacts in data and models reports
- ML pipeline layer: dataset loading, synthetic enrichment, feature engineering, training, and error analysis
- Serving layer: FastAPI app with model loader + inference feature engineering + analytics explorer
- Presentation layer: Next.js frontend with typed API services and feature-specific pages/components

## 3. Tech Stack

### Backend and ML
- Python
- FastAPI + Uvicorn
- Pandas, NumPy, SciPy
- scikit-learn, XGBoost, LightGBM, Prophet, statsmodels
- MLflow + joblib

### Frontend
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- Axios for API client
- Recharts for visualizations
- React Hook Form + Zod
- Radix UI/shadcn component primitives

## 4. Repository Layout

- src/api: FastAPI application, schemas, model/data utility services
- src/data: ingestion, synthetic enhancement, and feature engineering scripts
- src/models: model training and error analysis scripts
- data/raw, data/processed, data/walmart: source and intermediate datasets
- models/reports: model comparison, feature importance, prediction exports, charts
- frontend/src/app: route pages (home, explorer, insights, simulator, business)
- frontend/src/components: layout, feature modules, reusable UI
- frontend/src/services: typed API integration layer
- frontend/src/hooks: data-fetching and simulator state hooks

## 5. Data and Model Pipeline

Run scripts from repository root in this order:

1. Load/normalize Walmart data
- python src/data/load_walmart.py

2. Add product-level synthetic enrichment
- python src/data/enhance_walmart_with_synthetic.py

3. Build temporal/statistical features
- python src/data/feature_engineering.py

4. Train models and persist artifacts
- python src/models/train_models.py

5. Generate residual/scatter/comparison diagnostics
- python src/models/error_analysis.py

### Pipeline outputs
- data/processed/sales_featured.parquet
- models/lightgbm_model.pkl (primary inference model)
- models/xgboost_model.pkl
- models/reports/model_comparison.csv
- models/reports/test_predictions.csv
- models/reports/*_feature_importance.csv
- models/reports/charts/*.png

### Pages
- /: solution overview and module navigation
- /explorer: historical sales exploration and KPI views
- /insights: model performance and explainability dashboards
- /simulator: what-if prediction simulator
- /business: business-facing strategic insights

## 6. Local Setup and Run

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### Backend setup
1. Create and activate a virtual environment
2. Install dependencies
- pip install -r requirements.txt

3. Start API server
- python -m uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload

Backend docs:
- Open http://localhost:8000/docs

### Frontend setup
1. Install dependencies
- cd frontend
- npm install

2. Optional environment configuration
- Set NEXT_PUBLIC_API_URL=http://localhost:8000

3. Start development server
- npm run dev

4. Build and run production frontend
- npm run build
- npm run start

Default frontend URL:
- http://localhost:3000

