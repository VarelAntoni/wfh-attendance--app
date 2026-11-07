import React, { useState, useEffect } from 'react';
import { User } from './types';
import { Login } from './pages/Login';
import { Navbar } from './components/Navbar';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { api } from './api/client';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api
        .getProfile()
        .then((user) => {
          setCurrentUser(user);
          localStorage.setItem('user', JSON.stringify(user));
        })
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setCurrentUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = (user: User, token: string) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2.5 text-slate-600">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
            Inisialisasi Sesi...
          </span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col selection:bg-slate-900 selection:text-white">
      <Navbar user={currentUser} onLogout={handleLogout} />

      <main className="flex-1">
        {currentUser.role === 'ADMIN_HRD' ? (
          <AdminDashboard />
        ) : (
          <EmployeeDashboard user={currentUser} />
        )}
      </main>

      <footer className="border-t border-slate-200/80 bg-white py-4 px-4 sm:px-8 lg:px-12 text-[11px] font-mono text-slate-400 w-full flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>Workforce Presence Instrument • Fullstack Developer Skill Test</span>
        <span className="text-slate-300">NestJS Microservices • MySQL • React</span>
      </footer>
    </div>
  );
};

export default App;
