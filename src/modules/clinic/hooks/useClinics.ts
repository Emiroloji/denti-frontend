// src/modules/clinic/hooks/useClinics.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { clinicApi } from '../services/clinicApi'
import { 
  UpdateClinicRequest, 
  ClinicFilter 
} from '../types/clinic.types'

export const useClinics = (filters?: ClinicFilter) => {
  const queryClient = useQueryClient()

  const {
    data: clinics,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['clinics', filters],
    queryFn: () => clinicApi.getAll(filters),
    select: (data) => data.data
  })

  const createMutation = useMutation({
    mutationFn: clinicApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] })
      message.success('Klinik başarıyla oluşturuldu!')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Klinik oluşturulurken hata oluştu!')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClinicRequest }) =>
      clinicApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] })
      message.success('Klinik başarıyla güncellendi!')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Klinik güncellenirken hata oluştu!')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: clinicApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] })
      message.success('Klinik başarıyla silindi!')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Klinik silinirken hata oluştu!')
    }
  })

  return {
    clinics,
    isLoading,
    error,
    refetch,
    createClinic: createMutation.mutateAsync,
    updateClinic: updateMutation.mutateAsync,
    deleteClinic: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}

// Tekil klinik için hook
export const useClinic = (id: number) => {
  return useQuery({
    queryKey: ['clinics', id],
    queryFn: () => clinicApi.getById(id),
    select: (data) => data.data,
    enabled: !!id
  })
}

// Aktif klinikler için hook
export const useActiveClinics = () => {
  return useQuery({
    queryKey: ['clinics', 'active'],
    queryFn: clinicApi.getActive,
    select: (data) => data.data
  })
}

// Klinik istatistikleri için hook
export const useClinicStats = () => {
  return useQuery({
    queryKey: ['clinics', 'stats'],
    queryFn: clinicApi.getStats,
    select: (data) => data.data
  })
}

// Klinik stok özeti için hook
export const useClinicStocks = (clinicId: number) => {
  return useQuery({
    queryKey: ['clinics', clinicId, 'stocks'],
    queryFn: () => clinicApi.getStocks(clinicId),
    select: (data) => data.data,
    enabled: !!clinicId
  })
}

// Klinik summary için hook
export const useClinicSummary = (clinicId: number) => {
  return useQuery({
    queryKey: ['clinics', clinicId, 'summary'],
    queryFn: () => clinicApi.getSummary(clinicId),
    select: (data) => data.data,
    enabled: !!clinicId
  })
}