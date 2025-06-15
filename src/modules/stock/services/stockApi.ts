// src/modules/stock/services/stockApi.ts

// Import düzeltme - klasör yolu düzeltildi
import { api } from '../../../shared/services/api'
import { 
  Stock, 
  CreateStockRequest, 
  UpdateStockRequest, 
  StockAdjustmentRequest,
  StockUsageRequest,
  StockFilter,
  StockStats 
} from '../types/stock.types'
import { ApiResponse } from '../../../shared/types/common.types'

export const stockApi = {
  // CRUD Operations
  getAll: (filters?: StockFilter): Promise<ApiResponse<Stock[]>> => 
    api.get('/stocks', { params: filters }),
  
  getById: (id: number): Promise<ApiResponse<Stock>> => 
    api.get(`/stocks/${id}`),
  
  create: (data: CreateStockRequest): Promise<ApiResponse<Stock>> => 
    api.post('/stocks', data),
  
  update: (id: number, data: UpdateStockRequest): Promise<ApiResponse<Stock>> => 
    api.put(`/stocks/${id}`, data),
  
  delete: (id: number): Promise<ApiResponse<null>> => 
    api.delete(`/stocks/${id}`),

  // Stock Operations
  adjustStock: (id: number, data: StockAdjustmentRequest): Promise<ApiResponse<Stock>> => 
    api.post(`/stocks/${id}/adjust`, data),
  
  useStock: (id: number, data: StockUsageRequest): Promise<ApiResponse<Stock>> => 
    api.post(`/stocks/${id}/use`, data),

  // Stock Levels
  getLowStockItems: (): Promise<ApiResponse<Stock[]>> => 
    api.get('/stocks/levels/low'),
  
  getCriticalStockItems: (): Promise<ApiResponse<Stock[]>> => 
    api.get('/stocks/levels/critical'),
  
  getExpiringItems: (days?: number): Promise<ApiResponse<Stock[]>> => 
    api.get('/stocks/levels/expiring', { params: { days } }),

  // Statistics
  getStats: (): Promise<ApiResponse<StockStats>> => 
    api.get('/stocks/stats'),

  // Bulk Operations
  bulkUpdate: (ids: number[], data: Partial<UpdateStockRequest>): Promise<ApiResponse<Stock[]>> => 
    api.put('/stocks/bulk-update', { ids, data }),
  
  bulkDelete: (ids: number[]): Promise<ApiResponse<null>> => 
    api.delete('/stocks/bulk-delete', { data: { ids } }),
}