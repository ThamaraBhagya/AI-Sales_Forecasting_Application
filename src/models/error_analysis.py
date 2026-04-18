"""
Error Analysis and Visualization
Creates charts for model performance analysis
"""
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

def create_error_analysis():
    """
    Create comprehensive error analysis charts
    """
    print("📊 Creating Error Analysis Charts...")
    
    # Load predictions
    df = pd.read_csv('models/reports/test_predictions.csv')
    
    
    os.makedirs('models/reports/charts', exist_ok=True)
    
    
    plt.style.use('seaborn-v0_8-darkgrid')
    sns.set_palette('husl')
    
    # Actual vs Predicted 
    fig, axes = plt.subplots(1, 2, figsize=(15, 5))
    
    # XGBoost
    axes[0].scatter(df['actual'], df['xgboost'], alpha=0.5, s=10)
    axes[0].plot([df['actual'].min(), df['actual'].max()], 
                 [df['actual'].min(), df['actual'].max()], 
                 'r--', lw=2)
    axes[0].set_xlabel('Actual Sales')
    axes[0].set_ylabel('Predicted Sales')
    axes[0].set_title('XGBoost: Actual vs Predicted')
    axes[0].grid(True, alpha=0.3)
    
    # LightGBM
    axes[1].scatter(df['actual'], df['lightgbm'], alpha=0.5, s=10)
    axes[1].plot([df['actual'].min(), df['actual'].max()], 
                 [df['actual'].min(), df['actual'].max()], 
                 'r--', lw=2)
    axes[1].set_xlabel('Actual Sales')
    axes[1].set_ylabel('Predicted Sales')
    axes[1].set_title('LightGBM: Actual vs Predicted')
    axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('models/reports/charts/actual_vs_predicted.png', dpi=300, bbox_inches='tight')
    print("   ✓ Saved: actual_vs_predicted.png")
    plt.close()
    
    # Residual Distribution
    fig, axes = plt.subplots(1, 2, figsize=(15, 5))
    
    xgb_residuals = df['actual'] - df['xgboost']
    lgb_residuals = df['actual'] - df['lightgbm']
    
    axes[0].hist(xgb_residuals, bins=50, edgecolor='black', alpha=0.7)
    axes[0].axvline(0, color='red', linestyle='--', linewidth=2)
    axes[0].set_xlabel('Residual (Actual - Predicted)')
    axes[0].set_ylabel('Frequency')
    axes[0].set_title(f'XGBoost Residuals (Mean: {xgb_residuals.mean():.2f})')
    axes[0].grid(True, alpha=0.3)
    
    axes[1].hist(lgb_residuals, bins=50, edgecolor='black', alpha=0.7)
    axes[1].axvline(0, color='red', linestyle='--', linewidth=2)
    axes[1].set_xlabel('Residual (Actual - Predicted)')
    axes[1].set_ylabel('Frequency')
    axes[1].set_title(f'LightGBM Residuals (Mean: {lgb_residuals.mean():.2f})')
    axes[1].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('models/reports/charts/residual_distribution.png', dpi=300, bbox_inches='tight')
    print("   ✓ Saved: residual_distribution.png")
    plt.close()
    
    # Model Comparison Bar Chart
    comparison = pd.read_csv('models/reports/model_comparison.csv')
    
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    
    metrics = ['Test MAE', 'Test RMSE', 'Test R²', 'Test MAPE']
    for idx, metric in enumerate(metrics):
        ax = axes[idx // 2, idx % 2]
        comparison.plot(x='Model', y=metric, kind='bar', ax=ax, legend=False, color=['#1f77b4', '#ff7f0e'])
        ax.set_title(f'{metric} Comparison')
        ax.set_xlabel('')
        ax.set_ylabel(metric)
        ax.grid(True, alpha=0.3, axis='y')
        
        
        for container in ax.containers:
            ax.bar_label(container, fmt='%.2f')
    
    plt.tight_layout()
    plt.savefig('models/reports/charts/model_comparison.png', dpi=300, bbox_inches='tight')
    print("   ✓ Saved: model_comparison.png")
    plt.close()
    
    # Feature Importance (Top 20)
    try:
        xgb_importance = pd.read_csv('models/reports/xgboost_feature_importance.csv')
        lgb_importance = pd.read_csv('models/reports/lightgbm_feature_importance.csv')
        
        fig, axes = plt.subplots(1, 2, figsize=(15, 8))
        
        # XGBoost
        top_xgb = xgb_importance.head(20)
        axes[0].barh(range(len(top_xgb)), top_xgb['importance'], color='steelblue')
        axes[0].set_yticks(range(len(top_xgb)))
        axes[0].set_yticklabels(top_xgb['feature'])
        axes[0].invert_yaxis()
        axes[0].set_xlabel('Importance')
        axes[0].set_title('XGBoost: Top 20 Features')
        axes[0].grid(True, alpha=0.3, axis='x')
        
        # LightGBM
        top_lgb = lgb_importance.head(20)
        axes[1].barh(range(len(top_lgb)), top_lgb['importance'], color='coral')
        axes[1].set_yticks(range(len(top_lgb)))
        axes[1].set_yticklabels(top_lgb['feature'])
        axes[1].invert_yaxis()
        axes[1].set_xlabel('Importance')
        axes[1].set_title('LightGBM: Top 20 Features')
        axes[1].grid(True, alpha=0.3, axis='x')
        
        plt.tight_layout()
        plt.savefig('models/reports/charts/feature_importance.png', dpi=300, bbox_inches='tight')
        print("   ✓ Saved: feature_importance.png")
        plt.close()
        
    except Exception as e:
        print(f"   ⚠️ Could not create feature importance chart: {e}")
    
    print("\n✅ Error analysis complete! Charts saved in models/reports/charts/")

if __name__ == '__main__':
    create_error_analysis()