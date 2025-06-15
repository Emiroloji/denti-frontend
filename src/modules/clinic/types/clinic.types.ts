// src/modules/clinic/types/clinic.types.ts

export interface Clinic {
    id: number
    name: string
    code: string // Backend'de var (PED, EST, ORT, PER)
    description?: string
    responsible_person?: string // Dr. name
    phone?: string
    location?: string
    is_active: boolean
    created_at: string
    updated_at: string
  }
  
  export interface CreateClinicRequest {
    name: string
    code: string
    description?: string
    responsible_person?: string
    phone?: string
    location?: string
    is_active?: boolean
  }
  
  export interface UpdateClinicRequest {
    name?: string
    code?: string
    description?: string
    responsible_person?: string
    phone?: string
    location?: string
    is_active?: boolean
  }
  
  export interface ClinicFilter {
    name?: string
    code?: string
    responsible_person?: string
    is_active?: boolean
  }
  
  export interface ClinicStats {
    total_clinics: number
    active_clinics: number
    inactive_clinics: number
    total_stocks?: number
  }
  
  export interface ClinicStockSummary {
    clinic_id: number
    clinic_name: string
    total_stock_items: number
    low_stock_items: number
    critical_stock_items: number
    total_stock_value: number
  }