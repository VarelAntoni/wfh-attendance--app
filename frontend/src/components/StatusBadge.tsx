import React from 'react';
import { AttendanceStatus, UserRole, UserStatus } from '../types';

interface StatusBadgeProps {
  type: 'attendance' | 'role' | 'userStatus';
  value: AttendanceStatus | UserRole | UserStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs';

  if (type === 'attendance') {
    if (value === 'PRESENT') {
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          <span>Tepat Waktu</span>
        </span>
      );
    }
    if (value === 'LATE') {
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 shrink-0" />
          <span>Terlambat</span>
        </span>
      );
    }
  }

  if (type === 'role') {
    if (value === 'ADMIN_HRD') {
      return (
        <span className={`inline-flex items-center font-medium rounded-md bg-slate-900 text-slate-100 ${sizeClasses}`}>
          HRD Admin
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
        Karyawan
      </span>
    );
  }

  if (type === 'userStatus') {
    if (value === 'ACTIVE') {
      return (
        <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 ${sizeClasses}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          Aktif
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-md bg-slate-100 text-slate-500 border border-slate-200 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
        Nonaktif
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-md bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses}`}>
      {value}
    </span>
  );
};
