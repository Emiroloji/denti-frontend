import { api } from '@/shared/services/api'
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '../types/category.types'
import { ApiResponse } from '@/shared/types/common.types'

export const categoryApi = {
  getAll: (): Promise<ApiResponse<Category[]>> => 
    api.get('/categories'),
  
  create: (data: CreateCategoryRequest): Promise<ApiResponse<Category>> => 
    api.post('/categories', data),
  
  update: (id: number, data: UpdateCategoryRequest): Promise<ApiResponse<Category>> => 
    api.put(`/categories/${id}`, data),
  
  delete: (id: number): Promise<ApiResponse<null>> => 
    api.delete(`/categories/${id}`)
}