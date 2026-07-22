ALPHA = 0.85
TEXT_WEIGHT = 0.15


def fuse_scores(ml_probability: float, text_risk: float, text_was_provided: bool) -> float:
    if not text_was_provided:
        return float(ml_probability)
    return max(0.0, min(1.0, ALPHA * float(ml_probability) + TEXT_WEIGHT * float(text_risk)))


def classify_risk(score: float) -> str:
    if score < 0.30:
        return "LOW RISK"
    if score <= 0.60:
        return "MEDIUM RISK"
    return "HIGH RISK"
