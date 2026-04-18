"""
Feature Engineering
Creates lag features, rolling statistics, and advanced features

"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import os

class SalesFeatureEngineer:
    """
    Advanced feature engineering for sales forecasting
    """
    
    def __init__(self):
        self.label_encoders = {}
        
    def reduce_memory_usage(self, df):
        
        print("Optimizing memory usage...")
        start_mem = df.memory_usage().sum() / 1024**2
        
        for col in df.columns:
            col_type = df[col].dtype
            if col_type != object and col_type.name != 'category' and not np.issubdtype(col_type, np.datetime64):
                c_min = df[col].min()
                c_max = df[col].max()
                if str(col_type)[:3] == 'int':
                    if c_min > np.iinfo(np.int8).min and c_max < np.iinfo(np.int8).max:
                        df[col] = df[col].astype(np.int8)
                    elif c_min > np.iinfo(np.int16).min and c_max < np.iinfo(np.int16).max:
                        df[col] = df[col].astype(np.int16)
                    elif c_min > np.iinfo(np.int32).min and c_max < np.iinfo(np.int32).max:
                        df[col] = df[col].astype(np.int32)
                else:
                    df[col] = df[col].astype(np.float32) # Downcast floats to float32
                    
        end_mem = df.memory_usage().sum() / 1024**2
        print(f"   Memory reduced from {start_mem:.1f} MB to {end_mem:.1f} MB (Decreased by {100 * (start_mem - end_mem) / start_mem:.1f}%)")
        return df

    def create_lag_features(self, df, lags=[1, 7, 14, 28]):
        """
        Create lag features (sales from previous periods)
        
        """
        print("Creating lag features...")
        grouped = df.groupby(['store_id', 'product_id'])['sales']
        
        for lag in lags:
            df[f'sales_lag_{lag}'] = grouped.shift(lag)
            print(f"   Created lag_{lag}")
            
        return df
    
    def create_rolling_features(self, df, windows=[7, 14, 28]):
        """
        Rolling statistics (moving averages, std)
        
        """
        print("Creating rolling features...")
        
        
        grouped = df.groupby(['store_id', 'product_id'])['sales']
        
        for window in windows:
           
            df[f'sales_rolling_mean_{window}'] = grouped.transform(lambda x: x.shift(1).rolling(window, min_periods=1).mean())
            df[f'sales_rolling_std_{window}']  = grouped.transform(lambda x: x.shift(1).rolling(window, min_periods=1).std())
            df[f'sales_rolling_min_{window}']  = grouped.transform(lambda x: x.shift(1).rolling(window, min_periods=1).min())
            df[f'sales_rolling_max_{window}']  = grouped.transform(lambda x: x.shift(1).rolling(window, min_periods=1).max())
            
            print(f"  ✓ Created rolling_{window}")
            
        return df
    
    def create_expansion_features(self, df):
        """
        Expanding window features (cumulative statistics)
        
        """
        print("Creating expanding features...")
        grouped = df.groupby(['store_id', 'product_id'])['sales']
        
        df['sales_expanding_mean'] = grouped.transform(lambda x: x.shift(1).expanding(min_periods=1).mean())
        df['sales_expanding_std']  = grouped.transform(lambda x: x.shift(1).expanding(min_periods=1).std())
        
        print("   Created expanding features")
        return df
    
    def create_diff_features(self, df):
        """
        Difference features (change from previous period)
        
        """
        print("Creating difference features...")
        grouped = df.groupby(['store_id', 'product_id'])['sales']
        
        # Difference between yesterday and the day before yesterday
        df['sales_diff_1'] = grouped.transform(lambda x: x.shift(1).diff(1))
        df['sales_diff_7'] = grouped.transform(lambda x: x.shift(1).diff(7))
        df['sales_pct_change_1'] = grouped.transform(lambda x: x.shift(1).pct_change(1))
        
        print("   Created difference features")
        return df
    
    def create_date_features(self, df):
        """Extract date-based features"""
        print("Creating date features...")
        
        df['day_of_month'] = df['date'].dt.day
        if 'is_month_start' not in df.columns:
            df['is_month_start'] = df['date'].dt.is_month_start.astype(np.int8)
        if 'is_month_end' not in df.columns:
            df['is_month_end'] = df['date'].dt.is_month_end.astype(np.int8)
            
        df['is_quarter_start'] = df['date'].dt.is_quarter_start.astype(np.int8)
        df['is_quarter_end'] = df['date'].dt.is_quarter_end.astype(np.int8)
        df['is_year_start'] = df['date'].dt.is_year_start.astype(np.int8)
        df['is_year_end'] = df['date'].dt.is_year_end.astype(np.int8)
        df['days_to_month_end'] = df['date'].dt.days_in_month - df['date'].dt.day
        
        print("   Created date features")
        return df
    
    def create_cyclic_features(self, df):
        """Cyclic encoding for periodic features"""
        print("Creating cyclic features...")
        
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12).astype(np.float32)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12).astype(np.float32)
        df['dow_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7).astype(np.float32)
        df['dow_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7).astype(np.float32)
        
        print("   Created cyclic features")
        return df
    
    def create_interaction_features(self, df):
        """Interaction features between important variables"""
        print("Creating interaction features...")
        
        df['promo_holiday_interaction'] = (df['promotion'] * df['is_holiday']).astype(np.int8)
        df['weekend_promo_interaction'] = (df['is_weekend'] * df['promotion']).astype(np.int8)
        
        df['temp_category'] = pd.cut(
            df['temperature'], 
            bins=[-np.inf, 32, 60, 80, np.inf],
            labels=['freezing', 'cold', 'mild', 'hot']
        )
        
        df['discount_depth'] = (df['base_price'] - df['price']).astype(np.float32)
        
        print("   Created interaction features")
        return df
    
    def encode_categorical(self, df, categorical_cols):
        """Label encode categorical variables"""
        print("Encoding categorical features...")
        
        for col in categorical_cols:
            if col not in self.label_encoders:
                self.label_encoders[col] = LabelEncoder()
                df[f'{col}_encoded'] = self.label_encoders[col].fit_transform(df[col].astype(str))
            else:
                df[f'{col}_encoded'] = self.label_encoders[col].transform(df[col].astype(str))
            
            
            if col != 'store_id' and col != 'product_id':  
                df = df.drop(columns=[col])
                
            print(f"  ✓ Encoded {col}")
            
        return df
    
    def process(self, df):
        """Complete feature engineering pipeline"""
        print("\n Starting Feature Engineering Pipeline...")
        print("=" * 60)
        
        # Sort data once at the very beginning (Crucial for time-series)
        df = df.sort_values(['store_id', 'product_id', 'date']).reset_index(drop=True)
        
        df = self.create_date_features(df)
        df = self.create_lag_features(df)
        df = self.create_rolling_features(df)
        df = self.create_expansion_features(df)
        df = self.create_diff_features(df)
        df = self.create_cyclic_features(df)
        df = self.create_interaction_features(df)
        
        categorical_cols = ['category', 'location_type', 'store_size', 'region', 'temp_category']
        df = self.encode_categorical(df, categorical_cols)
        
        
        df = self.reduce_memory_usage(df)
        
        initial_rows = len(df)
        df = df.dropna()
        dropped_rows = initial_rows - len(df)
        
        print("=" * 60)
        print(f" Feature Engineering Complete!")
        print(f"  Initial rows: {initial_rows:,}")
        print(f"  Dropped rows (NaN): {dropped_rows:,}")
        print(f"  Final rows: {len(df):,}")
        print(f"  Total features: {len(df.columns)}")
        
        return df

def main():
    print(" Loading data...")
    df = pd.read_parquet('data/processed/walmart_enhanced.parquet')
    df['date'] = pd.to_datetime(df['date'])
    print(f"✓ Loaded {len(df):,} records")
    
    engineer = SalesFeatureEngineer()
    df_processed = engineer.process(df)
    
    os.makedirs('data/processed', exist_ok=True)
    df_processed.to_parquet('data/processed/sales_featured.parquet', index=False)
    
    print(f"\n💾 Saved to: data/processed/sales_featured.parquet")

if __name__ == '__main__':
    main()