from app.services.preprocessor import FEATURE_COLUMNS


class ShapExplainer:
    def __init__(self, predictor):
        self.predictor, self.explainer = predictor, None

    def load(self) -> None:
        import shap
        self.explainer = shap.TreeExplainer(self.predictor.model)

    def explain(self, scaled_features) -> dict[str, object]:
        if self.explainer is None:
            raise RuntimeError("SHAP explainer is not loaded.")
        values = self.explainer.shap_values(scaled_features)
        if isinstance(values, list):
            values = values[1]
        row = values[0]
        factors = [{"feature": name, "contribution": float(value)} for name, value in zip(FEATURE_COLUMNS, row)]
        increasing = sorted((x for x in factors if x["contribution"] > 0), key=lambda x: x["contribution"], reverse=True)
        decreasing = sorted((x for x in factors if x["contribution"] < 0), key=lambda x: x["contribution"])
        return {"feature_names": list(FEATURE_COLUMNS), "shap_values": {x["feature"]: x["contribution"] for x in factors}, "risk_increasing_factors": increasing[:5], "risk_decreasing_factors": decreasing[:5]}
