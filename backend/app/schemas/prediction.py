from pydantic import BaseModel, ConfigDict, Field


class PredictionRequest(BaseModel):
    """The six structured features used by the saved XGBoost artifact."""
    model_config = ConfigDict(str_strip_whitespace=True)
    loan_amnt: float = Field(gt=0, le=1_000_000)
    int_rate: float = Field(gt=0, le=100)
    annual_inc: float = Field(gt=0, le=100_000_000)
    dti: float = Field(ge=0, le=200)
    open_acc: float = Field(ge=0, le=200)
    revol_util: float = Field(ge=0, le=200)
    borrower_text: str = Field(default="", max_length=4000)


class Factor(BaseModel):
    feature: str
    contribution: float


class PredictionResponse(BaseModel):
    ml_probability: float
    sentiment: dict[str, object]
    final_risk_score: float
    risk_level: str
    text_was_used: bool
    shap_explanation: dict[str, object]
