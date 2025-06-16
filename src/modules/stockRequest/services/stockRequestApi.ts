// src/modules/stockRequest/services/stockRequestApi.ts

import { api } from '@/shared/services/api'
import { ApiResponse } from '@/shared/types/common.types'
import {
  StockRequest,
  CreateStockRequestRequest,
  ApproveStockRequestRequest,
  RejectStockRequestRequest,
  CompleteStockRequestRequest,
  StockRequestFilters,
  StockRequestStats
} from '../types/stockRequest.types'

export const stockRequestApi = {
  // Tüm talepleri listele
  getAll: (filters?: StockRequestFilters): Promise<ApiResponse<StockRequest[]>> => {
    const params = new URLSearchParams()
    
    if (filters?.clinic_id) params.append('clinic_id', filters.clinic_id.toString())
    if (filters?.type) params.append('type', filters.type)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.search) params.append('search', filters.search)
    if (filters?.start_date) params.append('start_date', filters.start_date)
    if (filters?.end_date) params.append('end_date', filters.end_date)
    
    const queryString = params.toString()
    return api.get(`/stock-requests${queryString ? `?${queryString}` : ''}`)
  },

  // Talep detayı
  getById: (id: number): Promise<ApiResponse<StockRequest>> =>
    api.get(`/stock-requests/${id}`),

  // Yeni talep oluştur
  create: (data: CreateStockRequestRequest): Promise<ApiResponse<StockRequest>> =>
    api.post('/stock-requests', data),

  // Talebi onayla
  approve: (id: number, data: ApproveStockRequestRequest): Promise<ApiResponse<StockRequest>> =>
    api.put(`/stock-requests/${id}/approve`, data),

  // Talebi reddet
  reject: (id: number, data: RejectStockRequestRequest): Promise<ApiResponse<StockRequest>> =>
    api.put(`/stock-requests/${id}/reject`, data),

  // Transferi tamamla
  complete: (id: number, data: CompleteStockRequestRequest): Promise<ApiResponse<StockRequest>> =>
    api.put(`/stock-requests/${id}/complete`, data),

  // Bekleyen talepler (belirli klinik için)
  getPendingByClinic: (clinicId: number): Promise<ApiResponse<StockRequest[]>> =>
    api.get(`/stock-requests/pending/list?clinic_id=${clinicId}`),

  // İstatistikler
  getStats: (clinicId?: number): Promise<ApiResponse<StockRequestStats>> => {
    const queryString = clinicId ? `?clinic_id=${clinicId}` : ''
    return api.get(`/stock-requests/stats${queryString}`)
  }
}