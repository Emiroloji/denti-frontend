// src/modules/category/services/categoryApi.ts

// Import düzeltme
import { api } from '../../../shared/services/api'

export interface Category {
  id: number
  name: string
  color: string
  is_active: boolean
  todo_count?: number
  created_at: string
  updated_at: string
}

export interface CreateCategoryRequest {
  name: string
  color?: string
  is_active?: boolean
}

export interface UpdateCategoryRequest {
  name?: string
  color?: string
  is_active?: boolean
}

export const categoryApi = {
  getAll: () => api.get('/categories'),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: CreateCategoryRequest) => api.post('/categories', data),
  update: (id: number, data: UpdateCategoryRequest) => api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
  getStats: (id: number) => api.get(`/categories/${id}/stats`)
}