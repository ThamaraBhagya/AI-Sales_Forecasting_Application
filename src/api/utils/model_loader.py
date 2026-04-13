"""
Model loading and caching utility
"""
import joblib
import os
from datetime import datetime
from sklearn.preprocessing import LabelEncoder
import pandas as pd
import numpy as np

class ModelLoader:
    """
    Singleton model loader with caching
    Loads model once and reuses it for all predictions
    """
    _instance = None
    _model_data = None
    _label_encoders = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        self.model_path = '../../models/lightgbm_model.pkl'  # Default to best model
        self.loaded_at = None
    
    def load_model(self, model_path=None):
        """Load model from disk"""
        if model_path:
            self.model_path = model_path
        
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"Model not found at {self.model_path}")
        
        print(f"Loading model from {self.model_path}...")
        self._model_data = joblib.load(self.model_path)
        self.loaded_at = datetime.now().isoformat()
        
        # Load label encoders (needed for categorical encoding)
        self._load_encoders()
        
        print(f"✓ Model loaded: {self._model_data['model_type']}")
        print(f"✓ Features: {len(self._model_data['feature_cols'])}")
        
        return self._model_data
    
    def _load_encoders(self):
        """Load or create label encoders for categorical features"""
        # In production, these would be saved during training
        # For now, create them with expected mappings
        
        self._label_encoders = {
            'category': {
                'Grocery': 0, 'Electronics': 1, 'Clothing': 2, 
                'Home & Garden': 3, 'Health & Beauty': 4, 'Sports': 5,
                'Toys': 6, 'Automotive': 7
            },
            'location_type': {
                'Rural': 0, 'Suburban': 1, 'Urban': 2
            },
            'store_size': {
                'Small': 0, 'Medium': 1, 'Large': 2
            },
            'region': {
                'Northeast': 0, 'Southeast': 1, 'Midwest': 2,
                'Southwest': 3, 'West': 4
            },
            'temp_category': {
                'freezing': 0, 'cold': 1, 'mild': 2, 'hot': 3
            }
        }
    
    def get_model(self):
        """Get loaded model"""
        if self._model_data is None:
            self.load_model()
        return self._model_data
    
    def get_encoders(self):
        """Get label encoders"""
        if self._label_encoders is None:
            self._load_encoders()
        return self._label_encoders
    
    def is_loaded(self):
        """Check if model is loaded"""
        return self._model_data is not None
    
    def reload(self):
        """Reload model from disk"""
        print("Reloading model...")
        self._model_data = None
        return self.load_model()