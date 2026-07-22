class FinBERTAnalyzer:
    def __init__(self, model_name: str):
        self.model_name, self.pipeline = model_name, None

    def load(self) -> None:
        from transformers import pipeline
        self.pipeline = pipeline("sentiment-analysis", model=self.model_name, tokenizer=self.model_name)

    @property
    def ready(self) -> bool:
        return self.pipeline is not None

    def analyze(self, text: str) -> dict[str, object]:
        if not text.strip():
            return {"label": "not_provided", "confidence": 0.0, "risk_signal": 0.5}
        if not self.ready:
            raise RuntimeError("FinBERT is unavailable; configure/download the FinBERT model before submitting borrower text.")
        result = self.pipeline(text[:512], truncation=True)[0]
        label = str(result["label"]).lower()
        # FinBERT probabilities are mapped to a risk signal: negative=1, neutral=.5, positive=0.
        risk_signal = {"negative": 1.0, "neutral": 0.5, "positive": 0.0}.get(label)
        if risk_signal is None:
            raise RuntimeError(f"Unexpected FinBERT label: {result['label']}")
        return {"label": label, "confidence": float(result["score"]), "risk_signal": risk_signal}
