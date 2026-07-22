from fastapi import APIRouter
from pydantic import BaseModel
from model.predictor import predict_risk

from database.db import SessionLocal
from database.models import Loan

router = APIRouter()


class LoanData(BaseModel):
    borrower_name: str
    loan_amnt: float
    int_rate: float
    annual_inc: float
    dti: float
    open_acc: float
    revol_util: float
    borrower_text: str


@router.post("/predict")
def predict(data: LoanData):
    result = predict_risk(data)

    db = SessionLocal()

    new_loan = Loan(
        borrower_name=data.borrower_name,

        loan_amnt=data.loan_amnt,
        int_rate=data.int_rate,
        annual_inc=data.annual_inc,
        dti=data.dti,
        open_acc=data.open_acc,
        revol_util=data.revol_util,

        borrower_text=data.borrower_text,

        ml_probability=result["ml_probability"],
        sentiment=result["sentiment"],
        final_risk=result["final_risk"],
        risk_level=result["risk_level"]
    )

    db.add(new_loan)
    db.commit()
    db.close()

    return result


@router.get("/history")
def get_history():
    db = SessionLocal()
    data = db.query(Loan).all()
    db.close()
    return data