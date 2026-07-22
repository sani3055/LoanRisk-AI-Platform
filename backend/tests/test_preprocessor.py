from app.schemas.prediction import PredictionRequest
from app.services.preprocessor import FEATURE_COLUMNS, to_feature_frame


def test_verified_feature_order():
    row = to_feature_frame(PredictionRequest(loan_amnt=1, int_rate=2, annual_inc=3, dti=4, open_acc=5, revol_util=6))
    assert FEATURE_COLUMNS == ("loan_amnt", "int_rate", "annual_inc", "dti", "open_acc", "revol_util")
    assert row.columns.tolist() == list(FEATURE_COLUMNS)
    assert row.values.tolist() == [[1.0, 2.0, 3.0, 4.0, 5.0, 6.0]]
