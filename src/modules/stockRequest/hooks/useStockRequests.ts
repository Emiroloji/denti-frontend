// src/modules/stockRequest/hooks/useStockRequests.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { stockRequestApi } from '../services/stockRequestApi'
import {
  ApproveStockRequestRequest,
  RejectStockRequestRequest,
  CompleteStockRequestRequest,
  StockRequestFilters
} from '../types/stockRequest.types'

export const useStockRequests = (filters?: StockRequestFilters) => {
  const queryClient = useQueryClient()

  const {
    data: stockRequests,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['stockRequests', filters],
    queryFn: () => stockRequestApi.getAll(filters),
    select: (data) => data.data
  })

  const createMutation = useMutation({
    mutationFn: stockRequestApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockRequests'] })
      queryClient.invalidateQueries({ queryKey: ['stocks'] }) // Stok listesini de güncelle
      message.success('Stok talebi başarıyla oluşturuldu!')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Talep oluşturulurken hata oluştu!')
    }
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ApproveStockRequestRequest }) =>
      stockRequestApi.approve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockRequests'] })
      message.success('Talep başarıyla onaylandı!')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Talep onaylanırken hata oluştu!')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RejectStockRequestRequest }) =>
      stockRequestApi.reject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockRequests'] })
      message.success('Talep reddedildi.')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Talep reddedilirken hata oluştu!')
    }
  })

  const completeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompleteStockRequestRequest }) =>
      stockRequestApi.complete(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockRequests'] })
      queryClient.invalidateQueries({ queryKey: ['stocks'] }) // Stok miktarları değişti
      message.success('Transfer başarıyla tamamlandı!')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Transfer tamamlanırken hata oluştu!')
    }
  })

  return {
    stockRequests,
    isLoading,
    error,
    refetch,
    createStockRequest: createMutation.mutateAsync,
    approveStockRequest: approveMutation.mutateAsync,
    rejectStockRequest: rejectMutation.mutateAsync,
    completeStockRequest: completeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isApproving: approveMutation.isPending,
    isRejecting: rejectMutation.isPending,
    isCompleting: completeMutation.isPending
  }
}

// Tekil talep için hook
export const useStockRequest = (id: number) => {
  return useQuery({
    queryKey: ['stockRequests', id],
    queryFn: () => stockRequestApi.getById(id),
    select: (data) => data.data,
    enabled: !!id
  })
}

// Bekleyen talepler için hook
export const usePendingStockRequests = (clinicId: number) => {
  return useQuery({
    queryKey: ['stockRequests', 'pending', clinicId],
    queryFn: () => stockRequestApi.getPendingByClinic(clinicId),
    select: (data) => data.data,
    enabled: !!clinicId,
    refetchInterval: 30000 // 30 saniyede bir kontrol et
  })
}

// İstatistikler için hook
export const useStockRequestStats = (clinicId?: number) => {
  return useQuery({
    queryKey: ['stockRequests', 'stats', clinicId],
    queryFn: () => stockRequestApi.getStats(clinicId),
    select: (data) => data.data
  })
}