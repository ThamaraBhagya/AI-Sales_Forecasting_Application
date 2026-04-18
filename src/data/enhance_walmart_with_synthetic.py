"""
ENHANCE Walmart dataset by adding product-level detail using realistic synthetic data
Strategy: Take real Walmart store sales and break them down into realistic product categories
"""
import pandas as pd
import numpy as np
import os

class WalmartDataEnhancer:
    """
    Enhance Walmart data with product-level breakdown and realistic patterns
    """
    
    def __init__(self, n_products_per_store=50, seed=42):
        self.n_products_per_store = n_products_per_store
        
       
        self.rng = np.random.default_rng(seed)
        
        
        self.categories = {
            'Grocery': {'weight': 0.35, 'avg_price': 25, 'margin': 0.15},
            'Electronics': {'weight': 0.15, 'avg_price': 150, 'margin': 0.25},
            'Clothing': {'weight': 0.12, 'avg_price': 35, 'margin': 0.40},
            'Home & Garden': {'weight': 0.10, 'avg_price': 45, 'margin': 0.30},
            'Health & Beauty': {'weight': 0.08, 'avg_price': 20, 'margin': 0.35},
            'Sports': {'weight': 0.08, 'avg_price': 40, 'margin': 0.30},
            'Toys': {'weight': 0.07, 'avg_price': 30, 'margin': 0.35},
            'Automotive': {'weight': 0.05, 'avg_price': 50, 'margin': 0.25}
        }
    
    def create_product_catalog(self):
        """
        Create realistic product catalog
        """
        products = []
        product_id = 1
        
        for category, props in self.categories.items():
            n_products = int(self.n_products_per_store * props['weight'])
            
            for _ in range(n_products):
                products.append({
                    'product_id': f'PROD_{str(product_id).zfill(3)}',
                    'category': category,
                    'base_price': props['avg_price'] * self.rng.uniform(0.5, 2.0),
                    'margin': props['margin'],
                    'seasonality_strength': self.rng.uniform(0.1, 0.8),
                    'promotion_elasticity': self.rng.uniform(1.2, 3.0)
                })
                product_id += 1
        
        return pd.DataFrame(products)
    
    def distribute_store_sales_to_products(self, walmart_row, products_df):
        """
        Take a Walmart store-level weekly sales record and distribute it across products
        using realistic patterns (Fully Vectorized)
        """
        
        total_sales = walmart_row.sales
        month = walmart_row.month
        
        
        n_products_in_store = self.rng.integers(40, len(products_df) + 1)
        store_products = products_df.sample(n_products_in_store, random_state=self.rng).copy()
        
        
        store_products['weight'] = store_products['category'].map(
            lambda x: self.categories[x]['weight']
        )
        
        
        store_products['weight'] *= self.rng.uniform(0.7, 1.3, len(store_products))
        
        
        seasonal_boosts = {
            'Toys': {11: 2.5, 12: 3.0},  
            'Electronics': {11: 2.0, 12: 2.5},
            'Clothing': {3: 1.5, 9: 1.5},  
            'Sports': {5: 1.5, 6: 1.5, 7: 1.5},  
            'Home & Garden': {4: 1.8, 5: 2.0},  
        }
        
        boost_map = {cat: boosts.get(month, 1.0) for cat, boosts in seasonal_boosts.items()}
        store_products['weight'] *= store_products['category'].map(boost_map).fillna(1.0)
        
        
        if walmart_row.is_holiday == 1:
            store_products['weight'] *= 1.5
            
        
        if walmart_row.promotion == 1:
            promo_products = self.rng.choice(len(store_products), size=int(len(store_products) * 0.3), replace=False)
            store_products.iloc[promo_products, store_products.columns.get_loc('weight')] *= 2.0
            
        
        store_products['weight'] = store_products['weight'] / store_products['weight'].sum()
        store_products['sales'] = store_products['weight'] * total_sales
        
        # Vectorized Record Creation (Massive speed boost over row-by-row dict building)
        store_products['date'] = walmart_row.date
        store_products['store_id'] = walmart_row.store_id
        store_products['temperature'] = walmart_row.temperature
        store_products['fuel_price'] = walmart_row.fuel_price
        store_products['cpi'] = walmart_row.cpi
        store_products['unemployment'] = walmart_row.unemployment
        store_products['is_holiday'] = walmart_row.is_holiday
        store_products['location_type'] = walmart_row.location_type
        store_products['store_size'] = walmart_row.store_size
        store_products['region'] = walmart_row.region
        store_products['competition_level'] = walmart_row.competition_level
        
        
        has_promotion_mask = (self.rng.random(len(store_products)) < 0.2) | (walmart_row.promotion == 1)
        store_products['promotion'] = np.where(has_promotion_mask, 1, 0)
        store_products['discount'] = np.where(store_products['promotion'] == 1, walmart_row.discount, 0)
        store_products['price'] = store_products['base_price'] * (1 - store_products['discount'])
        store_products['stock_level'] = self.rng.integers(50, 500, len(store_products))
        
        
        store_products['year'] = walmart_row.year
        store_products['month'] = walmart_row.month
        store_products['day'] = walmart_row.day
        store_products['day_of_week'] = walmart_row.day_of_week
        store_products['day_of_year'] = walmart_row.day_of_year
        store_products['week_of_year'] = walmart_row.week_of_year
        store_products['quarter'] = walmart_row.quarter
        store_products['is_weekend'] = walmart_row.is_weekend
        store_products['is_month_start'] = walmart_row.is_month_start
        store_products['is_month_end'] = walmart_row.is_month_end
        
        
        clean_records = store_products.drop(columns=['weight', 'seasonality_strength', 'promotion_elasticity', 'margin'])
        return clean_records.to_dict(orient='records')
    
    def enhance_walmart_data(self, walmart_df):
        """
        Main enhancement function
        """
        print("Enhancing Walmart data with product-level detail...")
        print("   Creating product catalog...")
        products_df = self.create_product_catalog()
        print(f"   ✓ Created {len(products_df)} products across {products_df['category'].nunique()} categories")
        
        all_records = []
        total_walmart_records = len(walmart_df)
        
        
        for idx, walmart_row in enumerate(walmart_df.itertuples()):
            if idx % 1000 == 0:  
                progress = (idx / total_walmart_records) * 100
                print(f"   Progress: {progress:.1f}%", end='\r')
            
            product_records = self.distribute_store_sales_to_products(walmart_row, products_df)
            all_records.extend(product_records)
        
        print(f"\n   ✓ Created {len(all_records):,} product-level records from {total_walmart_records:,} Walmart records")
        
        return pd.DataFrame(all_records)

