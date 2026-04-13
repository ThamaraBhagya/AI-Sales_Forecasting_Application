"""
Load and prepare Walmart dataset as the BASE
FIXED VERSION - All bugs corrected and modernized for enterprise ML
"""
import os
import pandas as pd
import numpy as np

def load_walmart_dataset():
    """
    Load Walmart sales dataset and standardize format
    """
    print("📦 Loading Walmart dataset...")
    
    # 🟢 UPGRADE: Localized random number generator (prevents global state bleeding)
    rng = np.random.default_rng(42)
    
    try:
        # Load Walmart data
        df = pd.read_csv('data/walmart/walmart_sales.csv')
        print(f"✓ Loaded Walmart data: {len(df):,} records")
        
        # Standardize column names
        column_mapping = {
            'Store': 'store_id',
            'Date': 'date',
            'Weekly_Sales': 'sales',
            'Holiday_Flag': 'is_holiday',
            'Temperature': 'temperature',
            'Fuel_Price': 'fuel_price',
            'CPI': 'cpi',
            'Unemployment': 'unemployment'
        }
        df = df.rename(columns=column_mapping)
        
        # Convert date
        df['date'] = pd.to_datetime(df['date'], dayfirst=True)
        
        # Fast vectorized string formatting
        df['store_id'] = "STORE_" + df['store_id'].astype(str).str.zfill(3)
        
        # Add missing columns that we'll need
        df['product_id'] = 'WALMART_PRODUCT'  # Walmart doesn't have product breakdown
        df['category'] = 'General Merchandise'
        
        # Extract date features
        df['year'] = df['date'].dt.year
        df['month'] = df['date'].dt.month
        df['day'] = df['date'].dt.day
        df['day_of_week'] = df['date'].dt.dayofweek
        df['day_of_year'] = df['date'].dt.dayofyear
        df['week_of_year'] = df['date'].dt.isocalendar().week
        df['quarter'] = df['date'].dt.quarter
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        df['is_month_start'] = df['date'].dt.is_month_start.astype(int)
        df['is_month_end'] = df['date'].dt.is_month_end.astype(int)
        
        # Prevent Data Leakage in rolling average - shift before rolling
        df = df.sort_values(['store_id', 'date'])
        df['sales_ma'] = df.groupby('store_id')['sales'].transform(
            lambda x: x.shift(1).rolling(4, min_periods=1).mean()
        )
        
        # Infer promotions from sales spikes
        df['promotion'] = ((df['sales'] > df['sales_ma'] * 1.2) & (df['is_holiday'] == 0)).astype(int)
        df = df.drop('sales_ma', axis=1)
        
        # Add discount (estimate based on promotion) using rng
        df['discount'] = np.where(df['promotion'] == 1, rng.uniform(0.1, 0.25, len(df)), 0)
        
        # Add price (estimate based on sales)
        df['base_price'] = df.groupby('store_id')['sales'].transform(lambda x: x.mean() / 100)
        df['price'] = df['base_price'] * (1 - df['discount'])
        
        # Add stock level (simulate) using rng
        df['stock_level'] = rng.integers(100, 1000, len(df))
        
        # Create STABLE store-level attributes
        unique_stores = df['store_id'].unique()
        n_stores = len(unique_stores)
        store_avg_sales = df.groupby('store_id')['sales'].mean()
        
        store_metadata = pd.DataFrame({
            'store_id': unique_stores,
            'avg_sales': store_avg_sales[unique_stores].values
        })
        
        # Assign stable attributes based on sales volume
        store_metadata['location_type'] = pd.cut(
            store_metadata['avg_sales'],
            bins=[0, store_avg_sales.quantile(0.33), store_avg_sales.quantile(0.66), float('inf')],
            labels=['Rural', 'Suburban', 'Urban']
        )
        
        store_metadata['store_size'] = pd.cut(
            store_metadata['avg_sales'],
            bins=[0, store_avg_sales.quantile(0.25), store_avg_sales.quantile(0.75), float('inf')],
            labels=['Small', 'Medium', 'Large']
        )
        
        # Region and Competition using rng
        regions = ['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West']
        store_metadata['region'] = rng.choice(regions, size=n_stores)
        store_metadata['competition_level'] = rng.uniform(0.3, 0.9, size=n_stores)
        
        # Merge back to main dataframe
        df = df.merge(
            store_metadata[['store_id', 'location_type', 'store_size', 'region', 'competition_level']],
            on='store_id',
            how='left'
        )
        
        print(f"\n✅ Walmart data prepared!")
        print(f"   Date range: {df['date'].min()} to {df['date'].max()}")
        print(f"   Stores: {df['store_id'].nunique()}")
        print(f"   Total records: {len(df):,}")
        
        return df
        
    except FileNotFoundError:
        print("❌ ERROR: Walmart dataset not found!")
        return None

def main():
    df = load_walmart_dataset()
    
    if df is not None:
        # Save prepared walmart data
        os.makedirs('data/processed', exist_ok=True)
        # 🟢 UPGRADE: Saving as Parquet!
        df.to_parquet('data/processed/walmart_prepared.parquet', index=False)
        
        print(f"\n💾 Saved to: data/processed/walmart_prepared.parquet")
        
        # Show sample
        print("\n📊 Sample data:")
        print(df.head(10))
        
        print("\n📈 Sales statistics:")
        print(df['sales'].describe())
        
        # Show store metadata
        print("\n🏪 Store Metadata (first 5 stores):")
        store_summary = df.groupby('store_id').agg({
            'region': 'first',
            'location_type': 'first',
            'store_size': 'first',
            'competition_level': 'first',
            'sales': 'mean'
        }).head(5)
        print(store_summary)

if __name__ == '__main__':
    main()