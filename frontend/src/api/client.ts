import axios from 'axios';
import { AuthResponse, User, Department, Attendance, StatsResponse } from '../types';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export const api = {
  // Auth API
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    return res.data;
  },
  getProfile: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/profile');
    return res.data;
  },

  // Attendance API
  checkIn: async (formData: FormData): Promise<Attendance> => {
    const res = await apiClient.post<Attendance>('/attendance/check-in', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  checkInBase64: async (photoBase64: string, notes?: string): Promise<Attendance> => {
    const res = await apiClient.post<Attendance>('/attendance/check-in', {
      photoBase64,
      notes,
    });
    return res.data;
  },
  getMyHistory: async (): Promise<Attendance[]> => {
    const res = await apiClient.get<Attendance[]>('/attendance/my-history');
    return res.data;
  },
  getTodayStatus: async (): Promise<{ checkedIn: boolean; attendance: Attendance | null }> => {
    const res = await apiClient.get<{ checkedIn: boolean; attendance: Attendance | null }>(
      '/attendance/today-status',
    );
    return res.data;
  },
  getMonitoring: async (params?: { date?: string; search?: string; departmentId?: number }): Promise<Attendance[]> => {
    const res = await apiClient.get<Attendance[]>('/attendance/monitoring', { params });
    return res.data;
  },
  getStats: async (date?: string): Promise<StatsResponse> => {
    const res = await apiClient.get<StatsResponse>('/attendance/stats', { params: { date } });
    return res.data;
  },

  // Employee CRUD API
  getEmployees: async (params?: { search?: string; departmentId?: number }): Promise<User[]> => {
    const res = await apiClient.get<User[]>('/employees', { params });
    return res.data;
  },
  getEmployeeById: async (id: number): Promise<User> => {
    const res = await apiClient.get<User>(`/employees/${id}`);
    return res.data;
  },
  createEmployee: async (data: Partial<User> & { password?: string }): Promise<User> => {
    const res = await apiClient.post<User>('/employees', data);
    return res.data;
  },
  updateEmployee: async (id: number, data: Partial<User> & { password?: string }): Promise<User> => {
    const res = await apiClient.put<User>(`/employees/${id}`, data);
    return res.data;
  },
  deleteEmployee: async (id: number): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/employees/${id}`);
    return res.data;
  },
  getDepartments: async (): Promise<Department[]> => {
    const res = await apiClient.get<Department[]>('/employees/departments');
    return res.data;
  },
};
