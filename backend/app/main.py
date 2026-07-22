from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import health, prediction
from app.services.finbert_analyzer import FinBERTAnalyzer
from app.services.shap_explainer import ShapExplainer
from app.services.xgboost_predictor import XGBoostPredictor
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.startup_errors = []
    app.state.predictor = XGBoostPredictor(settings.model_path, settings.scaler_path)
    app.state.finbert = FinBERTAnalyzer(settings.finbert_model)
    app.state.shap_explainer = ShapExplainer(app.state.predictor)
    try:
        app.state.predictor.load(); app.state.shap_explainer.load()
    except Exception as exc:
        app.state.startup_errors.append(f"Structured model: {exc}")
    try: app.state.finbert.load()
    except Exception as exc: app.state.startup_errors.append(f"FinBERT: {exc}")
    yield
app = FastAPI(title="Loan Risk API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=True, allow_methods=["GET", "POST"], allow_headers=["*"])
app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(prediction.router, prefix=settings.api_prefix)
