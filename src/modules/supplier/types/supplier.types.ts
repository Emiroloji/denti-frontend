// src/modules/supplier/types/supplier.types.ts

export interface Supplier {
    id: number
    name: string
    contact_person?: string
    phone?: string
    email?: string
    address?: string
    tax_number?: string
    is_active: boolean
    additional_info?: {
      delivery_time?: string
      discount_rate?: string
      payment_terms?: string
      [key: string]: string | undefined
    }
    created_at: string
    updated_at: string
  }
  
  export interface CreateSupplierRequest {
    name: string
    contact_person?: string
    phone?: string
    email?: string
    address?: string
    tax_number?: string
    is_active?: boolean
    additional_info?: {
      delivery_time?: string
      discount_rate?: string
      payment_terms?: string
      [key: string]: string | undefined
    }
  }
  
  export interface UpdateSupplierRequest {
    name?: string
    contact_person?: string
    phone?: string
    email?: string
    address?: string
    tax_number?: string
    is_active?: boolean
    additional_info?: {
      delivery_time?: string
      discount_rate?: string
      payment_terms?: string
      [key: string]: string | undefined
    }
  }
  
  export interface SupplierFilter {
    name?: string
    is_active?: boolean
    contact_person?: string
  }
  
  export interface SupplierStats {
    total_suppliers: number
    active_suppliers: number
    inactive_suppliers: number
    total_orders?: number
  }