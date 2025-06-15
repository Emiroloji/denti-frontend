// src/modules/supplier/hooks/useSuppliers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { supplierApi } from '../services/supplierApi'
import { 
  UpdateSupplierRequest, 
  SupplierFilter 
} from '../types/supplier.types'

export const useSuppliers = (filters?: SupplierFilter) => {
  const queryClient = useQueryClient()

  const {
    data: suppliers,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['suppliers', filters],
    queryFn: () => supplierApi.getAll(filters),
    select: (data) => data.data
  })

  const createMutation = useMutation({
    mutationFn: supplierApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      message.success('Tedarikçi başarıyla oluşturuldu!')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Tedarikçi oluşturulurken hata oluştu!')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSupplierRequest }) =>
      supplierApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      message.success('Tedarikçi başarıyla güncellendi!')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Tedarikçi güncellenirken hata oluştu!')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: supplierApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      message.success('Tedarikçi başarıyla silindi!')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Tedarikçi silinirken hata oluştu!')
    }
  })

  return {
    suppliers,
    isLoading,
    error,
    refetch,
    createSupplier: createMutation.mutateAsync,
    updateSupplier: updateMutation.mutateAsync,
    deleteSupplier: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}

// Tekil tedarikçi için hook
export const useSupplier = (id: number) => {
  return useQuery({
    queryKey: ['suppliers', id],
    queryFn: () => supplierApi.getById(id),
    select: (data) => data.data,
    enabled: !!id
  })
}

// Aktif tedarikçiler için hook
export const useActiveSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers', 'active'],
    queryFn: supplierApi.getActive,
    select: (data) => data.data
  })
}

// Tedarikçi istatistikleri için hook
export const useSupplierStats = () => {
  return useQuery({
    queryKey: ['suppliers', 'stats'],
    queryFn: supplierApi.getStats,
    select: (data) => data.data
  })
}