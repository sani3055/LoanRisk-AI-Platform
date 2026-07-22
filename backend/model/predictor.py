import joblib
import numpy as np
from transformers import pipeline

# load ML model
model = joblib.load("model/best_model.pkl")
scaler = joblib.load("model/scaler.pkl")

# load FinBERT
sentiment_model = pipeline("sentiment-analysis")


def predict_risk(data):
    # numerical features
    features = np.array([[
        data.loan_amnt,
        data.int_rate,
        data.annual_inc,
        data.dti,
        data.open_acc,
        data.revol_util
    ]])

    scaled = scaler.transform(features)

    # ML prediction
    ml_prob = model.predict_proba(scaled)[0][1]

    # NLP sentiment
    sentiment = sentiment_model(data.borrower_text)[0]["label"]

    # combine logic
    final_risk = ml_prob

    if sentiment == "NEGATIVE":
        final_risk += 0.1
    elif sentiment == "POSITIVE":
        final_risk -= 0.05

    final_risk = max(0, min(1, final_risk))

    risk_level = "LOW RISK" if final_risk > 0.5 else "HIGH RISK"

    return {
        "ml_probability": float(ml_prob),
        "sentiment": sentiment,
        "final_risk": float(final_risk),
        "risk_level": risk_level
    }