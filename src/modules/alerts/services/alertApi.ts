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
  getAll: async (filters?: AlertFilters): Promise<ApiResponse<Alert[]>> => {
    try {
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
      return await api.get(`/stock-alerts${queryString ? `?${queryString}` : ''}`)
    } catch (error) {
      console.warn('Alert getAll endpoint error:', error)
      return {
        success: false,
        data: [],
        message: 'Could not fetch alerts'
      } as ApiResponse<Alert[]>
    }
  },

  // Aktif uyarıları getir
  getActive: async (clinicId?: number): Promise<ApiResponse<Alert[]>> => {
    try {
      const queryString = clinicId ? `?clinic_id=${clinicId}` : ''
      return await api.get(`/stock-alerts/active${queryString}`)
    } catch (error) {
      console.warn('Alert getActive endpoint error:', error)
      return {
        success: false,
        data: [],
        message: 'Could not fetch active alerts'
      } as ApiResponse<Alert[]>
    }
  },

  // Uyarı detayı
  getById: async (id: number): Promise<ApiResponse<Alert>> => {
    try {
      return await api.get(`/stock-alerts/${id}`)
    } catch (error) {
      console.warn('Alert getById endpoint error:', error)
      throw error
    }
  },

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
  getStats: async (clinicId?: number): Promise<ApiResponse<AlertStats>> => {
    try {
      const queryString = clinicId ? `?clinic_id=${clinicId}` : ''
      return await api.get(`/stock-alerts/statistics${queryString}`)
    } catch (error) {
      console.warn('Alert stats endpoint error:', error)
      return {
        success: false,
        data: {
          total: 0,
          active: 0,
          resolved: 0,
          dismissed: 0,
          critical: 0,
          warning: 0,
          info: 0,
          by_severity: {
            low: 0,
            medium: 0,
            high: 0,
            critical: 0
          },
          by_type: {
            low_stock: 0,
            critical_stock: 0,
            out_of_stock: 0,
            expiry_warning: 0,
            expiry_critical: 0,
            expired: 0,
            stock_request: 0,
            stock_transfer: 0,
            system: 0
          }
        } as AlertStats,
        message: 'Could not fetch alert stats'
      } as ApiResponse<AlertStats>
    }
  },

  // Bekleyen uyarılar (sayı) - EN PROBLEM YARATAN ENDPOINT!
  getPendingCount: async (clinicId?: number): Promise<ApiResponse<{ count: number }>> => {
    try {
      const queryString = clinicId ? `?clinic_id=${clinicId}` : ''
      return await api.get(`/stock-alerts/pending/count${queryString}`)
    } catch (error) {
      console.warn('❌ Pending count endpoint error (404):', error)
      // 404 hatası varsa mock data döndür
      return {
        success: true,
        data: { count: 0 },
        message: 'Pending count endpoint not available - returning mock data'
      } as ApiResponse<{ count: number }>
    }
  },

  // Uyarı ayarları
  getSettings: async (): Promise<ApiResponse<AlertSettings>> => {
    try {
      return await api.get('/stock-alerts/settings')
    } catch (error) {
      console.warn('Alert settings endpoint error:', error)
      return {
        success: false,
        data: {} as AlertSettings,
        message: 'Could not fetch alert settings'
      } as ApiResponse<AlertSettings>
    }
  },

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