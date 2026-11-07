import React, { useState } from 'react';
import { LogIn, Lock, Mail, ShieldAlert, KeyRound, Compass, CheckCircle } from 'lucide-react';
import { api } from '../api/client';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.login(email, password);
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      onLoginSuccess(response.user, response.accessToken);
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Kombinasi email dan password tidak sesuai.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role: 'HRD' | 'KARYAWAN') => {
    if (role === 'HRD') {
      setEmail('admin@company.com');
      setPassword('admin123');
    } else {
      setEmail('karyawan@company.com');
      setPassword('karyawan123');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-slate-900 text-white shadow-xs mb-3">
            <Compass className="w-5 h-5 text-slate-100" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Workforce Presence Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sistem Presensi WFH & Monitoring Kepegawaian
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-xl shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] border border-slate-200/90 p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Perusahaan
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 transition-colors text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 transition-colors text-slate-900 placeholder-slate-400 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 active:scale-99"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk ke Akun</span>
                </>
              )}
            </button>
          </form>

          {/* Precision Demo Credentials Panel */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <KeyRound className="w-3 h-3 text-slate-400" />
              <span>Akses Cepat Pengujian</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillDemo('HRD')}
                className="p-2.5 text-left rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                  <span>Admin HRD</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate">
                  admin@company.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => fillDemo('KARYAWAN')}
                className="p-2.5 text-left rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors group"
              >
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1">
                  <span>Karyawan WFH</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 truncate">
                  karyawan@company.com
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Technical Stack Signature */}
        <div className="text-center mt-5 text-[11px] font-mono text-slate-400">
          NestJS Microservices (TCP) • MySQL / TypeORM • React
        </div>
      </div>
    </div>
  );
};
