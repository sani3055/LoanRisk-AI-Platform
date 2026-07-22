import React, { useEffect, useState } from 'react';
import { ShieldCheck, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Sidebar() {
  const location = useLocation();
  const path = location.pathname;
  
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <aside style={{ justifyContent: 'space-between' }}>
      <div>
        <div className="brand"><ShieldCheck /> LoanRisk-AI</div>
        <Link to="/" className={path === '/' ? 'active' : ''}>Dashboard</Link>
        <Link to="/new" className={path === '/new' ? 'active' : ''}>New Assessment</Link>
        <Link to="/history" className={path === '/history' ? 'active' : ''}>Prediction History</Link>
        <Link to="/insights" className={path === '/insights' ? 'active' : ''}>Model Insights</Link>
      </div>
      
      <button 
        onClick={toggleTheme}
        className="secondary"
        style={{ marginTop: 'auto', width: '100%', justifyContent: 'center' }}
      >
        {theme === 'dark' ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
      </button>
    </aside>
  );
}
