"""
Feature engineering for real-time predictions
"""
import pandas as pd
import numpy as np
from datetime import datetime

class InferenceFeatureEngineer:
    """
    Create features for inference (without historical data)
    """
    
    def __init__(self, encoders):
        self.encoders = encoders
    
    def engineer_features(self, request_data):
        """
        Create all features needed for prediction
        
        Note: In production, lag/rolling features would come from a database
        For demo purposes, we set them to reasonable defaults
        """
        # Convert request to DataFrame
        df = pd.DataFrame([request_data])
        df['date'] = pd.to_datetime(df['date'])
        
        # === DATE FEATURES ===
        df['year'] = df['date'].dt.year
        df['month'] = df['date'].dt.month
        df['day'] = df['date'].dt.day
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_year'] = df['date'].dt.dayofyear
        df['week_of_year'] = df['date'].dt.isocalendar().week
        df['quarter'] = df['date'].dt.quarter
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(np.int8)
        df['day_of_month'] = df['date'].dt.day
        df['is_month_start'] = df['date'].dt.is_month_start.astype(np.int8)
        df['is_month_end'] = df['date'].dt.is_month_end.astype(np.int8)
        df['is_quarter_start'] = df['date'].dt.is_quarter_start.astype(np.int8)
        df['is_quarter_end'] = df['date'].dt.is_quarter_end.astype(np.int8)
        df['is_year_start'] = df['date'].dt.is_year_start.astype(np.int8)
        df['is_year_end'] = df['date'].dt.is_year_end.astype(np.int8)
        df['days_to_month_end'] = df['date'].dt.days_in_month - df['date'].dt.day
        
        # SMART LAG FEATURES 
        
        
        base_multiplier = 3.0
        
        # Store Size Impact
        size = request_data.get('store_size', 'Medium')
        if size == 'Large': 
            base_multiplier *= 2.0
        elif size == 'Small': 
            base_multiplier *= 0.3
            
        # Location Impact
        loc = request_data.get('location_type', 'Urban')
        if loc == 'Urban': 
            base_multiplier *= 1.5
        elif loc == 'Rural': 
            base_multiplier *= 0.6
            
        # Competition Impact (0.0 to 1.0)
        # Higher competition reduces historical volume
        comp = request_data.get('competition_level', 0.5)
        base_multiplier *= (1.8 - comp) 
        
        # Calculate dynamic historical average
        avg_sales = request_data.get('price', 50) * base_multiplier
        
        df['sales_lag_1'] = avg_sales * np.random.uniform(0.9, 1.1)
        df['sales_lag_7'] = avg_sales * np.random.uniform(0.85, 1.15)
        df['sales_lag_14'] = avg_sales * np.random.uniform(0.8, 1.2)
        df['sales_lag_28'] = avg_sales * np.random.uniform(0.75, 1.25)
        
        # === ROLLING FEATURES ===
        for window in [7, 14, 28]:
            df[f'sales_rolling_mean_{window}'] = avg_sales * np.random.uniform(0.9, 1.1)
            df[f'sales_rolling_std_{window}'] = avg_sales * 0.15
            df[f'sales_rolling_min_{window}'] = avg_sales * 0.5
            df[f'sales_rolling_max_{window}'] = avg_sales * 1.5
            
        # === EXPANDING FEATURES ===
        df['sales_expanding_mean'] = avg_sales
        df['sales_expanding_std'] = avg_sales * 0.2
        
        # === DIFFERENCE FEATURES ===
        df['sales_diff_1'] = avg_sales * 0.05
        df['sales_diff_7'] = avg_sales * 0.1
        df['sales_pct_change_1'] = 0.05
        
        # === CYCLIC FEATURES ===
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12).astype(np.float32)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12).astype(np.float32)
        df['dow_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7).astype(np.float32)
        df['dow_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7).astype(np.float32)
        df['doy_sin'] = np.sin(2 * np.pi * df['day_of_year'] / 365).astype(np.float32)
        df['doy_cos'] = np.cos(2 * np.pi * df['day_of_year'] / 365).astype(np.float32)
        
        # === INTERACTION FEATURES ===
        df['is_holiday'] = 0  # Would come from request in production
        df['promo_holiday_interaction'] = (df['promotion'] * df['is_holiday']).astype(np.int8)
        df['weekend_promo_interaction'] = (df['is_weekend'] * df['promotion']).astype(np.int8)
        
        # Temperature category
        temp = request_data.get('temperature', 70)
        if temp < 32:
            temp_cat = 'freezing'
        elif temp < 60:
            temp_cat = 'cold'
        elif temp < 80:
            temp_cat = 'mild'
        else:
            temp_cat = 'hot'
        
        df['temp_category'] = temp_cat
        df['discount_depth'] = (df['base_price'] - df['price']).astype(np.float32)
        
        # === ENCODE CATEGORICALS ===
        for col, mapping in self.encoders.items():
            if col in df.columns:
                df[f'{col}_encoded'] = df[col].map(mapping).fillna(0).astype(int)
        
        return df