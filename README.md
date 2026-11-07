# Fullstack Developer Skill Test: WFH Attendance & Employee Monitoring System

Sistem aplikasi web fullstack untuk **Presensi Kerja Dari Rumah (WFH)** dan **Monitoring & Master Data Karyawan (HRD)** menggunakan **NestJS Microservices (TCP Transport)**, **Database MySQL / PostgreSQL / SQLite (TypeORM)**, dan **React.js (TypeScript + Vite + Tailwind CSS)**.

---

## 📌 Ringkasan Pemenuhan Kualifikasi & Objective

| Persyaratan Test | Implementasi | Status |
| :--- | :--- | :---: |
| **Backend Framework** | **NestJS (TypeScript)** |  Selesai |
| **Microservices Concept** | **NestJS Microservices (TCP Transporters)** dengan **API Gateway**, **Employee Service**, dan **Attendance Service** |  Selesai |
| **Database Structure & Manipulation** | Relasi antar tabel `departments`, `users`, dan `attendances` dengan operasi CRUD lengkap via API |  Selesai |
| **Multi-Database Support** | Dukungan **MySQL** (direkomendasikan/preferensi), **PostgreSQL**, dan **SQLite** via TypeORM |  Selesai |
| **Frontend Framework** | **React.js (TypeScript + Vite + Tailwind CSS)** |  Selesai |
| **Custom Components** | `WebcamCapture` (Live Camera & Canvas Snapshot), `DataTable` (Search & Pagination), `Modal`, `StatusBadge`, `Navbar` |  Selesai |
| **Use Case 1: Absensi WFH** | Login Karyawan, auto-capture tanggal & waktu akurat, upload bukti foto selfie WFH, cek duplikasi harian, riwayat kehadiran |  Selesai |
| **Use Case 2: Monitoring HRD** | Login Admin HRD, CRUD Master Data Karyawan, kontrol rekap kehadiran WFH (View Only) dengan filter tanggal & foto bukti |  Selesai |

---

## 🏛️ Arsitektur Sistem (NestJS Microservices)

```
                               ┌────────────────────────────────────────────────────────┐
                               │             Frontend (React.js + Vite)                 │
                               │                http://localhost:5173                   │
                               └───────────────────────────┬────────────────────────────┘
                                                           │ HTTP / REST & Multipart
                                                           ▼
                               ┌────────────────────────────────────────────────────────┐
                               │             NestJS API Gateway (Port 3000)             │
                               │  - Routing & CORS      - Multer Upload /uploads        │
                               │  - JWT & Roles Guard   - Serving Static Assets         │
                               └─────────────┬────────────────────────────┬─────────────┘
                                             │ TCP (ClientProxy)          │ TCP (ClientProxy)
                                             ▼                            ▼
                 ┌──────────────────────────────────────┐     ┌───────────────────────────────────────┐
                 │    Employee Service (Port 3001)      │     │    Attendance Service (Port 3002)     │
                 │  - Validasi Login & Bcrypt Hash      │     │  - Pencatatan Presensi WFH            │
                 │  - CRUD Master Data Karyawan         │     │  - Validasi 1x Absen / Hari           │
                 │  - Manajemen Departemen              │     │  - Query Rekap Monitoring HRD         │
                 │  - Auto-seeding Akun Demo            │     │  - Statistik Kehadiran Harian         │
                 └──────────────────┬───────────────────┘     └───────────────────┬───────────────────┘
                                    │                                             │
                                    └──────────────────────┬──────────────────────┘
                                                           ▼
                                      ┌────────────────────────────────────────┐
                                      │       Database (MySQL / TypeORM)       │
                                      │   - departments    - users             │
                                      │   - attendances                        │
                                      └────────────────────────────────────────┘
```

---

## 🔑 Kredensial Akun Pengujian (Demo Accounts)

Sistem telah dilengkapi fitur **auto-seeding** pada saat backend pertama kali dijalankan:

1. **Admin HRD (Akses Penuh Master Data & Monitoring)**:
   - Email: `admin@company.com`
   - Password: `admin123`
   - NIP: `HRD-001`
   - Role: `ADMIN_HRD`

2. **Karyawan WFH (Akses Absensi & Riwayat Kehadiran)**:
   - Email: `karyawan@company.com`
   - Password: `karyawan123`
   - NIP: `EMP-001`
   - Role: `KARYAWAN`

