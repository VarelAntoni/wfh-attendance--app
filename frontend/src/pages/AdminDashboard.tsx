import React, { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Building,
  CheckCircle2,
  Clock,
  UserCheck,
  RotateCcw,
} from 'lucide-react';
import { api } from '../api/client';
import { User, Attendance, Department, StatsResponse, UserRole, UserStatus } from '../types';
import { DataTable, Column } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'employees'>('monitoring');

  // Monitoring State
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [monitoringLoading, setMonitoringLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [stats, setStats] = useState<StatsResponse | null>(null);

  // Employees State
  const [employees, setEmployees] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  // Photo Preview Modal
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Employee Form Modal (Create / Edit)
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nip: '',
    fullName: '',
    email: '',
    password: '',
    role: 'KARYAWAN' as UserRole,
    departmentId: '' as string | number,
    position: '',
    phone: '',
    status: 'ACTIVE' as UserStatus,
  });

  // Delete Confirmation Modal
  const [deletingEmployee, setDeletingEmployee] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    api.getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const loadMonitoring = async () => {
    setMonitoringLoading(true);
    try {
      const [attData, statsData] = await Promise.all([
        api.getMonitoring({
          date: selectedDate,
          departmentId: selectedDeptId ? parseInt(selectedDeptId, 10) : undefined,
        }),
        api.getStats(selectedDate),
      ]);
      setAttendances(attData);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching monitoring data:', err);
    } finally {
      setMonitoringLoading(false);
    }
  };

  const loadEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const data = await api.getEmployees({
        departmentId: selectedDeptId ? parseInt(selectedDeptId, 10) : undefined,
      });
      setEmployees(data);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'monitoring') {
      loadMonitoring();
    } else {
      loadEmployees();
    }
  }, [activeTab, selectedDate, selectedDeptId]);

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setFormError(null);
    setFormData({
      nip: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
      fullName: '',
      email: '',
      password: '',
      role: 'KARYAWAN',
      departmentId: departments[0]?.id || '',
      position: '',
      phone: '',
      status: 'ACTIVE',
    });
    setIsEmployeeModalOpen(true);
  };

  const handleOpenEditModal = (emp: User) => {
    setEditingEmployee(emp);
    setFormError(null);
    setFormData({
      nip: emp.nip,
      fullName: emp.fullName,
      email: emp.email,
      password: '',
      role: emp.role,
      departmentId: emp.departmentId || emp.department?.id || '',
      position: emp.position || '',
      phone: emp.phone || '',
      status: emp.status,
    });
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormLoading(true);

    try {
      const payload: any = {
        nip: formData.nip.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        role: formData.role,
        departmentId: formData.departmentId ? Number(formData.departmentId) : undefined,
        position: formData.position.trim(),
        phone: formData.phone.trim(),
        status: formData.status,
      };

      if (formData.password && formData.password.trim() !== '') {
        payload.password = formData.password.trim();
      }

      if (editingEmployee) {
        await api.updateEmployee(editingEmployee.id, payload);
      } else {
        if (!formData.password) {
          payload.password = 'karyawan123';
        }
        await api.createEmployee(payload);
      }

      setIsEmployeeModalOpen(false);
      loadEmployees();
    } catch (err: any) {
      console.error('Error saving employee:', err);
      const msg = err.response?.data?.message || 'Gagal menyimpan data karyawan.';
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;
    setDeleteLoading(true);
    try {
      await api.deleteEmployee(deletingEmployee.id);
      setDeletingEmployee(null);
      loadEmployees();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Gagal menghapus karyawan.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Monitoring Grid Columns
  const monitoringColumns: Column<Attendance>[] = [
    {
      header: 'Foto WFH',
      className: 'w-20 text-center',
      render: (row) => (
        <button
          type="button"
          onClick={() => setPreviewPhotoUrl(row.photoUrl)}
          className="group relative inline-block w-12 h-9 rounded overflow-hidden border border-slate-200 hover:border-slate-400 transition-colors"
        >
          <img
            src={row.photoUrl}
            alt="Foto Bukti"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </button>
      ),
    },
    {
      header: 'Karyawan',
      className: 'min-w-[200px]',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.user?.fullName || 'Karyawan'}</div>
          <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span>{row.user?.nip || '-'}</span>
            <span>•</span>
            <span className="font-sans text-slate-500">{row.user?.department?.name || 'Umum'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Waktu Check-In',
      className: 'whitespace-nowrap font-mono tabular-nums',
      render: (row) => {
        const time = new Date(row.checkInTime);
        return (
          <div>
            <div className="font-semibold text-slate-800 text-xs">
              {time.toLocaleTimeString('id-ID')} WIB
            </div>
            <div className="text-[11px] text-slate-400">{row.attendanceDate}</div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge type="attendance" value={row.status} size="sm" />,
    },
    {
      header: 'Catatan Tugas',
      className: 'min-w-[220px]',
      render: (row) => (
        <span className="text-xs text-slate-600 line-clamp-1">
          {row.notes || '-'}
        </span>
      ),
    },
  ];

  // Employee Master Columns
  const employeeColumns: Column<User>[] = [
    {
      header: 'NIP',
      accessor: 'nip',
      className: 'font-mono text-xs font-semibold text-slate-700 whitespace-nowrap',
    },
    {
      header: 'Nama & Kontak',
      className: 'min-w-[200px]',
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-900">{row.fullName}</div>
          <div className="text-[11px] font-mono text-slate-400">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Departemen & Jabatan',
      className: 'min-w-[180px]',
      render: (row) => (
        <div>
          <div className="text-xs font-medium text-slate-800">
            {row.department?.name || '-'}
          </div>
          <div className="text-[11px] text-slate-500">{row.position || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Role',
      render: (row) => <StatusBadge type="role" value={row.role} size="sm" />,
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge type="userStatus" value={row.status} size="sm" />,
    },
    {
      header: 'Aksi',
      className: 'text-right whitespace-nowrap',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
            title="Edit Karyawan"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {row.nip !== 'HRD-001' && (
            <button
              onClick={() => setDeletingEmployee(row)}
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              title="Hapus Karyawan"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
      {/* Header & Segmented Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Portal Monitoring & Master Data HRD
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit kehadiran harian seluruh karyawan dan manajemen kepegawaian.
          </p>
        </div>

        {/* Minimalist Segmented Tabs */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('monitoring')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'monitoring'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Monitoring Absensi
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'employees'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Master Karyawan
          </button>
        </div>
      </div>

      {/* TAB 1: MONITORING */}
      {activeTab === 'monitoring' && (
        <div className="space-y-5">
          {/* Executive Metrics Overview */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Karyawan
                </span>
                <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">
                  {stats.totalEmployees}
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Presensi Hari Ini
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
                    {stats.totalSubmitted}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    /{stats.totalEmployees}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Tepat Waktu
                </span>
                <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1 block">
                  {stats.presentCount}
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Terlambat
                </span>
                <span className="text-2xl font-bold text-amber-700 font-mono tabular-nums mt-1 block">
                  {stats.lateCount}
                </span>
              </div>
            </div>
          )}

          {/* Precision Filter Bar */}
          <div className="bg-white px-4 py-3 rounded-xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Tanggal:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono tabular-nums focus:outline-none focus:bg-white focus:border-slate-400"
                />
              </div>

              <div className="flex items-center gap-1.5 font-medium text-slate-600">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>Departemen:</span>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs focus:outline-none focus:bg-white focus:border-slate-400"
                >
                  <option value="">Semua Departemen</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                const now = new Date();
                const y = now.getFullYear();
                const m = String(now.getMonth() + 1).padStart(2, '0');
                const d = String(now.getDate()).padStart(2, '0');
                setSelectedDate(`${y}-${m}-${d}`);
                setSelectedDeptId('');
              }}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Hari Ini</span>
            </button>
          </div>

          {/* Monitoring Table */}
          <DataTable
            columns={monitoringColumns}
            data={attendances}
            searchPlaceholder="Cari nama karyawan, NIP, atau catatan..."
            searchFilter={(row, q) =>
              Boolean(
                (row.user?.fullName && row.user.fullName.toLowerCase().includes(q)) ||
                (row.user?.nip && row.user.nip.toLowerCase().includes(q)) ||
                (row.notes && row.notes.toLowerCase().includes(q))
              )
            }
          />
        </div>
      )}

      {/* TAB 2: MASTER EMPLOYEES */}
      {activeTab === 'employees' && (
        <div className="space-y-4">
          <DataTable
            columns={employeeColumns}
            data={employees}
            searchPlaceholder="Cari karyawan..."
            rightAction={
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors active:scale-99"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Karyawan</span>
              </button>
            }
          />
        </div>
      )}

      {/* Photo Lightbox */}
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

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        title={editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-3.5 text-xs">
          {formError && (
            <div className="p-2.5 bg-rose-50 text-rose-800 text-xs rounded-lg border border-rose-200">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                NIP (Nomor Induk)
              </label>
              <input
                type="text"
                required
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 font-mono"
                placeholder="EMP-005"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400"
                placeholder="Nama Karyawan"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400"
                placeholder="karyawan@company.com"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Password {editingEmployee && '(Opsional)'}
              </label>
              <input
                type="password"
                required={!editingEmployee}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400"
                placeholder={editingEmployee ? '••••••••' : 'karyawan123'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Departemen
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400"
              >
                <option value="">Pilih Departemen</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Jabatan
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400"
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Telepon
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400 font-mono"
                placeholder="08123456789"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400"
              >
                <option value="KARYAWAN">Karyawan</option>
                <option value="ADMIN_HRD">Admin HRD</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as UserStatus })
                }
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-slate-400"
              >
                <option value="ACTIVE">Aktif</option>
                <option value="INACTIVE">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEmployeeModalOpen(false)}
              className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-1.5 font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              {formLoading ? 'Menyimpan...' : 'Simpan Data'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingEmployee}
        onClose={() => setDeletingEmployee(null)}
        title="Hapus Karyawan"
        maxWidth="sm"
      >
        {deletingEmployee && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-600">
              Apakah Anda yakin ingin menghapus data{' '}
              <strong className="text-slate-900 font-semibold">{deletingEmployee.fullName}</strong> ({deletingEmployee.nip})?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingEmployee(null)}
                className="px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteEmployee}
                disabled={deleteLoading}
                className="px-3 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                {deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
