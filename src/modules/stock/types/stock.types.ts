// src/modules/stock/types/stock.types.ts

export interface Stock {
  id: number
  name: string
  description?: string
  brand?: string // Backend'de var
  unit: string
  category: string
  
  // Backend'deki alan adları ile uyumlu
  current_stock: number // Backend: current_stock
  min_stock_level: number // Backend: min_stock_level  
  critical_stock_level: number // Backend: critical_stock_level
  yellow_alert_level?: number // Backend: yellow_alert_level
  red_alert_level?: number // Backend: red_alert_level
  
  // Fiyat Bilgileri
  purchase_price: number
  currency?: string
  
  // Tedarikçi Bilgileri
  supplier_id: number
  supplier?: {
    id: number
    name: string
    contact_person?: string
    phone?: string
    email?: string
  }
  
  // Klinik Bilgileri
  clinic_id: number
  clinic?: {
    id: number
    name: string
    location?: string
  }
  
  // Tarih Bilgileri
  purchase_date: string
  expiry_date?: string
  
  // Backend'deki ek alanlar
  track_expiry?: boolean
  track_batch?: boolean
  storage_location?: string
  
  // Durum Bilgileri
  is_active?: boolean
  
  // Sistem Tarihleri
  created_at?: string
  updated_at?: string
}

export interface CreateStockRequest {
  name: string
  description?: string
  brand?: string
  unit: string
  category: string
  
  // Backend alan adları ile uyumlu
  current_stock: number
  min_stock_level: number
  critical_stock_level: number
  yellow_alert_level?: number
  red_alert_level?: number
  
  purchase_price: number
  currency?: string
  supplier_id: number
  clinic_id: number
  purchase_date: string // ISO string format
  expiry_date?: string // ISO string format
  
  // Backend'deki ek alanlar
  track_expiry?: boolean
  track_batch?: boolean
  storage_location?: string
  is_active?: boolean
}

export interface UpdateStockRequest {
  name?: string
  description?: string
  brand?: string
  unit?: string
  category?: string
  min_stock_level?: number
  critical_stock_level?: number
  yellow_alert_level?: number
  red_alert_level?: number
  purchase_price?: number
  currency?: string
  supplier_id?: number
  clinic_id?: number
  expiry_date?: string
  track_expiry?: boolean
  track_batch?: boolean
  storage_location?: string
  is_active?: boolean
}

export interface StockAdjustmentRequest {
  quantity: number
  type: 'increase' | 'decrease'
  reason: string
  notes?: string
  performed_by: string // Backend'de zorunlu
}

export interface StockUsageRequest {
  quantity: number
  reason: string
  notes?: string
  used_by?: string
  performed_by: string // Backend'de zorunlu
}

export interface StockLevel {
  level: 'normal' | 'low' | 'critical' | 'expired'
  color: 'green' | 'yellow' | 'red' | 'gray'
  message: string
}

export interface StockFilter {
  name?: string
  category?: string
  supplier_id?: number
  clinic_id?: number
  status?: string
  level?: 'normal' | 'low' | 'critical' | 'expired'
  expiry_days?: number
}

export interface StockStats {
  total_items: number
  low_stock_items: number
  critical_stock_items: number
  expiring_items: number
  total_value: number
}