*(Tersedia tombol **Akses Cepat Demo** di halaman login untuk mengisi email & password secara otomatis)*.

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat
- **Node.js**: v18+ atau v20+ / v22+
- **Docker** (Opsional, untuk MySQL) atau database MySQL lokal.

### 2. Setup Database (MySQL)
Jika menggunakan Docker:
```bash
docker compose up -d
```
Konfigurasi database berada di file `backend/.env`. Untuk beralih ke MySQL:
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=wfh_attendance
```
*(Catatan: Secara default `DB_TYPE=sqlite` sudah aktif dan siap dijalankan secara zero-config tanpa perlu setup database server terlebih dahulu)*.

### 3. Menjalankan Backend Microservices
Buka terminal dan jalankan:
```bash
cd backend
npm install
npm run start:all
```
Perintah ini akan menjalankan:
- **API Gateway**: `http://localhost:3000`
- **Employee Microservice**: TCP `127.0.0.1:3001`
- **Attendance Microservice**: TCP `127.0.0.1:3002`

### 4. Menjalankan Frontend (React.js)
Buka terminal baru dan jalankan:
```bash
cd frontend
npm install
npm run dev
```
Akses aplikasi melalui browser:
👉 **`http://localhost:5173`**

---

## 📱 Fitur Utama Aplikasi

### 1. Aplikasi Absensi WFH Karyawan
- **Digital Clock Realtime**: Menampilkan hari, tanggal, dan jam secara akurat.
- **Custom Webcam Component**:
  - Live preview stream kamera laptop karyawan.
  - Tombol Capture untuk mengambil snapshot dengan watermark tanggal & waktu kehadiran.
  - Tombol Retake jika ingin mengambil ulang.
  - Fallback tombol Upload File jika kamera tidak memiliki izin / tidak tersedia.
- **Validasi Anti Duplikasi**: Mencegah karyawan melakukan absensi lebih dari 1 kali di hari yang sama.
- **Riwayat Absensi Pribadi**: Tabel riwayat kehadiran lengkap dengan status (*Tepat Waktu / Terlambat*), catatan pekerjaan, dan thumbnail foto yang dapat diklik untuk pratinjau resolusi tinggi.

### 2. Aplikasi Monitoring Karyawan (HRD)
- **Ringkasan Statistik Kehadiran**: Widget metrik Total Karyawan, Hadir Hari Ini, Tepat Waktu, Terlambat, dan Belum Absen.
- **Monitoring Kehadiran (View Only)**:
  - Rekap absensi WFH seluruh karyawan.
  - Filter interaktif berdasarkan **Tanggal Presensi** dan **Departemen**.
  - Fitur pencarian instan nama karyawan, NIP, atau catatan tugas.
  - Pratinjau foto bukti WFH langsung dari browser.
- **Master Data Karyawan (CRUD)**:
  - Tambah Karyawan Baru (dengan pemilihan Departemen, NIP, Jabatan, Role, Status).
  - Edit Data Karyawan (dapat mengubah data atau reset password).
  - Hapus Karyawan (dilengkapi modal konfirmasi keamanan).

---

## 🔌 Dokumentasi REST API (API Gateway)

| Method | Endpoint | Role | Deskripsi |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/auth/login` | Public | Login dan mendapatkan JWT Access Token |
| `GET` | `/api/auth/profile` | Auth | Mendapatkan data profil user yang sedang login |
| `POST` | `/api/attendance/check-in` | Karyawan | Submit presensi WFH (multipart/base64 photo + notes) |
| `GET` | `/api/attendance/today-status` | Karyawan | Cek apakah user sudah absen hari ini |
| `GET` | `/api/attendance/my-history` | Karyawan | Riwayat presensi user yang sedang login |
| `GET` | `/api/attendance/monitoring` | Admin HRD | Rekap absensi seluruh karyawan (filter date/search) |
| `GET` | `/api/attendance/stats` | Admin HRD | Ringkasan statistik kehadiran harian |
| `GET` | `/api/employees` | Admin HRD | Daftar master data karyawan |
| `POST` | `/api/employees` | Admin HRD | Menambahkan karyawan baru |
| `GET` | `/api/employees/:id` | Admin HRD | Detail data karyawan |
| `PUT` | `/api/employees/:id` | Admin HRD | Memperbarui data karyawan |
| `DELETE` | `/api/employees/:id` | Admin HRD | Menghapus data karyawan |
| `GET` | `/api/employees/departments`| Admin HRD | Daftar departemen |
