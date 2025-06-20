// src/modules/stock/services/stockApi.ts

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

// Define proper interface for stock alerts
interface StockAlert {
  id: number
  stock_id: number
  type: 'low_stock' | 'critical_stock' | 'expiring'
  message: string
  is_resolved: boolean
  created_at: string
}

interface AlertCount {
  count: number
}

export const stockApi = {
  // CRUD Operations
  getAll: (filters?: StockFilter): Promise<ApiResponse<Stock[]>> =>
    api.get('/stocks', { params: filters }),

  // Backend'de method yoksa hata vermesin diye try-catch ekle
  getById: async (id: number): Promise<ApiResponse<Stock>> => {
    try {
      return await api.get(`/stocks/${id}`)
    } catch (error) {
      console.warn('getStockById endpoint not available:', error)
      // Fallback: stocks listesinden bul
      const stocksResponse = await api.get('/stocks')
      const stock = stocksResponse.data.find((s: Stock) => s.id === id)
      
      if (stock) {
        return {
          success: true,
          data: stock,
          message: 'Stock found from list'
        } as ApiResponse<Stock>
      }
      
      throw error
    }
  },

  create: (data: CreateStockRequest): Promise<ApiResponse<Stock>> =>
    api.post('/stocks', data),

  update: (id: number, data: UpdateStockRequest): Promise<ApiResponse<Stock>> =>
    api.put(`/stocks/${id}`, data),

  delete: (id: number): Promise<ApiResponse<null>> =>
    api.delete(`/stocks/${id}`),

  // ✅ YENİ ENDPOINT'LER - PASIF/AKTİF/KALICI SİLME
  
  // Soft Delete (Pasif yap)
  softDelete: (id: number): Promise<ApiResponse<Stock>> =>
    api.put(`/stocks/${id}/deactivate`),

  // Hard Delete (Kalıcı sil)
  hardDelete: (id: number): Promise<ApiResponse<null>> =>
    api.delete(`/stocks/${id}/force`),

  // Reaktive et (Pasif'ten aktif'e çevir)
  reactivate: (id: number): Promise<ApiResponse<Stock>> =>
    api.put(`/stocks/${id}/reactivate`),

  // Stock Operations
  adjustStock: (id: number, data: StockAdjustmentRequest): Promise<ApiResponse<Stock>> =>
    api.post(`/stocks/${id}/adjust`, data),

  useStock: (id: number, data: StockUsageRequest): Promise<ApiResponse<Stock>> =>
    api.post(`/stocks/${id}/use`, data),

  // Stock Levels - Hata kontrolü ile
  getLowStockItems: async (): Promise<ApiResponse<Stock[]>> => {
    try {
      return await api.get('/stocks/low-level')
    } catch (error) {
      console.warn('Low stock endpoint error:', error)
      // Fallback: Tüm stokları çek ve filtrele
      try {
        const allStocks = await api.get('/stocks')
        const lowStocks = allStocks.data.filter((stock: Stock) => 
          stock.current_stock <= stock.min_stock_level
        )
        return {
          success: true,
          data: lowStocks,
          message: 'Filtered from all stocks'
        } as ApiResponse<Stock[]>
      } catch {
        return {
          success: false,
          data: [],
          message: 'Could not fetch low stock items'
        } as ApiResponse<Stock[]>
      }
    }
  },

  getCriticalStockItems: async (): Promise<ApiResponse<Stock[]>> => {
    try {
      return await api.get('/stocks/critical-level')
    } catch (error) {
      console.warn('Critical stock endpoint error:', error)
      // Fallback: Tüm stokları çek ve filtrele
      try {
        const allStocks = await api.get('/stocks')
        const criticalStocks = allStocks.data.filter((stock: Stock) => 
          stock.current_stock <= stock.critical_stock_level
        )
        return {
          success: true,
          data: criticalStocks,
          message: 'Filtered from all stocks'
        } as ApiResponse<Stock[]>
      } catch {
        return {
          success: false,
          data: [],
          message: 'Could not fetch critical stock items'
        } as ApiResponse<Stock[]>
      }
    }
  },

  getExpiringItems: async (days?: number): Promise<ApiResponse<Stock[]>> => {
    try {
      return await api.get('/stocks/expiring', { params: { days: days || 30 } })
    } catch (error) {
      console.warn('Expiring items endpoint error:', error)
      // Fallback: Tüm stokları çek ve filtrele
      try {
        const allStocks = await api.get('/stocks')
        const today = new Date()
        const targetDate = new Date()
        targetDate.setDate(today.getDate() + (days || 30))
        
        const expiringStocks = allStocks.data.filter((stock: Stock) => {
          if (!stock.expiry_date) return false
          const expiryDate = new Date(stock.expiry_date)
          return expiryDate <= targetDate && expiryDate >= today
        })
        
        return {
          success: true,
          data: expiringStocks,
          message: 'Filtered from all stocks'
        } as ApiResponse<Stock[]>
      } catch {
        return {
          success: false,
          data: [],
          message: 'Could not fetch expiring items'
        } as ApiResponse<Stock[]>
      }
    }
  },

  // Statistics - Hata kontrolü ile
  getStats: async (): Promise<ApiResponse<StockStats>> => {
    try {
      return await api.get('/stocks/stats')
    } catch (error) {
      console.warn('Stats endpoint error:', error)
      // Fallback: Tüm stokları çek ve manuel hesapla
      try {
        const allStocks = await api.get('/stocks')
        const stocks = allStocks.data as Stock[]
        
        const stats: StockStats = {
          total_items: stocks.length,
          low_stock_items: stocks.filter(s => s.current_stock <= s.min_stock_level).length,
          critical_stock_items: stocks.filter(s => s.current_stock <= s.critical_stock_level).length,
          expiring_items: stocks.filter(s => {
            if (!s.expiry_date) return false
            const expiryDate = new Date(s.expiry_date)
            const today = new Date()
            const thirtyDaysFromNow = new Date()
            thirtyDaysFromNow.setDate(today.getDate() + 30)
            return expiryDate <= thirtyDaysFromNow && expiryDate >= today
          }).length,
          total_value: stocks.reduce((sum, s) => sum + (s.purchase_price * s.current_stock), 0)
        }
        
        return {
          success: true,
          data: stats,
          message: 'Calculated from all stocks'
        } as ApiResponse<StockStats>
      } catch {
        return {
          success: false,
          data: {
            total_items: 0,
            low_stock_items: 0,
            critical_stock_items: 0,
            expiring_items: 0,
            total_value: 0
          },
          message: 'Could not fetch stats'
        } as ApiResponse<StockStats>
      }
    }
  },

  // Bulk Operations
  bulkUpdate: (ids: number[], data: Partial<UpdateStockRequest>): Promise<ApiResponse<Stock[]>> =>
    api.put('/stocks/bulk-update', { ids, data }),

  bulkDelete: (ids: number[]): Promise<ApiResponse<null>> =>
    api.delete('/stocks/bulk-delete', { data: { ids } }),

  // Stock alerts - Sadece backend destekliyorsa kullan
  getStockAlerts: async (): Promise<ApiResponse<StockAlert[]>> => {
    try {
      return await api.get('/stock-alerts')
    } catch (error) {
      console.warn('Stock alerts endpoint not available:', error)
      return {
        success: false,
        data: [],
        message: 'Stock alerts not available'
      } as ApiResponse<StockAlert[]>
    }
  },

  // Alert count - Backend desteklemiyorsa undefined döndür
  getAlertCount: async (): Promise<ApiResponse<AlertCount> | undefined> => {
    try {
      return await api.get('/stock-alerts/count')
    } catch (error) {
      console.warn('Alert count endpoint not available:', error)
      return undefined
    }
  },

  // Pending alert count - Backend desteklemiyorsa undefined döndür
  getPendingAlertCount: async (): Promise<ApiResponse<AlertCount> | undefined> => {
    try {
      return await api.get('/stock-alerts/pending/count')
    } catch (error) {
      console.warn('Pending alert count endpoint not available:', error)
      return undefined
    }
  },
}