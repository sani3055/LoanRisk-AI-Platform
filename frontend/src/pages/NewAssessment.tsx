import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Layout } from '../components/Layout';
import { initialFormState, Result } from '../types';
import { downloadReport } from '../utils/pdfReport';
import { Activity, FileDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function NewAssessment({ user }: { user: User }) {
  const [form, setForm] = useState(initialFormState);
  const [result, setResult] = useState<Result>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const change = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, k === 'borrower_text' ? v : Number(v)])
      );
      const { data } = await axios.post<Result>(`${API}/predict`, payload);
      setResult(data);
      await addDoc(collection(db, 'predictions'), {
        userId: user.uid,
        createdAt: serverTimestamp(),
        input: form,
        result: data
      });
    } catch (e) {
      setError(axios.isAxiosError(e) ? (e.response?.data?.detail || e.message) : (e instanceof Error ? e.message : 'Could not complete assessment'));
    } finally {
      setBusy(false);
    }
  };

  const factors = useMemo(() => result ? [...result.shap_explanation.risk_increasing_factors, ...result.shap_explanation.risk_decreasing_factors].map(x => ({ ...x, contribution: +x.contribution.toFixed(3) })) : [], [result]);

  return (
    <Layout user={user} title="New Assessment">
      <div className="grid">
        <form onSubmit={submit} className="card">
          <h2>New assessment</h2>
          <p className="muted">Values are validated against the six-feature trained model.</p>
          <div className="fields">
            {[
              ['loan_amnt', 'Loan amount'],
              ['int_rate', 'Interest rate (%)'],
              ['annual_inc', 'Annual income'],
              ['dti', 'Debt-to-income (%)'],
              ['open_acc', 'Open accounts'],
              ['revol_util', 'Revolving utilization (%)']
            ].map(([name, label]) => (
              <label key={name}>{label}
                <input required type="number" min="0" step="any" name={name} value={form[name as keyof typeof form]} onChange={change} />
              </label>
            ))}
          </div>
          <label>Borrower / Loan Description <span>(optional FinBERT analysis)</span>
            <textarea name="borrower_text" value={form.borrower_text} onChange={change} />
          </label>
          {error && <p className="error">{error}</p>}
          <button disabled={busy}>{busy ? 'Analyzing Credit Risk…' : 'Run assessment'}</button>
        </form>

        {result ? (
          <div className="card result">
            <small>FINAL RISK ASSESSMENT</small>
            <h2 className={result.risk_level.split(' ')[0].toLowerCase()}>{result.risk_level}</h2>
            <div className="score">{(result.final_risk_score * 100).toFixed(0)}<span>/100</span></div>
            <div className="metrics">
              <p>Structured ML Risk <b>{(result.ml_probability * 100).toFixed(1)}%</b></p>
              {result.text_was_used && <p>NLP Sentiment <b>{result.sentiment.label} · {(result.sentiment.confidence * 100).toFixed(0)}%</b></p>}
            </div>
            <button className="secondary" onClick={() => downloadReport(result, form)}>
              <FileDown size={17} /> Download Risk Report
            </button>
          </div>
        ) : (
          <div className="card empty">
            <Activity size={36} />
            <h2>Ready to assess</h2>
            <p>Submit borrower data to generate a real model prediction and SHAP explanation.</p>
          </div>
        )}
      </div>

      {result && (
        <div className="card chart" style={{ marginTop: '2rem' }}>
          <h2>Model explanation</h2>
          <ResponsiveContainer width="100%" height={270}>
            <BarChart data={factors} layout="vertical">
              <XAxis type="number" />
              <YAxis type="category" dataKey="feature" width={100} />
              <Tooltip />
              <Bar dataKey="contribution" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Layout>
  );
}
