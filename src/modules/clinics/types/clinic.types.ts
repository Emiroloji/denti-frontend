// src/modules/clinics/types/clinic.types.ts

export interface Clinic {
  id: number
  name: string
  code: string
  address: string
  phone: string
  email?: string
  manager_name?: string
  description?: string
  is_active: boolean
  city: string
  district: string
  postal_code?: string
  website?: string
  logo_url?: string
  opening_hours?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  created_at: string
  updated_at: string
}

export interface CreateClinicRequest {
  name: string
  code: string
  address: string
  phone: string
  email?: string
  manager_name?: string
  description?: string
  city: string
  district: string
  postal_code?: string
  website?: string
  opening_hours?: string
  is_active?: boolean
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface UpdateClinicRequest {
  name?: string
  code?: string
  address?: string
  phone?: string
  email?: string
  manager_name?: string
  description?: string
  city?: string
  district?: string
  postal_code?: string
  website?: string
  opening_hours?: string
  is_active?: boolean
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface ClinicFilter {
  search?: string
  city?: string
  district?: string
  is_active?: boolean
  manager_name?: string
  page?: number
  per_page?: number
  sort_by?: 'name' | 'code' | 'city' | 'created_at'
  sort_order?: 'asc' | 'desc'
}

export interface ClinicStats {
  total_clinics: number
  active_clinics: number
  inactive_clinics: number
  total_cities: number
  total_districts: number
  clinics_by_city: {
    city: string
    count: number
  }[]
  recent_clinics: Clinic[]
}

export interface ClinicStockSummary {
  clinic_id: number
  clinic_name: string
  total_products: number
  low_stock_products: number
  out_of_stock_products: number
  total_stock_value: number
  last_updated: string
  categories: {
    category_name: string
    product_count: number
    stock_value: number
  }[]
}

export interface ClinicFormData extends CreateClinicRequest {
  logo?: File
}




export interface Stock {
  id: number
  name: string
  code?: string
  description?: string
  category: string
  category_id?: number
  quantity: number
  min_stock: number // Bu field zorunlu
  max_stock?: number
  unit_price?: number
  total_value?: number
  unit?: string
  supplier_id?: number
  supplier_name?: string
  clinic_id: number
  clinic_name?: string
  barcode?: string
  expiry_date?: string
  batch_number?: string
  location?: string
  is_active?: boolean
  created_at: string
  updated_at: string
}