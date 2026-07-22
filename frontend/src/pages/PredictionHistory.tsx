import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Record } from '../types';
import { Layout } from '../components/Layout';
import { downloadReport } from '../utils/pdfReport';
import { FileDown, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function PredictionHistory({ user }: { user: User }) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters and sorting
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Selected assessment for viewing
  const [selected, setSelected] = useState<Record | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'predictions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')));
        setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as Record)));
      } catch (err) {
        setError('Could not load prediction history.');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [user.uid]);

  const clearFilters = () => {
    setSearch('');
    setRiskFilter('All');
    setSortBy('Newest');
  };

  const filteredRecords = records
    .filter(r => {
      if (riskFilter !== 'All' && !r.result.risk_level.includes(riskFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        return r.input.loan_amnt.includes(q) || r.input.borrower_text.toLowerCase().includes(q) || r.result.risk_level.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Newest') return (b.createdAt?.toDate().getTime() || 0) - (a.createdAt?.toDate().getTime() || 0);
      if (sortBy === 'Oldest') return (a.createdAt?.toDate().getTime() || 0) - (b.createdAt?.toDate().getTime() || 0);
      if (sortBy === 'Highest Risk') return b.result.final_risk_score - a.result.final_risk_score;
      if (sortBy === 'Lowest Risk') return a.result.final_risk_score - b.result.final_risk_score;
      return 0;
    });

  const factors = selected ? [...selected.result.shap_explanation.risk_increasing_factors, ...selected.result.shap_explanation.risk_decreasing_factors].map(x => ({ ...x, contribution: +x.contribution.toFixed(3) })) : [];

  const exportCSV = () => {
    if (!filteredRecords.length) return;
    const headers = ['Date', 'Loan Amount', 'Interest Rate', 'Annual Income', 'DTI', 'Open Accounts', 'Revolving Util', 'Borrower Text', 'Risk Level', 'Risk Score', 'ML Probability', 'Sentiment'];
    const rows = filteredRecords.map(r => [
      r.createdAt?.toDate().toLocaleString() || '',
      r.input.loan_amnt,
      r.input.int_rate,
      r.input.annual_inc,
      r.input.dti,
      r.input.open_acc,
      r.input.revol_util,
      `"${(r.input.borrower_text || '').replace(/"/g, '""')}"`,
      r.result.risk_level,
      (r.result.final_risk_score * 100).toFixed(0),
      (r.result.ml_probability * 100).toFixed(1),
      r.result.text_was_used ? `${r.result.sentiment.label} (${(r.result.sentiment.confidence * 100).toFixed(0)}%)` : 'N/A'
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'prediction_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout user={user} title="Prediction History">
      {selected ? (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Assessment Details</h2>
            <button className="secondary" onClick={() => setSelected(null)}><X size={16} /> Close</button>
          </div>
          
          <div className="grid" style={{ marginTop: '1rem' }}>
            <div className="card result" style={{ margin: 0 }}>
              <small>FINAL RISK ASSESSMENT</small>
              <h2 className={selected.result.risk_level.split(' ')[0].toLowerCase()}>{selected.result.risk_level}</h2>
              <div className="score">{(selected.result.final_risk_score * 100).toFixed(0)}<span>/100</span></div>
              <div className="metrics">
                <p>Structured ML Risk <b>{(selected.result.ml_probability * 100).toFixed(1)}%</b></p>
                {selected.result.text_was_used && <p>NLP Sentiment <b>{selected.result.sentiment.label} · {(selected.result.sentiment.confidence * 100).toFixed(0)}%</b></p>}
              </div>
              <button className="secondary" onClick={() => downloadReport(selected.result, selected.input)}>
                <FileDown size={17} /> Download Risk Report
              </button>
            </div>
            <div>
              <h3>Input Data</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0' }}>
                <li><b>Loan Amount:</b> ${Number(selected.input.loan_amnt).toLocaleString()}</li>
                <li><b>Interest Rate:</b> {selected.input.int_rate}%</li>
                <li><b>Annual Income:</b> ${Number(selected.input.annual_inc).toLocaleString()}</li>
                <li><b>DTI:</b> {selected.input.dti}%</li>
                <li><b>Open Accounts:</b> {selected.input.open_acc}</li>
                <li><b>Revolving Util:</b> {selected.input.revol_util}%</li>
              </ul>
              {selected.input.borrower_text && (
                <>
                  <h3>Borrower Description</h3>
                  <p className="muted" style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>"{selected.input.borrower_text}"</p>
                </>
              )}
            </div>
          </div>

          <div className="chart" style={{ marginTop: '2rem' }}>
            <h3>Model explanation</h3>
            <ResponsiveContainer width="100%" height={270}>
              <BarChart data={factors} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="feature" width={100} />
                <Tooltip />
                <Bar dataKey="contribution" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="card history">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search amount, purpose..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              style={{ flex: 1, minWidth: '200px', marginTop: 0 }}
            />
            <select style={{ marginTop: 0, paddingRight: '2.5rem', width: 'auto' }} value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
              <option value="All">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
            <select style={{ marginTop: 0, paddingRight: '2.5rem', width: 'auto' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="Newest">Newest First</option>
              <option value="Oldest">Oldest First</option>
              <option value="Highest Risk">Highest Risk First</option>
              <option value="Lowest Risk">Lowest Risk First</option>
            </select>
            <button className="secondary" onClick={clearFilters} style={{ margin: 0, height: '46px' }}>Clear</button>
            <button className="secondary" onClick={exportCSV} disabled={!filteredRecords.length} style={{ margin: 0, height: '46px' }}>
              <FileDown size={16} /> Export CSV
            </button>
          </div>
          
          <div style={{ marginBottom: '1rem' }} className="muted">
            Showing {filteredRecords.length} result{filteredRecords.length !== 1 ? 's' : ''}
          </div>

          {loading ? (
            <div>Loading history...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : filteredRecords.length ? (
            filteredRecords.map(r => (
              <div className="historyrow" key={r.id} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <span>{r.createdAt?.toDate().toLocaleString() || 'Saving…'}</span>
                  <span>${Number(r.input.loan_amnt).toLocaleString()} · {r.input.borrower_text ? 'With text' : 'Structured only'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <b className={r.result.risk_level.split(' ')[0].toLowerCase()}>
                    {(r.result.final_risk_score * 100).toFixed(0)} · {r.result.risk_level}
                  </b>
                  <button className="secondary" onClick={() => setSelected(r)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>View</button>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No assessments match your filters.</p>
          )}
        </div>
      )}
    </Layout>
  );
}
