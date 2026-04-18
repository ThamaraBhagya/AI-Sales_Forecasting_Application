"""
Model Training Pipeline
Trains XGBoost and LightGBM 
Includes true Time-Series splitting (Train/Val/Test) and feature importance
"""
import pandas as pd
import numpy as np
import mlflow
import mlflow.xgboost
import mlflow.lightgbm
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, mean_absolute_percentage_error
import xgboost as xgb
import lightgbm as lgb
import joblib
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

class SalesForecastTrainer:
    """
    Multi-model training pipeline 
    """
    
    def __init__(self, experiment_name='sales_forecasting', random_state=42):
        self.experiment_name = experiment_name
        self.random_state = random_state
        self.models = {}
        self.results = {}
        
        
        mlflow.set_experiment(experiment_name)
        
    def prepare_data(self, df, val_size=0.1, test_size=0.1):
        """
        Prepare Train/Val/Test split (STRICT DATE-BASED SPLIT)
        """
        print("\n📊 Preparing data...")
        
        # Define features to exclude from training
        exclude_cols = ['date', 'sales', 'store_id', 'product_id']
        feature_cols = [col for col in df.columns if col not in exclude_cols]
        print(f"   Total features: {len(feature_cols)}")
        
        # Split by unique dates, not by row indices
        unique_dates = df['date'].sort_values().unique()
        total_days = len(unique_dates)
        
        
        val_idx = int(total_days * (1 - (val_size + test_size)))
        test_idx = int(total_days * (1 - test_size))
        
        val_start_date = unique_dates[val_idx]
        test_start_date = unique_dates[test_idx]
        
        
        train = df[df['date'] < val_start_date]
        val = df[(df['date'] >= val_start_date) & (df['date'] < test_start_date)]
        test = df[df['date'] >= test_start_date]
        
        X_train, y_train = train[feature_cols], train['sales']
        X_val, y_val = val[feature_cols], val['sales']
        X_test, y_test = test[feature_cols], test['sales']
        
        print(f"   Train: {len(X_train):,} rows ({train['date'].min().date()} to {train['date'].max().date()})")
        print(f"   Val:   {len(X_val):,} rows ({val['date'].min().date()} to {val['date'].max().date()})")
        print(f"   Test:  {len(X_test):,} rows ({test['date'].min().date()} to {test['date'].max().date()})")
        
        return X_train, X_val, X_test, y_train, y_val, y_test, feature_cols
    
    def evaluate_model(self, y_true, y_pred, model_name):
        """Calculate comprehensive evaluation metrics"""
        metrics = {
            'mae': mean_absolute_error(y_true, y_pred),
            'rmse': np.sqrt(mean_squared_error(y_true, y_pred)),
            'r2': r2_score(y_true, y_pred),
            'mape': mean_absolute_percentage_error(y_true, y_pred) * 100
        }
        
        print(f"\n   {model_name} Metrics:")
        print(f"      MAE:  {metrics['mae']:.2f}")
        print(f"      RMSE: {metrics['rmse']:.2f}")
        print(f"      R²:   {metrics['r2']:.4f}")
        print(f"      MAPE: {metrics['mape']:.2f}%")
        
        return metrics
    
    def train_xgboost(self, X_train, X_val, X_test, y_train, y_val, y_test):
        """Train XGBoost model with MLflow tracking"""
        print("\n Training XGBoost...")
        
        with mlflow.start_run(run_name=f"XGBoost_{datetime.now().strftime('%Y%m%d_%H%M%S')}"):
            params = {
                'objective': 'reg:squarederror',
                'max_depth': 8,
                'learning_rate': 0.05,
                'n_estimators': 500,
                'subsample': 0.8,
                'colsample_bytree': 0.8,
                'min_child_weight': 3,
                'gamma': 0.1,
                'random_state': self.random_state,
                'n_jobs': -1,
                'tree_method': 'hist',
                'early_stopping_rounds': 50
            }
            
            mlflow.log_params(params)
            model = xgb.XGBRegressor(**params)
            
            
            model.fit(
                X_train, y_train,
                eval_set=[(X_val, y_val)],
                
                verbose=False
            )
            
            y_pred_train = model.predict(X_train)
            y_pred_test = model.predict(X_test)
            
            train_metrics = self.evaluate_model(y_train, y_pred_train, "XGBoost Train")
            test_metrics = self.evaluate_model(y_test, y_pred_test, "XGBoost Test (UNSEEN DATA)")
            
            for metric_name, value in test_metrics.items():
                mlflow.log_metric(f"test_{metric_name}", value)
            for metric_name, value in train_metrics.items():
                mlflow.log_metric(f"train_{metric_name}", value)
            
            mlflow.xgboost.log_model(model, "model")
            
            os.makedirs('models', exist_ok=True)
            model_path = 'models/xgboost_model.pkl'
            joblib.dump({
                'model': model,
                'feature_cols': X_train.columns.tolist(),
                'model_type': 'xgboost'
            }, model_path)
            mlflow.log_artifact(model_path)
            
            print(f"    XGBoost trained and saved to {model_path}")
            
            self.models['xgboost'] = model
            self.results['xgboost'] = {
                'train': train_metrics,
                'test': test_metrics,
                'predictions': y_pred_test
            }
            
            return model, test_metrics
    
    def train_lightgbm(self, X_train, X_val, X_test, y_train, y_val, y_test):
        """Train LightGBM model with MLflow tracking"""
        print("\n Training LightGBM...")
        
        with mlflow.start_run(run_name=f"LightGBM_{datetime.now().strftime('%Y%m%d_%H%M%S')}"):
            params = {
                'objective': 'regression',
                'metric': 'rmse',
                'boosting_type': 'gbdt',
                'max_depth': 8,
                'learning_rate': 0.05,
                'n_estimators': 500,
                'subsample': 0.8,
                'colsample_bytree': 0.8,
                'min_child_samples': 20,
                'reg_alpha': 0.1,
                'reg_lambda': 0.1,
                'random_state': self.random_state,
                'n_jobs': -1,
                'verbose': -1
            }
            
            mlflow.log_params(params)
            model = lgb.LGBMRegressor(**params)
            
            
            model.fit(
                X_train, y_train,
                eval_set=[(X_val, y_val)],
                callbacks=[lgb.early_stopping(50, verbose=False)]
            )
            
            y_pred_train = model.predict(X_train)
            y_pred_test = model.predict(X_test)
            
            train_metrics = self.evaluate_model(y_train, y_pred_train, "LightGBM Train")
            test_metrics = self.evaluate_model(y_test, y_pred_test, "LightGBM Test (UNSEEN DATA)")
            
            for metric_name, value in test_metrics.items():
                mlflow.log_metric(f"test_{metric_name}", value)
            for metric_name, value in train_metrics.items():
                mlflow.log_metric(f"train_{metric_name}", value)
            
            mlflow.lightgbm.log_model(model, "model")
            
            model_path = 'models/lightgbm_model.pkl'
            joblib.dump({
                'model': model,
                'feature_cols': X_train.columns.tolist(),
                'model_type': 'lightgbm'
            }, model_path)
            mlflow.log_artifact(model_path)
            
            print(f"    LightGBM trained and saved to {model_path}")
            
            self.models['lightgbm'] = model
            self.results['lightgbm'] = {
                'train': train_metrics,
                'test': test_metrics,
                'predictions': y_pred_test
            }
            
            return model, test_metrics
    
    def create_comparison_report(self):
        """Create comprehensive model comparison report"""
        print("\n Creating Model Comparison Report...")
        
        comparison = []
        for model_name, results in self.results.items():
            comparison.append({
                'Model': model_name.upper(),
                'Train MAE': results['train']['mae'],
                'Test MAE': results['test']['mae'],
                'Train RMSE': results['train']['rmse'],
                'Test RMSE': results['test']['rmse'],
                'Train R²': results['train']['r2'],
                'Test R²': results['test']['r2'],
                'Test MAPE': results['test']['mape']
            })
        
        comparison_df = pd.DataFrame(comparison)
        
        os.makedirs('models/reports', exist_ok=True)
        comparison_df.to_csv('models/reports/model_comparison.csv', index=False)
        
        print("\n" + "=" * 80)
        print("MODEL COMPARISON REPORT")
        print("=" * 80)
        print(comparison_df.to_string(index=False))
        print("=" * 80)
        
        best_model = comparison_df.loc[comparison_df['Test RMSE'].idxmin(), 'Model']
        print(f"\n🏆 BEST MODEL: {best_model} (Lowest Test RMSE)")
        
        return comparison_df, best_model
    
    def save_feature_importance(self, model, model_name, feature_cols):
        """Save feature importance to CSV"""
        print(f"\n Extracting feature importance for {model_name}...")
        
        if hasattr(model, 'feature_importances_'):
            importance = model.feature_importances_
            
            importance_df = pd.DataFrame({
                'feature': feature_cols,
                'importance': importance
            }).sort_values('importance', ascending=False)
            
            importance_path = f'models/reports/{model_name}_feature_importance.csv'
            importance_df.to_csv(importance_path, index=False)
            
            print(f"    Feature importance saved to {importance_path}")
            print(f"\n   🔝 Top 10 Features:")
            print(importance_df.head(10).to_string(index=False))
            
            return importance_df
        else:
            print(f"    Model {model_name} doesn't support feature importance")
            return None
    
    def train_all(self, df):
        """Train all models and create comparison"""
        print("\n" + "=" * 80)
        print("STARTING MULTI-MODEL TRAINING PIPELINE")
        print("=" * 80)
        
        # Prepare data with Train/Val/Test
        X_train, X_val, X_test, y_train, y_val, y_test, feature_cols = self.prepare_data(df)
        
        # Pass all splits to models
        xgb_model, xgb_metrics = self.train_xgboost(X_train, X_val, X_test, y_train, y_val, y_test)
        lgb_model, lgb_metrics = self.train_lightgbm(X_train, X_val, X_test, y_train, y_val, y_test)
        
        comparison_df, best_model = self.create_comparison_report()
        
        self.save_feature_importance(xgb_model, 'xgboost', feature_cols)
        self.save_feature_importance(lgb_model, 'lightgbm', feature_cols)
        
        predictions_df = pd.DataFrame({
            'actual': y_test.values,
            'xgboost': self.results['xgboost']['predictions'],
            'lightgbm': self.results['lightgbm']['predictions']
        })
        predictions_df.to_csv('models/reports/test_predictions.csv', index=False)
        
        print("\n" + "=" * 80)
        print(" TRAINING COMPLETE!")
        print("=" * 80)
        print(f" Models saved in: models/")
        print(f" Reports saved in: models/reports/")
        print(f" MLflow UI: Run 'mlflow ui' to view experiments")
        
        return comparison_df, best_model

def main():
    print("\n Sales Forecasting Model Training Pipeline")
    print("=" * 80)
    
    print("\n Loading featured data...")
    df = pd.read_parquet('data/processed/sales_featured.parquet')
    print(f"✓ Loaded {len(df):,} records with {len(df.columns)} features")
    
    trainer = SalesForecastTrainer(
        experiment_name='sales_forecasting_production',
        random_state=42
    )
    
    comparison_df, best_model = trainer.train_all(df)
    print(f"The absolute best model was: {best_model}")
    
    print("\n✨ Next steps:")
    print("   1. Run: mlflow ui")
    print("   2. Open: http://localhost:5000")
    print("   3. View all experiments and compare models")

if __name__ == '__main__':
    main()