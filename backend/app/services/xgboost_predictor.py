import joblib
import numpy as np
import pandas as pd


class XGBoostPredictor:
    def __init__(self, model_path, scaler_path):
        self.model_path, self.scaler_path = model_path, scaler_path
        self.model = self.scaler = None

    def load(self) -> None:
        self.model = joblib.load(self.model_path)
        self.scaler = joblib.load(self.scaler_path)
        expected = getattr(self.model, "n_features_in_", 6)
        if expected != 6:
            raise RuntimeError(f"Saved model expects {expected} features; this app supports its verified six-feature schema.")

    @property
    def ready(self) -> bool:
        return self.model is not None and self.scaler is not None

    def predict_probability(self, features: pd.DataFrame) -> float:
        if not self.ready:
            raise RuntimeError("XGBoost model is not loaded.")
        
        # Preprocessing consistency check
        expected_features = list(self.scaler.feature_names_in_)
        if list(features.columns) != expected_features:
            raise ValueError(f"Inference features {list(features.columns)} do not match training features {expected_features}.")
            
        scaled_features = self.scaler.transform(features)
        return float(self.model.predict_proba(scaled_features)[0][1])