def main():
    """
    Main execution: Load Walmart data and enhance it
    """
    print("📦 Loading Walmart data...")

    walmart_df = pd.read_parquet('data/processed/walmart_prepared.parquet')
    
    print(f"✓ Loaded {len(walmart_df):,} Walmart records")
    
    enhancer = WalmartDataEnhancer(n_products_per_store=50)
    enhanced_df = enhancer.enhance_walmart_data(walmart_df)
    
    
    os.makedirs('data/processed', exist_ok=True)
    
    enhanced_df.to_parquet('data/processed/walmart_enhanced.parquet', index=False)
    
    print(f"\n Saved to: data/processed/walmart_enhanced.parquet")
    
    print(f"\n Enhanced Dataset Statistics:")
    print(f"   Total records: {len(enhanced_df):,}")
    print(f"   Date range: {enhanced_df['date'].min()} to {enhanced_df['date'].max()}")
    print(f"   Stores: {enhanced_df['store_id'].nunique()}")
    print(f"   Products: {enhanced_df['product_id'].nunique()}")
    print(f"   Categories: {enhanced_df['category'].nunique()}")
    
    print(f"\n Sales Statistics:")
    print(enhanced_df['sales'].describe())
    
    print(f"\n Sales by Category:")
    print(enhanced_df.groupby('category')['sales'].sum().sort_values(ascending=False))
    
    print("\n Sample records:")
    print(enhanced_df.head(10))

if __name__ == '__main__':
    main()