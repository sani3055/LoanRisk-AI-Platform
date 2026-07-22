import pandas as pd
from app.schemas.prediction import PredictionRequest

FEATURE_COLUMNS = ("loan_amnt", "int_rate", "annual_inc", "dti", "open_acc", "revol_util")


def to_feature_frame(payload: PredictionRequest) -> pd.DataFrame:
    """Match the named-column DataFrame used when the saved scaler was fitted."""
    frame = pd.DataFrame([{name: float(getattr(payload, name)) for name in FEATURE_COLUMNS}], columns=FEATURE_COLUMNS)
    if tuple(frame.columns) != FEATURE_COLUMNS or frame.shape != (1, len(FEATURE_COLUMNS)):
        raise ValueError("Inference features do not match the verified training schema.")
    return frame
