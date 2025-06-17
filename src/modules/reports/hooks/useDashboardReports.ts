/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/reports/hooks/useDashboardReports.ts

import React from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { message } from 'antd'
import { reportsApi } from '../services/reportsApi'
import type {
  ReportFilter,
  ReportsDashboardSummary
} from '../types/reports.types'

// Query keys for dashboard
export const dashboardReportsKeys = {
  all: ['dashboard-reports'] as const,
  summary: (filters?: ReportFilter) => ['dashboard-reports', 'summary', filters] as const,
}

// =============================================================================
// DASHBOARD SUMMARY
// =============================================================================

export const useDashboardSummary = (
  filters?: ReportFilter,
  options?: {
    enabled?: boolean
    refetchInterval?: number
    realTime?: boolean
  }
): UseQueryResult<ReportsDashboardSummary, Error> => {
  const refetchInterval = options?.realTime 
    ? 30000 // 30 saniye - real-time için
    : options?.refetchInterval

  return useQuery({
    queryKey: dashboardReportsKeys.summary(filters),
    queryFn: async () => {
      try {
        const response = await reportsApi.dashboard.getSummary(filters)
        return response.data
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Dashboard özeti alınamadı'
        message.error(errorMessage)
        throw new Error(errorMessage)
      }
    },
    staleTime: options?.realTime ? 0 : 1000 * 60 * 2, // Real-time ise hemen stale
    gcTime: 1000 * 60 * 5, // 5 dakika cache
    enabled: options?.enabled ?? true,
    refetchInterval,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: options?.realTime ?? false,
    refetchIntervalInBackground: options?.realTime ?? false,
  })
}

// =============================================================================
// DASHBOARD REPORTS WITH COMPUTED DATA
// =============================================================================

export const useDashboardReports = (
  filters?: ReportFilter,
  options?: {
    enabled?: boolean
    refetchInterval?: number
    realTime?: boolean
  }
) => {
  const dashboardSummary = useDashboardSummary(filters, options)

  // Computed dashboard metrics
  const computedMetrics = React.useMemo(() => {
    if (!dashboardSummary.data) return null

    const { stockMetrics, transferMetrics, alertMetrics } = dashboardSummary.data

    return {
      // Stok durumu yüzdeleri
      stockHealthPercentage: stockMetrics.totalItems > 0 
        ? Math.round(((stockMetrics.totalItems - stockMetrics.lowStockCount - stockMetrics.criticalStockCount) / stockMetrics.totalItems) * 100)
        : 0,

      // Kritik durum yüzdesi
      criticalStockPercentage: stockMetrics.totalItems > 0
        ? Math.round((stockMetrics.criticalStockCount / stockMetrics.totalItems) * 100)
        : 0,

      // Transfer etkinliği
      transferEfficiency: transferMetrics.avgApprovalTime > 0
        ? Math.round((24 / transferMetrics.avgApprovalTime) * 100) // 24 saat ideal
        : 100,

      // Uyarı durumu
      alertResolutionRate: alertMetrics.activeAlerts + alertMetrics.resolvedToday > 0
        ? Math.round((alertMetrics.resolvedToday / (alertMetrics.activeAlerts + alertMetrics.resolvedToday)) * 100)
        : 0,

      // Genel sistem sağlığı skoru
      systemHealthScore: 0, // Aşağıda hesaplanacak
    }
  }, [dashboardSummary.data])

  // Sistem sağlığı skoru hesaplama
  React.useEffect(() => {
    if (computedMetrics) {
      const healthScore = Math.round(
        (computedMetrics.stockHealthPercentage * 0.4 +
         computedMetrics.transferEfficiency * 0.3 +
         computedMetrics.alertResolutionRate * 0.3)
      )
      computedMetrics.systemHealthScore = Math.min(100, Math.max(0, healthScore))
    }
  }, [computedMetrics])

  // Status indicators
  const statusIndicators = React.useMemo(() => {
    if (!dashboardSummary.data || !computedMetrics) return null

    const { alertMetrics } = dashboardSummary.data

    return {
      stockStatus: computedMetrics.criticalStockPercentage > 20 ? 'critical' : 
                   computedMetrics.criticalStockPercentage > 10 ? 'warning' : 'good',
      
      alertStatus: alertMetrics.criticalAlerts > 5 ? 'critical' :
                   alertMetrics.criticalAlerts > 2 ? 'warning' : 'good',
      
      transferStatus: computedMetrics.transferEfficiency < 50 ? 'critical' :
                      computedMetrics.transferEfficiency < 75 ? 'warning' : 'good',
      
      overallStatus: computedMetrics.systemHealthScore < 60 ? 'critical' :
                     computedMetrics.systemHealthScore < 80 ? 'warning' : 'good',
    }
  }, [dashboardSummary.data, computedMetrics])

  // Recent activity formatter
  const formattedActivity = React.useMemo(() => {
    if (!dashboardSummary.data?.recentActivity) return []

    return dashboardSummary.data.recentActivity.map(activity => ({
      ...activity,
      timeAgo: formatTimeAgo(activity.timestamp),
      icon: getActivityIcon(activity.type),
      color: getActivityColor(activity.type),
    }))
  }, [dashboardSummary.data?.recentActivity])

  return {
    // Raw data
    summary: dashboardSummary.data,
    
    // Computed metrics
    metrics: computedMetrics,
    
    // Status indicators
    status: statusIndicators,
    
    // Formatted data
    activity: formattedActivity,
    
    // Query states
    isLoading: dashboardSummary.isLoading,
    isError: dashboardSummary.isError,
    error: dashboardSummary.error,
    
    // Actions
    refetch: dashboardSummary.refetch,
    
    // Flags
    isRealTime: options?.realTime ?? false,
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now.getTime() - time.getTime()

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Az önce'
  if (minutes < 60) return `${minutes} dakika önce`
  if (hours < 24) return `${hours} saat önce`
  if (days < 30) return `${days} gün önce`
  
  return time.toLocaleDateString('tr-TR')
}

const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'stock_used':
      return 'medicine-box'
    case 'transfer_completed':
      return 'swap'
    case 'alert_created':
      return 'warning'
    default:
      return 'info-circle'
  }
}

