// src/modules/alerts/services/alertApi.ts

import { api } from '@/shared/services/api'
import { ApiResponse } from '@/shared/types/common.types'
import {
  Alert,
  CreateAlertRequest,
  ResolveAlertRequest,
  AlertFilters,
  AlertStats,
  AlertSettings
} from '../types/alert.types'

export const alertApi = {
  // Tüm uyarıları listele
  getAll: (filters?: AlertFilters): Promise<ApiResponse<Alert[]>> => {
    const params = new URLSearchParams()
    
    if (filters?.type) params.append('type', filters.type)
    if (filters?.severity) params.append('severity', filters.severity)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.clinic_id) params.append('clinic_id', filters.clinic_id.toString())
    if (filters?.stock_id) params.append('stock_id', filters.stock_id.toString())
    if (filters?.is_resolved !== undefined) params.append('is_resolved', filters.is_resolved.toString())
    if (filters?.date_from) params.append('date_from', filters.date_from)
    if (filters?.date_to) params.append('date_to', filters.date_to)
    if (filters?.search) params.append('search', filters.search)
    
    const queryString = params.toString()
    return api.get(`/stock-alerts${queryString ? `?${queryString}` : ''}`)
  },

  // Aktif uyarıları getir
  getActive: (clinicId?: number): Promise<ApiResponse<Alert[]>> => {
    const queryString = clinicId ? `?clinic_id=${clinicId}` : ''
    return api.get(`/stock-alerts/active${queryString}`)
  },

  // Uyarı detayı
  getById: (id: number): Promise<ApiResponse<Alert>> =>
    api.get(`/stock-alerts/${id}`),

  // Yeni uyarı oluştur (sistem tarafından)
  create: (data: CreateAlertRequest): Promise<ApiResponse<Alert>> =>
    api.post('/stock-alerts', data),

  // Uyarı çözümle
  resolve: (id: number, data: ResolveAlertRequest): Promise<ApiResponse<Alert>> =>
    api.post(`/stock-alerts/${id}/resolve`, data),

  // Uyarı yok say
  dismiss: (id: number): Promise<ApiResponse<Alert>> =>
    api.post(`/stock-alerts/${id}/dismiss`),

  // Uyarı sil
  delete: (id: number): Promise<ApiResponse<null>> =>
    api.delete(`/stock-alerts/${id}`),

  // Uyarı istatistikleri
  getStats: (clinicId?: number): Promise<ApiResponse<AlertStats>> => {
    const queryString = clinicId ? `?clinic_id=${clinicId}` : ''
    return api.get(`/stock-alerts/statistics${queryString}`)
  },

  // Bekleyen uyarılar (sayı)
  getPendingCount: (clinicId?: number): Promise<ApiResponse<{ count: number }>> => {
    const queryString = clinicId ? `?clinic_id=${clinicId}` : ''
    return api.get(`/stock-alerts/pending/count${queryString}`)
  },

  // Uyarı ayarları
  getSettings: (): Promise<ApiResponse<AlertSettings>> =>
    api.get('/stock-alerts/settings'),

  // Uyarı ayarlarını güncelle
  updateSettings: (settings: Partial<AlertSettings>): Promise<ApiResponse<AlertSettings>> =>
    api.put('/stock-alerts/settings', settings),

  // Toplu uyarı işlemleri
  bulkResolve: (ids: number[], data: ResolveAlertRequest): Promise<ApiResponse<Alert[]>> =>
    api.post('/stock-alerts/bulk/resolve', { ids, ...data }),

  bulkDismiss: (ids: number[]): Promise<ApiResponse<Alert[]>> =>
    api.post('/stock-alerts/bulk/dismiss', { ids }),

  bulkDelete: (ids: number[]): Promise<ApiResponse<null>> =>
    api.post('/stock-alerts/bulk/delete', { ids })
}