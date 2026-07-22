import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Layout } from '../components/Layout';
import { ShieldCheck, Database, BrainCircuit, Activity } from 'lucide-react';
export function ModelInsights({ user }: { user: User }) {
  const [metrics, setMetrics] = useState<any>(null);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/metrics`);
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to fetch metrics", err);
      }
    };
    fetchMetrics();
  }, []);
  return (
    <Layout user={user} title="Model Insights">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2><ShieldCheck style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Responsible Use Notice</h2>
        <p>
          This is a decision-support demonstration only. It must not independently approve, deny, or price real lending applications.
        </p>
      </div>

      <div className="grid">
        <div className="card">
          <h2><BrainCircuit style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} /> Model Overview</h2>
          <p>The core risk prediction engine utilizes an <b>XGBoost classifier</b> trained to predict loan defaults based on structured borrower data. When optional text descriptions are provided, a pre-trained <b>FinBERT</b> NLP model (ProsusAI/finbert) analyzes the sentiment of the text.</p>
          <p>These two models are combined using an <b>85% structured ML / 15% NLP risk fusion</b> approach. If no text is provided, the final score defaults to the XGBoost prediction.</p>
          <p>Finally, <b>SHAP</b> (SHapley Additive exPlanations) is used to calculate the contribution of each feature to the final prediction, providing explainability for every assessment.</p>
        </div>

        <div className="card">
          <h2><Database style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} /> Dataset & Inputs</h2>
          <p>The model expects specific borrower features as inputs, which are preprocessed using a saved standard scaler.</p>
          
          <h3>Model Inputs</h3>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li><b>Loan Information:</b> Loan Amount (`loan_amnt`), Interest Rate (`int_rate`), Purpose Description (Optional)</li>
            <li><b>Financial Information:</b> Annual Income (`annual_inc`), Debt-to-Income Ratio (`dti`)</li>
            <li><b>Credit Profile:</b> Open Accounts (`open_acc`), Revolving Utilization (`revol_util`)</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <h2>Model Pipeline</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          <div style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent-primary)', color: 'var(--text-primary)', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 600 }}>Borrower Data</div>
          <div style={{ color: 'var(--text-secondary)' }}>↓</div>
          <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', padding: '0.75rem 2rem', borderRadius: '8px' }}>Data Preprocessing</div>
          <div style={{ color: 'var(--text-secondary)' }}>↓</div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>XGBoost Prediction</div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>+</div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', color: 'var(--text-primary)', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>FinBERT Text Analysis</div>
          </div>
          
          <div style={{ color: 'var(--text-secondary)' }}>↓</div>
          <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', padding: '0.75rem 2rem', borderRadius: '8px' }}>85/15 Risk Fusion</div>
          <div style={{ color: 'var(--text-secondary)' }}>↓</div>
          <div style={{ background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', padding: '0.75rem 2rem', borderRadius: '8px' }}>SHAP Explainability</div>
          <div style={{ color: 'var(--text-secondary)' }}>↓</div>
          <div style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', fontWeight: 600, boxShadow: '0 4px 14px var(--accent-glow)' }}>Final Risk Assessment</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2><Activity style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '0.5rem' }} /> Model Performance</h2>
        {metrics && !metrics.error ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid var(--card-border)' }}>
              <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{(metrics.accuracy * 100).toFixed(1)}%</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Accuracy</p>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid var(--card-border)' }}>
              <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{metrics.roc_auc.toFixed(3)}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>ROC-AUC</p>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid var(--card-border)' }}>
              <h3 style={{ color: 'var(--accent-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{metrics.f1_score.toFixed(3)}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>F1 Score</p>
            </div>
            <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', border: '1px solid var(--card-border)' }}>
              <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{metrics.test_size.toLocaleString()}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Test Samples</p>
            </div>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--danger-bg)', color: 'var(--danger)', borderRadius: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)', marginTop: '1rem' }}>
            <h3>Loading metrics...</h3>
          </div>
        )}
      </div>
    </Layout>
  );
}
