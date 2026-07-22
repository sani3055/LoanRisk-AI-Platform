from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_predict_endpoint():
    with TestClient(app) as client:
        response = client.post(
            "/api/predict",
            json={
                "loan_amnt": "12000",
                "int_rate": "13.5",
                "annual_inc": "55000",
                "dti": "15",
                "open_acc": "9",
                "revol_util": "45",
                "borrower_text": ""
            }
        )
        assert response.status_code == 200
