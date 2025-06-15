// src/modules/stock/hooks/useStockMutations.ts

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { stockApi } from '../services/stockApi'
import { UpdateStockRequest } from '../types/stock.types'

export const useStockMutations = () => {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: stockApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stocks'] })
      message.success('Stok başarıyla oluşturuldu!')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      console.error('Create stock error:', error)
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
      console.error('Update stock error:', error)
      message.error(error.response?.data?.message || 'Stok güncellenirken hata oluştu!')
    }
  })

  return {
    createStock: createMutation.mutateAsync,
    updateStock: updateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending
  }
}