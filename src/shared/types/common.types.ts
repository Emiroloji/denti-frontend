// src/shared/types/common.types.ts

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

export interface SelectOption {
  label: string
  value: string | number
}

export interface User {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
}

export interface Supplier {
  id: number
  name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Clinic {
  id: number
  name: string
  location?: string
  manager?: string
  phone?: string
  is_active: boolean
  created_at: string
  updated_at: string
}