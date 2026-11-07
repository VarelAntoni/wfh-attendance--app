import React, { useState, useEffect } from 'react';
import { LogOut, Clock, Compass, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import { StatusBadge } from './StatusBadge';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const datePart = now.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      const timePart = now.toLocaleTimeString('id-ID');
      setTime(`${datePart} • ${timePart} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="w-full px-4 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between min-h-[64px] sm:min-h-[72px] py-3">
          {/* Brand & System Tag */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base tracking-tight shadow-xs">
              <Compass className="w-5 h-5 text-slate-100" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                  WFH Presence
                </span>
                <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/80 hidden sm:inline-block font-medium">
                  v2.1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Sistem Presensi & Monitoring Kepegawaian
              </p>
            </div>
          </div>

          {/* Right Section: Time & User Credentials */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Live Clock with Tabular Figures */}
            <div className="hidden md:flex items-center gap-2.5 text-xs font-mono tabular-nums text-slate-700 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200/90 shadow-2xs">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{time}</span>
            </div>

            {/* User Meta */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-slate-900">
                    {user.fullName}
                  </span>
                  <StatusBadge type="role" value={user.role} size="sm" />
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  {user.nip} {user.department?.name && `• ${user.department.name}`}
                </div>
              </div>

              {/* Logout Action */}
              <button
                onClick={onLogout}
                title="Keluar dari sesi"
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-all shadow-2xs active:scale-98"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