const getActivityColor = (type: string): string => {
  switch (type) {
    case 'stock_used':
      return 'blue'
    case 'transfer_completed':
      return 'green'
    case 'alert_created':
      return 'orange'
    default:
      return 'default'
  }
}

// =============================================================================
// DASHBOARD WIDGETS HOOK
// =============================================================================

export const useDashboardWidgets = (
  filters?: ReportFilter,
  options?: {
    enabled?: boolean
    realTime?: boolean
  }
) => {
  const { summary, metrics, status, isLoading, isError } = useDashboardReports(filters, options)

  // Widget data preparation
  const widgets = React.useMemo(() => {
    if (!summary || !metrics || !status) return null

    return {
      // Stok widget
      stockWidget: {
        title: 'Stok Durumu',
        total: summary.stockMetrics.totalItems,
        critical: summary.stockMetrics.criticalStockCount,
        low: summary.stockMetrics.lowStockCount,
        healthPercentage: metrics.stockHealthPercentage,
        status: status.stockStatus,
        trend: '+5%', // API'den gelecek
      },

      // Transfer widget
      transferWidget: {
        title: 'Transfer Durumu',
        pending: summary.transferMetrics.pendingRequests,
        completed: summary.transferMetrics.completedToday,
        avgTime: summary.transferMetrics.avgApprovalTime,
        efficiency: metrics.transferEfficiency,
        status: status.transferStatus,
      },

      // Uyarı widget
      alertWidget: {
        title: 'Uyarı Durumu',
        active: summary.alertMetrics.activeAlerts,
        critical: summary.alertMetrics.criticalAlerts,
        resolved: summary.alertMetrics.resolvedToday,
        resolutionRate: metrics.alertResolutionRate,
        status: status.alertStatus,
      },

      // Sistem sağlığı widget
      systemWidget: {
        title: 'Sistem Sağlığı',
        score: metrics.systemHealthScore,
        status: status.overallStatus,
        lastUpdate: new Date().toLocaleTimeString('tr-TR'),
      },
    }
  }, [summary, metrics, status])

  return {
    widgets,
    isLoading,
    isError,
    isRealTime: options?.realTime ?? false,
  }
}