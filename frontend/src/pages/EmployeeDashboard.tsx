import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  History,
  FileText,
  Eye,
  Camera,
  Check,
} from 'lucide-react';
import { api } from '../api/client';
import { User, Attendance } from '../types';
import { WebcamCapture } from '../components/WebcamCapture';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

interface EmployeeDashboardProps {
  user: User;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user }) => {
  const [todayStatus, setTodayStatus] = useState<{
    checkedIn: boolean;
    attendance: Attendance | null;
  }>({ checkedIn: false, attendance: null });
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<{
    base64?: string;
    file?: File;
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [alertMsg, setAlertMsg] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [todayRes, historyRes] = await Promise.all([
        api.getTodayStatus(),
        api.getMyHistory(),
      ]);
      setTodayStatus(todayRes);
      setHistory(historyRes);
    } catch (err: any) {
      console.error('Error loading employee data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertMsg(null);

    if (!capturedPhoto) {
      setAlertMsg({
        type: 'error',
        text: 'Ambil foto selfie melalui kamera atau unggah berkas foto bukti WFH terlebih dahulu.',
      });
      return;
    }

    setSubmitting(true);
    try {
      let result: Attendance;
      if (capturedPhoto.file) {
        const formData = new FormData();
        formData.append('photo', capturedPhoto.file);
        formData.append('notes', notes);
        result = await api.checkIn(formData);
      } else if (capturedPhoto.base64) {
        result = await api.checkInBase64(capturedPhoto.base64, notes);
      } else {
        throw new Error('Tidak ada data foto yang ditemukan.');
      }

      setAlertMsg({
        type: 'success',
        text: 'Presensi WFH Anda berhasil tercatat di sistem!',
      });
      setTodayStatus({ checkedIn: true, attendance: result });
      setHistory((prev) => [result, ...prev]);
      setCapturedPhoto(null);
      setNotes('');
    } catch (err: any) {
      console.error('Check-in error:', err);
      const msg = err.response?.data?.message || 'Gagal mengirim absensi WFH.';
      setAlertMsg({ type: 'error', text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const historyColumns: Column<Attendance>[] = [
    {
      header: 'Tanggal',
      accessor: 'attendanceDate',
      className: 'font-mono text-slate-800 whitespace-nowrap',
      render: (row) => (
        <span className="font-semibold text-slate-900">
          {row.attendanceDate}
        </span>
      ),
    },
    {
      header: 'Waktu Check-In',
      className: 'whitespace-nowrap font-mono tabular-nums text-slate-600',
      render: (row) => {
        const t = new Date(row.checkInTime);
        return <span>{t.toLocaleTimeString('id-ID')} WIB</span>;
      },
    },
    {
      header: 'Bukti Foto',
      className: 'text-center w-20',
      render: (row) => (
        <button
          type="button"
          onClick={() => setPreviewPhotoUrl(row.photoUrl)}
          className="group relative inline-block w-12 h-9 rounded overflow-hidden border border-slate-200 hover:border-slate-400 transition-colors"
        >
          <img
            src={row.photoUrl}
            alt="Bukti WFH"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </button>
      ),
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge type="attendance" value={row.status} size="sm" />,
    },
    {
      header: 'Catatan Kerja',
      render: (row) => (
        <span className="text-slate-600 line-clamp-1 max-w-xs text-xs">
          {row.notes || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-8 space-y-6">
      {/* Precision Header Banner */}
      <div className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Presensi Kehadiran WFH
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {user.position || 'Karyawan'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Verifikasi kehadiran kerja dari rumah untuk <span className="font-semibold text-slate-800">{user.fullName}</span> (NIP: {user.nip}).
          </p>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/90">
          <span className="text-xs font-medium text-slate-500">Status Hari Ini:</span>
          {todayStatus.checkedIn ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Tercatat Hadir
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              Belum Presensi
            </span>
          )}
        </div>
      </div>

      {/* Alert Notice */}
      {alertMsg && (
        <div
          className={`p-3.5 rounded-lg flex items-start gap-2.5 text-xs border ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {alertMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{alertMsg.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Check-In / Already Checked In */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
          {todayStatus.checkedIn && todayStatus.attendance ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
                  Bukti Presensi Hari Ini
                </span>
                <StatusBadge type="attendance" value={todayStatus.attendance.status} size="sm" />
              </div>

              {/* Verified Photo Card */}
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-slate-200 group">
                <img
                  src={todayStatus.attendance.photoUrl}
                  alt="Bukti Kehadiran Hari Ini"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPreviewPhotoUrl(todayStatus.attendance!.photoUrl)}
                  className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-medium gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Lihat Foto Resolusi Penuh
                </button>
              </div>

              {/* Key Details */}
              <div className="bg-slate-50/80 rounded-lg p-3 space-y-2 text-xs border border-slate-200/60 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tanggal:</span>
                  <span className="text-slate-800 font-semibold">{todayStatus.attendance.attendanceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jam Check-In:</span>
                  <span className="text-slate-800 tabular-nums">
                    {new Date(todayStatus.attendance.checkInTime).toLocaleTimeString('id-ID')} WIB
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200/50">
                  <span className="text-slate-400 block mb-1">Catatan Tugas:</span>
                  <p className="bg-white p-2 rounded border border-slate-200 text-slate-800 font-sans text-xs">
                    {todayStatus.attendance.notes || 'Bekerja Dari Rumah (WFH)'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCheckInSubmit} className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-slate-600" />
                  Verifikasi Kehadiran WFH
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Ambil foto selfie di tempat kerja rumah Anda sebagai bukti kehadiran.
                </p>
              </div>

              {/* Optical Viewfinder Webcam */}
              <WebcamCapture onPhotoCaptured={setCapturedPhoto} />

              {/* Notes Input */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Rencana Pekerjaan Hari Ini (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Menyelesaikan API microservices dan sinkronisasi database..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 transition-colors text-slate-800"
                />
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={submitting || !capturedPhoto}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center gap-2 active:scale-99"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Merekam Kehadiran...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Kirim Presensi WFH Sekarang</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Attendance History */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" />
              Riwayat Presensi Pribadi
            </h2>
          </div>

          <DataTable
            columns={historyColumns}
            data={history}
            searchPlaceholder="Filter riwayat..."
            pageSize={6}
            searchFilter={(row, q) =>
              Boolean(
                row.attendanceDate.toLowerCase().includes(q) ||
                (row.notes && row.notes.toLowerCase().includes(q))
              )
            }
          />
        </div>
      </div>

      {/* High-Res Photo Lightbox */}
      <Modal
        isOpen={!!previewPhotoUrl}
        onClose={() => setPreviewPhotoUrl(null)}
        title="Bukti Foto Presensi WFH"
        maxWidth="lg"
      >
        {previewPhotoUrl && (
          <div className="flex flex-col items-center">
            <div className="w-full max-h-[70vh] rounded-lg overflow-hidden bg-slate-950 border border-slate-200">
              <img
                src={previewPhotoUrl}
                alt="Bukti Foto WFH"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-3 text-[11px] font-mono text-slate-400 text-center">
              URI: {previewPhotoUrl}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
