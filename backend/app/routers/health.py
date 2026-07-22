from fastapi import APIRouter, Request
router = APIRouter(tags=["health"])
@router.get("/health")
def health(request: Request):
    state = request.app.state
    return {"status": "ok" if state.predictor.ready else "degraded", "xgboost_model": "ready" if state.predictor.ready else "unavailable", "finbert_model": "ready" if state.finbert.ready else "unavailable", "shap_explainer": "ready" if state.shap_explainer.explainer is not None else "unavailable", "startup_errors": state.startup_errors}
import json
from pathlib import Path

@router.get("/metrics")
def get_metrics():
    try:
        metrics_file = Path("model/metrics.json")
        if metrics_file.exists():
            with open(metrics_file, "r") as f:
                return json.load(f)
        return {"error": "Metrics not found."}
    except Exception as e:
        return {"error": str(e)}
