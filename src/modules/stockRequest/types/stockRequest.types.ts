// src/modules/stockRequest/types/stockRequest.types.ts

export interface StockRequest {
    id: number
    requester_clinic_id: number
    requested_from_clinic_id: number
    stock_id: number
    requested_quantity: number
    approved_quantity?: number
    request_reason: string
    rejection_reason?: string
    notes?: string
    status: StockRequestStatus
    requested_by: string
    approved_by?: string
    rejected_by?: string
    performed_by?: string
    requested_at: string
    approved_at?: string
    rejected_at?: string
    completed_at?: string
    created_at: string
    updated_at: string
    
    // Relations
    requester_clinic?: {
      id: number
      name: string
      specialty_code?: string
    }
    requested_from_clinic?: {
      id: number
      name: string
      specialty_code?: string
    }
    stock?: {
      id: number
      name: string
      current_stock: number
      min_stock_level: number
      unit: string
      category: string
      brand?: string
    }
  }
  
  export type StockRequestStatus = 
    | 'pending' 
    | 'approved' 
    | 'rejected' 
    | 'completed'
  
  export interface CreateStockRequestRequest {
    requester_clinic_id: number
    requested_from_clinic_id: number
    stock_id: number
    requested_quantity: number
    request_reason: string
    requested_by: string
  }
  
  export interface ApproveStockRequestRequest {
    approved_quantity: number
    approved_by: string
    notes?: string
  }
  
  export interface RejectStockRequestRequest {
    rejection_reason: string
    rejected_by: string
  }
  
  export interface CompleteStockRequestRequest {
    performed_by: string
  }
  
  export interface StockRequestFilters {
    clinic_id?: number
    type?: 'sent' | 'received'
    status?: StockRequestStatus
    search?: string
    start_date?: string
    end_date?: string
  }
  
  export interface StockRequestStats {
    total: number
    pending: number
    approved: number
    rejected: number
    completed: number
  }