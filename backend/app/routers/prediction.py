from fastapi import APIRouter, HTTPException, Request
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.fusion import classify_risk, fuse_scores
from app.services.preprocessor import to_feature_frame
router = APIRouter(tags=["prediction"])
@router.post("/predict", response_model=PredictionResponse)
def predict(payload: PredictionRequest, request: Request):
    state = request.app.state
    if not state.predictor.ready or state.shap_explainer.explainer is None:
        raise HTTPException(503, "Structured model service is unavailable. See /api/health.")
    text_was_used = bool(payload.borrower_text.strip())
    if text_was_used and not state.finbert.ready:
        raise HTTPException(503, "FinBERT is unavailable. Submit without text or install/configure FinBERT.")
    try:
        features = to_feature_frame(payload)
        scaled = state.predictor.scaler.transform(features)
        ml_probability = state.predictor.predict_probability(features)
        sentiment = state.finbert.analyze(payload.borrower_text)
        final_score = fuse_scores(ml_probability, float(sentiment["risk_signal"]), text_was_used)
        return {"ml_probability": ml_probability, "sentiment": sentiment, "final_risk_score": final_score, "risk_level": classify_risk(final_score), "text_was_used": text_was_used, "shap_explanation": state.shap_explainer.explain(scaled)}
    except Exception as exc:
        raise HTTPException(500, f"Prediction failed: {exc}") from exc
