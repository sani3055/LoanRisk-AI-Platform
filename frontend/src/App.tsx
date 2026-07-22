import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { AuthScreen } from './components/AuthScreen';
import { Dashboard } from './pages/Dashboard';
import { NewAssessment } from './pages/NewAssessment';
import { PredictionHistory } from './pages/PredictionHistory';
import { ModelInsights } from './pages/ModelInsights';
import './style.css';

export function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    return onAuthStateChanged(auth, setUser);
  }, []);

  if (user === undefined) {
    return <div className="auth">Loading secure workspace…</div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard user={user} />} />
        <Route path="/new" element={<NewAssessment user={user} />} />
        <Route path="/history" element={<PredictionHistory user={user} />} />
        <Route path="/insights" element={<ModelInsights user={user} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
