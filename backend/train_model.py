import pandas as pd
import numpy as np
import json
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, f1_score, roc_auc_score, precision_score, recall_score

URL = "https://raw.githubusercontent.com/akashkriplani/lending-club-case-study/master/loan.csv"
print(f"Downloading real dataset from {URL} ...")

df = pd.read_csv(URL, low_memory=False)
print(f"Initial shape: {df.shape}")

# Filter to only include Fully Paid and Charged Off loans
df = df[df["loan_status"].isin(["Fully Paid", "Charged Off"])]

# Convert target variable to 0 (Fully Paid) and 1 (Charged Off/Default)
df["loan_status"] = df["loan_status"].map({"Fully Paid": 0, "Charged Off": 1})

# In this dataset, some columns might be strings with '%' (like "15.2%"). Let's clean them.
if df["int_rate"].dtype == object:
    df["int_rate"] = df["int_rate"].str.replace("%", "").astype(float)
if df["revol_util"].dtype == object:
    df["revol_util"] = df["revol_util"].str.replace("%", "").astype(float)

features = ["loan_amnt", "int_rate", "annual_inc", "dti", "open_acc", "revol_util"]

# Drop missing values in our target features
df = df.dropna(subset=features + ["loan_status"])
print(f"Shape after cleaning: {df.shape}")

X = df[features]
y = df["loan_status"]

print(f"Class distribution:\n{y.value_counts(normalize=True)}")

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

print("Training XGBoost Classifier on real data...")
model = XGBClassifier(
    use_label_encoder=False, 
    eval_metric="logloss",
    max_depth=4,
    learning_rate=0.1,
    n_estimators=100,
    random_state=42
)
model.fit(X_train_scaled, y_train)

# Evaluate
y_pred = model.predict(X_test_scaled)
y_prob = model.predict_proba(X_test_scaled)[:, 1]

metrics = {
    "accuracy": round(accuracy_score(y_test, y_pred), 4),
    "f1_score": round(f1_score(y_test, y_pred), 4),
    "roc_auc": round(roc_auc_score(y_test, y_prob), 4),
    "precision": round(precision_score(y_test, y_pred), 4),
    "recall": round(recall_score(y_test, y_pred), 4),
    "train_size": len(X_train),
    "test_size": len(X_test)
}

print("\nReal Model Performance:")
for k, v in metrics.items():
    print(f" - {k}: {v}")

# Save files
joblib.dump(model, "model/best_model.pkl")
joblib.dump(scaler, "model/scaler.pkl")

with open("model/metrics.json", "w") as f:
    json.dump(metrics, f, indent=4)

print("\n✅ Real Model, Scaler, and Metrics saved successfully to backend/model/")