import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Record } from '../types';
import { Layout } from '../components/Layout';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export function Dashboard({ user }: { user: User }) {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'predictions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc')));
        setRecords(snap.docs.map(d => ({ id: d.id, ...d.data() } as Record)));
      } catch (err) {
        setError('Could not load prediction history. Check Firestore rules and indexes.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.uid]);

  if (loading) return <Layout user={user} title="Dashboard"><div>Loading dashboard data...</div></Layout>;
  if (error) return <Layout user={user} title="Dashboard"><div className="error">{error}</div></Layout>;

  const total = records.length;
  const lowRisk = records.filter(r => r.result.risk_level.toUpperCase().includes('LOW')).length;
  const medRisk = records.filter(r => r.result.risk_level.toUpperCase().includes('MEDIUM')).length;
  const highRisk = records.filter(r => r.result.risk_level.toUpperCase().includes('HIGH')).length;
  const avgScore = total > 0 ? records.reduce((acc, r) => acc + r.result.final_risk_score, 0) / total : 0;

  const riskData = [
    { name: 'Low Risk', value: lowRisk, color: '#10b981' },
    { name: 'Medium Risk', value: medRisk, color: '#f59e0b' },
    { name: 'High Risk', value: highRisk, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const scoreRanges = [0, 0, 0, 0, 0];
  records.forEach(r => {
    const s = r.result.final_risk_score * 100;
    if (s < 20) scoreRanges[0]++;
    else if (s < 40) scoreRanges[1]++;
    else if (s < 60) scoreRanges[2]++;
    else if (s < 80) scoreRanges[3]++;
    else scoreRanges[4]++;
  });
  const distData = [
    { range: '0-20', count: scoreRanges[0] },
    { range: '20-40', count: scoreRanges[1] },
    { range: '40-60', count: scoreRanges[2] },
    { range: '60-80', count: scoreRanges[3] },
    { range: '80-100', count: scoreRanges[4] }
  ];

  return (
    <Layout user={user} title="Dashboard">
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card text-center">
          <h3 className="muted">Total Assessments</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{total}</div>
        </div>
        <div className="card text-center">
          <h3 className="muted">Low Risk</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>{lowRisk}</div>
        </div>
        <div className="card text-center">
          <h3 className="muted">Medium Risk</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{medRisk}</div>
        </div>
        <div className="card text-center">
          <h3 className="muted">High Risk</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>{highRisk}</div>
        </div>
        <div className="card text-center">
          <h3 className="muted">Average Score</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{(avgScore * 100).toFixed(1)}</div>
        </div>
      </div>

      {total > 0 ? (
        <>
          <div className="grid">
            <div className="card">
              <h2>Risk Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {riskData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="card">
              <h2>Score Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={distData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis allowDecimals={false} />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card history" style={{ marginTop: '2rem' }}>
            <h2>Recent Assessments</h2>
            {records.slice(0, 5).map(r => (
              <div className="historyrow" key={r.id}>
                <span>{r.createdAt?.toDate().toLocaleString() || 'Recent'}</span>
                <span>${Number(r.input.loan_amnt).toLocaleString()} · {r.input.borrower_text ? 'With text' : 'Structured only'}</span>
                <b className={r.result.risk_level.split(' ')[0].toLowerCase()}>{(r.result.final_risk_score * 100).toFixed(0)} · {r.result.risk_level}</b>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="card empty" style={{ textAlign: 'center', padding: '3rem' }}>
          <h2>No assessments yet</h2>
          <p className="muted">Go to New Assessment to run your first loan risk analysis.</p>
        </div>
      )}
    </Layout>
  );
}
