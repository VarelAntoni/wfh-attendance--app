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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/90 shadow-[0_1px_2px_0_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand & System Tag */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              <Compass className="w-4 h-4 text-slate-100" />
            </div>
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-slate-900 tracking-tight text-sm sm:text-base">
                WFH Presence
              </span>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/70 hidden sm:inline-block">
                v2.1
              </span>
            </div>
          </div>

          {/* Right Section: Time & User Credentials */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Live Clock with Tabular Figures */}
            <div className="hidden md:flex items-center gap-2 text-xs font-mono tabular-nums text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{time}</span>
            </div>

            {/* User Meta */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-xs font-semibold text-slate-900">
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg transition-colors active:scale-98"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
