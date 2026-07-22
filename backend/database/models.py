from sqlalchemy import Column, Integer, Float, String
from database.db import Base

class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)

    borrower_name = Column(String)

    loan_amnt = Column(Float)
    int_rate = Column(Float)
    annual_inc = Column(Float)
    dti = Column(Float)
    open_acc = Column(Float)
    revol_util = Column(Float)

    borrower_text = Column(String)

    ml_probability = Column(Float)
    sentiment = Column(String)
    final_risk = Column(Float)
    risk_level = Column(String)