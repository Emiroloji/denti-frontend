// src/modules/clinic/services/clinicApi.ts

import { api } from '../../../shared/services/api'
import { 
  Clinic, 
  CreateClinicRequest, 
  UpdateClinicRequest, 
  ClinicFilter,
  ClinicStats,
  ClinicStockSummary
} from '../types/clinic.types'
import { Stock } from '../../stock/types/stock.types'
import { ApiResponse } from '../../../shared/types/common.types'

export const clinicApi = {
  // CRUD Operations
  getAll: (filters?: ClinicFilter): Promise<ApiResponse<Clinic[]>> => 
    api.get('/clinics', { params: filters }),
  
  getById: (id: number): Promise<ApiResponse<Clinic>> => 
    api.get(`/clinics/${id}`),
  
  create: (data: CreateClinicRequest): Promise<ApiResponse<Clinic>> => 
    api.post('/clinics', data),
  
  update: (id: number, data: UpdateClinicRequest): Promise<ApiResponse<Clinic>> => 
    api.put(`/clinics/${id}`, data),
  
  delete: (id: number): Promise<ApiResponse<null>> => 
    api.delete(`/clinics/${id}`),

  // Active clinics list
  getActive: (): Promise<ApiResponse<Clinic[]>> => 
    api.get('/clinics/active/list'),

  // Clinic specific endpoints
  getStocks: (id: number): Promise<ApiResponse<Stock[]>> => 
    api.get(`/clinics/${id}/stocks`),

  getSummary: (id: number): Promise<ApiResponse<ClinicStockSummary>> => 
    api.get(`/clinics/${id}/summary`),

  // Statistics
  getStats: (): Promise<ApiResponse<ClinicStats>> => 
    api.get('/clinics/stats'),
}