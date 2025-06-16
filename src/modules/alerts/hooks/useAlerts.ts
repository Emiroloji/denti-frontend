// src/modules/alerts/hooks/useAlerts.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message, notification } from 'antd'
import { alertApi } from '../services/alertApi'
import {
  ResolveAlertRequest,
  AlertFilters
} from '../types/alert.types'

export const useAlerts = (filters?: AlertFilters) => {
  const queryClient = useQueryClient()

  const {
    data: alerts,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['alerts', filters],
    queryFn: () => alertApi.getAll(filters),
    select: (data) => data.data,
    refetchInterval: 30000 // 30 saniyede bir yenile
  })

  const createMutation = useMutation({
    mutationFn: alertApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alertStats'] })
      
      // Kritik uyarılar için browser notification
      if (data.data.severity === 'critical') {
        notification.error({
          message: 'Kritik Uyarı!',
          description: data.data.message,
          duration: 0, // Kalıcı notification
          placement: 'topRight'
        })
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Uyarı oluşturulurken hata oluştu!')
    }
  })

  const resolveMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ResolveAlertRequest }) =>
      alertApi.resolve(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alertStats'] })
      message.success('Uyarı çözümlendi!')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Uyarı çözümlenirken hata oluştu!')
    }
  })

  const dismissMutation = useMutation({
    mutationFn: alertApi.dismiss,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alertStats'] })
      message.success('Uyarı yok sayıldı.')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Uyarı yok sayılırken hata oluştu!')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: alertApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alertStats'] })
      message.success('Uyarı silindi.')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Uyarı silinirken hata oluştu!')
    }
  })

  const bulkResolveMutation = useMutation({
    mutationFn: ({ ids, data }: { ids: number[]; data: ResolveAlertRequest }) =>
      alertApi.bulkResolve(ids, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alertStats'] })
      message.success(`${data.data.length} uyarı çözümlendi!`)
    }
  })

  const bulkDismissMutation = useMutation({
    mutationFn: alertApi.bulkDismiss,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alertStats'] })
      message.success(`${data.data.length} uyarı yok sayıldı!`)
    }
  })

  return {
    alerts,
    isLoading,
    error,
    refetch,
    createAlert: createMutation.mutateAsync,
    resolveAlert: resolveMutation.mutateAsync,
    dismissAlert: dismissMutation.mutateAsync,
    deleteAlert: deleteMutation.mutateAsync,
    bulkResolveAlerts: bulkResolveMutation.mutateAsync,
    bulkDismissAlerts: bulkDismissMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isResolving: resolveMutation.isPending,
    isDismissing: dismissMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkProcessing: bulkResolveMutation.isPending || bulkDismissMutation.isPending
  }
}

// Aktif uyarılar için hook
export const useActiveAlerts = (clinicId?: number) => {
  return useQuery({
    queryKey: ['alerts', 'active', clinicId],
    queryFn: () => alertApi.getActive(clinicId),
    select: (data) => data.data,
    refetchInterval: 15000, // 15 saniyede bir yenile
    staleTime: 10000 // 10 saniye fresh tut
  })
}

// Bekleyen uyarı sayısı için hook
export const usePendingAlertCount = (clinicId?: number) => {
  return useQuery({
    queryKey: ['alerts', 'pending', 'count', clinicId],
    queryFn: () => alertApi.getPendingCount(clinicId),
    select: (data) => data.data.count,
    refetchInterval: 30000 // 30 saniyede bir yenile
  })
}

// Uyarı istatistikleri için hook
export const useAlertStats = (clinicId?: number) => {
  return useQuery({
    queryKey: ['alertStats', clinicId],
    queryFn: () => alertApi.getStats(clinicId),
    select: (data) => data.data,
    refetchInterval: 60000 // 1 dakikada bir yenile
  })
}

// Uyarı ayarları için hook
export const useAlertSettings = () => {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['alertSettings'],
    queryFn: alertApi.getSettings,
    select: (data) => data.data
  })

  const updateMutation = useMutation({
    mutationFn: alertApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertSettings'] })
      message.success('Uyarı ayarları güncellendi!')
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      message.error(error.response?.data?.message || 'Ayarlar güncellenirken hata oluştu!')
    }
  })

  return {
    settings,
    isLoading,
    updateSettings: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending
  }
}