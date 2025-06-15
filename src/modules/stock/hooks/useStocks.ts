// src/modules/stock/hooks/useStocks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { stockApi } from '../services/stockApi'
import { 
  UpdateStockRequest, 
  StockAdjustmentRequest,
  StockUsageRequest,
  StockFilter 
} from '../types/stock.types'

export const useStocks = (filters?: StockFilter) => {
  const queryClient = useQueryClient()

  const {
    data: stocks,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['stocks', filters],
    queryFn: () => stockApi.getAll(filters),
    select: (data) => data.data
  })

  const createMutation = useMutation({
    mutationFn: stockApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      message.success('Stok başarıyla oluşturuldu!')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Stok oluşturulurken hata oluştu!')
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateStockRequest }) =>
      stockApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      message.success('Stok başarıyla güncellendi!')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Stok güncellenirken hata oluştu!')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: stockApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      message.success('Stok başarıyla silindi!')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Stok silinirken hata oluştu!')
    }
  })

  const adjustStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: StockAdjustmentRequest }) =>
      stockApi.adjustStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      message.success('Stok miktarı başarıyla ayarlandı!')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Stok ayarlanırken hata oluştu!')
    }
  })

  const useStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: StockUsageRequest }) =>
      stockApi.useStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      message.success('Stok kullanımı başarıyla kaydedildi!')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Stok kullanımı kaydedilirken hata oluştu!')
    }
  })

  return {
    stocks,
    isLoading,
    error,
    refetch,
    createStock: createMutation.mutateAsync,
    updateStock: updateMutation.mutateAsync,
    deleteStock: deleteMutation.mutateAsync,
    adjustStock: adjustStockMutation.mutateAsync,
    useStock: useStockMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAdjusting: adjustStockMutation.isPending,
    isUsing: useStockMutation.isPending
  }
}

// Tekil stok için hook - Backend'de method varsa
export const useStock = (id: number) => {
  return useQuery({
    queryKey: ['stocks', id],
    queryFn: () => stockApi.getById(id),
    select: (data) => data.data,
    enabled: !!id
  })
}

// Stok seviyeleri için hooklar
export const useLowStockItems = () => {
  return useQuery({
    queryKey: ['stocks', 'low-level'],
    queryFn: stockApi.getLowStockItems,
    select: (data) => data.data
  })
}

export const useCriticalStockItems = () => {
  return useQuery({
    queryKey: ['stocks', 'critical-level'],
    queryFn: stockApi.getCriticalStockItems,
    select: (data) => data.data
  })
}

export const useExpiringItems = (days?: number) => {
  return useQuery({
    queryKey: ['stocks', 'expiring', days],
    queryFn: () => stockApi.getExpiringItems(days),
    select: (data) => data.data
  })
}

// Stok istatistikleri için hook
export const useStockStats = () => {
  return useQuery({
    queryKey: ['stocks', 'stats'],
    queryFn: stockApi.getStats,
    select: (data) => data.data
  })
}