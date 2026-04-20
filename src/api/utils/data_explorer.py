"""
Data Explorer Utility
Reads directly from processed Parquet files and ML report CSVs
to serve real data to the Next.js frontend dashboard.
"""
import pandas as pd
import numpy as np
from pathlib import Path
from typing import List, Dict, Optional

class DataExplorer:
    def __init__(self):
       
        self.base_path = Path(__file__).resolve().parents[3]
        
        # File Paths
        self.featured_path = self.base_path / "data" / "processed" / "sales_featured.parquet"
        self.enhanced_path = self.base_path / "data" / "processed" / "walmart_enhanced.parquet"
        self.metrics_path = self.base_path / "models" / "reports" / "model_comparison.csv"
        self.test_preds_path = self.base_path / "models" / "reports" / "test_predictions.csv"

    
    # HISTORICAL DATA ANALYTICS (Parquet)
    

    def get_historical_trends(self, store_id: Optional[str] = None, days: int = 90) -> List[Dict]:
        """Sales Trends Over Time"""
        if not self.featured_path.exists():
            return []
            
        
        df = pd.read_parquet(self.featured_path, columns=['date', 'sales', 'store_id'])
        df['date'] = pd.to_datetime(df['date'])
        
        if store_id and store_id.upper() != "ALL":
            df = df[df['store_id'] == store_id]
            
        
        daily_sales = df.groupby('date')['sales'].sum().reset_index()
        daily_sales = daily_sales.sort_values('date', ascending=False).head(days)
        daily_sales = daily_sales.sort_values('date', ascending=True) 
        
        
        result = []
        for _, row in daily_sales.iterrows():
            result.append({
                "date": row['date'].strftime('%Y-%m-%d'),
                "sales": round(float(row['sales']), 2)
            })
        return result

    def get_sales_by_category(self):
        
        df = pd.read_parquet(self.featured_path, columns=['category_encoded', 'sales'])
        
        # Group by the encoded category
        category_sales = df.groupby('category_encoded')['sales'].sum().reset_index()
        
        
        category_map = {
            0: "Grocery", 
            1: "Electronics", 
            2: "Clothing", 
            3: "Home & Garden", 
            4: "Health & Beauty",
            5: "Sports",
            6: "Toys",
            7: "Automotive"
        }

        category_sales['category'] = category_sales['category_encoded'].map(category_map).fillna("Other")
        
        
        result = category_sales[['category', 'sales']].to_dict(orient='records')
        return result

    def get_sales_by_store(self, top_n: int = 10) -> List[Dict]:
        """Sales by Store (Top Performing)"""
        if not self.featured_path.exists():
            return []
            
        df = pd.read_parquet(self.featured_path, columns=['store_id', 'sales'])
        store_sales = df.groupby('store_id')['sales'].sum().reset_index()
        store_sales = store_sales.sort_values('sales', ascending=False).head(top_n)
        
        return store_sales.to_dict(orient='records')

    def get_sales_by_region(self):
        df = pd.read_parquet(self.featured_path, columns=['region_encoded', 'sales'])
        region_sales = df.groupby('region_encoded')['sales'].sum().reset_index()
        
        
        region_map = {
            0: 'Northeast', 
            1: 'Southeast', 
            2: 'Midwest',
            3: 'Southwest', 
            4: 'West'
        }
        region_sales['region'] = region_sales['region_encoded'].map(region_map).fillna("Unknown")
        
        result = region_sales[['region', 'sales']].to_dict(orient='records')
        return result

    def get_environmental_impact(self, sample_size: int = 1000) -> List[Dict]:
        """Temperature & Fuel vs Sales (Using enhanced parquet)"""
        if not self.enhanced_path.exists():
            return []
            
        
        cols = ['sales', 'Temperature', 'Fuel_Price', 'IsHoliday']
        
        try:
            df = pd.read_parquet(self.enhanced_path, columns=cols)
            if len(df) > sample_size:
                df = df.sample(n=sample_size, random_state=42)
            return df.to_dict(orient='records')
        except Exception as e:
            print(f"Warning mapping environmental data: {e}")
            return []

    def get_seasonal_patterns(self) -> List[Dict]:
        """ Average Sales by Month to show Seasonality"""
        if not self.featured_path.exists():
            return []
            
        
        df = pd.read_parquet(self.featured_path, columns=['date', 'sales'])
        df['date'] = pd.to_datetime(df['date'])
        df['month'] = df['date'].dt.month
        
        
        seasonal = df.groupby('month')['sales'].mean().reset_index()
        
        month_map = {1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
                     7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'}
        
        result = []
        for _, row in seasonal.iterrows():
            result.append({
                "month": month_map[int(row['month'])],
                "avg_sales": round(float(row['sales']), 2)
            })
        return result

    def get_promotion_effectiveness(self) -> Dict:
        """ Promotion vs Non-Promotion Sales Lift"""
        if not self.featured_path.exists():
            return {}
            
        df = pd.read_parquet(self.featured_path, columns=['promotion', 'sales'])
        
        
        promo_stats = df.groupby('promotion')['sales'].mean().reset_index()
        
        try:
            base_sales = float(promo_stats[promo_stats['promotion'] == 0]['sales'].iloc[0])
            promo_sales = float(promo_stats[promo_stats['promotion'] == 1]['sales'].iloc[0])
            
            # Calculate the percentage lift
            lift_percentage = ((promo_sales - base_sales) / base_sales) * 100
        except IndexError:
            base_sales, promo_sales, lift_percentage = 0, 0, 0
            
        return {
            "base_avg_sales": round(base_sales, 2),
            "promo_avg_sales": round(promo_sales, 2),
            "lift_percentage": round(lift_percentage, 1),
            "chart_data": [
                {"status": "Regular Price", "sales": round(base_sales, 2)},
                {"status": "On Promotion", "sales": round(promo_sales, 2)}
            ]
        }

    
    # MODEL PERFORMANCE (CSV Reports)
    

    def get_model_metrics(self) -> List[Dict]:
        """ Model Comparison Dashboard (MAE, RMSE, R2)"""
        if not self.metrics_path.exists():
            return []
            
        df = pd.read_csv(self.metrics_path)
        
        return df.to_dict(orient='records')

    def get_actual_vs_predicted(self, sample_size: int = 500) -> List[Dict]:
        """ Actual vs Predicted Scatter Plot"""
        if not self.test_preds_path.exists():
            return []
            
        
        try:
            df = pd.read_csv(self.test_preds_path, usecols=['actual', 'predicted'])
        except ValueError:
            
            df = pd.read_csv(self.test_preds_path)
            
        # Rename to standard keys if necessary
        cols = df.columns.tolist()
        actual_col = 'actual' if 'actual' in cols else cols[0]
        pred_col = 'predicted' if 'predicted' in cols else cols[1]

        if len(df) > sample_size:
            df = df.sample(n=sample_size, random_state=42)
            
        result = []
        for _, row in df.iterrows():
            result.append({
                "actual": round(float(row[actual_col]), 2),
                "predicted": round(float(row[pred_col]), 2)
            })
        return result

    def get_error_distribution(self, bins: int = 20) -> List[Dict]:
        """ Error Distribution (Residuals) for Histogram"""
        if not self.test_preds_path.exists():
            return []
            
        try:
            df = pd.read_csv(self.test_preds_path, usecols=['actual', 'predicted'])
        except ValueError:
            df = pd.read_csv(self.test_preds_path)
            
        cols = df.columns.tolist()
        actual_col = 'actual' if 'actual' in cols else cols[0]
        pred_col = 'predicted' if 'predicted' in cols else cols[1]

        
        df['error'] = df[actual_col] - df[pred_col]
        
        
        counts, bin_edges = np.histogram(df['error'].dropna(), bins=bins)
        
        
        distribution = []
        for i in range(len(counts)):
            bin_center = (bin_edges[i] + bin_edges[i+1]) / 2
            distribution.append({
                "error_range": f"{round(bin_edges[i], 2)} to {round(bin_edges[i+1], 2)}",
                "bin_center": round(bin_center, 2),
                "count": int(counts[i])
            })
            
        return distribution