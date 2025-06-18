// src/modules/reports/hooks/useSupplierReports.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { reportsApi } from '../services/reportsApi'
import type {
  ReportFilter,
  ReportsApiResponse,
  SupplierPerformanceReport,
  PurchaseAnalysisReport,
  SupplierPerformanceData,
  SupplierComparisonData
} from '../types/reports.types'

// =============================================================================
// MAIN SUPPLIER REPORTS HOOK
// =============================================================================

export const useSupplierReports = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['supplier-reports', 'performance', filters],
    queryFn: () => reportsApi.suppliers.getPerformanceReport(filters),
    select: (data: ReportsApiResponse<SupplierPerformanceReport>) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// SUPPLIER PERFORMANCE DATA HOOK
// =============================================================================

export const useSupplierPerformanceData = (filters?: ReportFilter): UseQueryResult<SupplierPerformanceData[], Error> => {
  return useQuery({
    queryKey: ['supplier-reports', 'performance-data', filters],
    queryFn: async () => {
      const response = await reportsApi.suppliers.getPerformanceReport(filters)
      
      // Transform data to chart format
      const transformedData: SupplierPerformanceData[] = response.data.suppliers.map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        performance: calculatePerformanceScore(supplier),
        deliveryScore: supplier.onTimeDeliveries,
        qualityScore: supplier.qualityRating,
        totalValue: supplier.totalValue
      }))

      return transformedData
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// SUPPLIER COMPARISON HOOK
// =============================================================================

export const useSupplierComparison = (supplierIds: number[], filters?: ReportFilter): UseQueryResult<SupplierComparisonData[], Error> => {
  return useQuery({
    queryKey: ['supplier-reports', 'comparison', supplierIds, filters],
    queryFn: async () => {
      if (supplierIds.length === 0) return []
      
      const response = await reportsApi.suppliers.getComparison(supplierIds, filters)
      
      // Transform response to comparison format
      const transformedData: SupplierComparisonData[] = response.data.map((item: {
        id: number
        name: string
        avgDeliveryTime: number
        qualityRating: number
        totalOrders: number
        totalValue: number
      }) => ({
        supplierId: item.id,
        supplierName: item.name,
        metrics: {
          deliveryTime: item.avgDeliveryTime,
          qualityRating: item.qualityRating,
          totalOrders: item.totalOrders,
          totalValue: item.totalValue
        }
      }))

      return transformedData
    },
    enabled: supplierIds.length > 0,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// SUPPLIER TREND ANALYSIS HOOK
// =============================================================================

export const useSupplierTrendAnalysis = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['supplier-reports', 'trends', filters],
    queryFn: () => reportsApi.suppliers.getTrendAnalysis(filters),
    select: (data: { data: unknown }) => data.data,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// TOP SUPPLIERS HOOK
// =============================================================================

export const useTopSuppliers = (filters?: ReportFilter & { limit?: number }) => {
  return useQuery({
    queryKey: ['supplier-reports', 'top-suppliers', filters],
    queryFn: () => reportsApi.suppliers.getTopSuppliers(filters),
    select: (data: { data: unknown }) => data.data,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// SUPPLIER DELIVERY PERFORMANCE HOOK
// =============================================================================

export const useSupplierDeliveryPerformance = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['supplier-reports', 'delivery-performance', filters],
    queryFn: () => reportsApi.suppliers.getDeliveryPerformance(filters),
    select: (data: { data: unknown }) => data.data,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// SUPPLIER COST ANALYSIS HOOK
// =============================================================================

export const useSupplierCostAnalysis = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['supplier-reports', 'cost-analysis', filters],
    queryFn: () => reportsApi.suppliers.getCostAnalysis(filters),
    select: (data: { data: unknown }) => data.data,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// PURCHASE ANALYSIS HOOK
// =============================================================================

export const usePurchaseAnalysis = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['supplier-reports', 'purchase-analysis', filters],
    queryFn: () => reportsApi.suppliers.getPurchaseAnalysis(filters),
    select: (data: ReportsApiResponse<PurchaseAnalysisReport>) => data.data,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// SUPPLIER SUMMARY STATISTICS HOOK
// =============================================================================

export const useSupplierSummaryStats = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['supplier-reports', 'summary-stats', filters],
    queryFn: async () => {
      try {
        const performanceData = await reportsApi.suppliers.getPerformanceReport(filters)
        const purchaseData = await reportsApi.suppliers.getPurchaseAnalysis(filters)
        
        const performance = performanceData.data
        const purchase = purchaseData.data
        
        // Safe data access with default values
        const suppliers = performance.suppliers || []
        const activeSuppliers = suppliers.filter(s => (s.activeProducts || 0) > 0)
        
        return {
          totalSuppliers: performance.summary?.totalSuppliers || suppliers.length,
          activeSuppliers: activeSuppliers.length,
          avgDeliveryTime: performance.summary?.avgDeliveryTime || 0,
          avgQualityRating: performance.summary?.avgQualityRating || 0,
          totalPurchaseValue: purchase.totalValue || 0,
          totalOrders: purchase.totalPurchases || 0,
          topPerformer: suppliers.length > 0 ? suppliers.reduce((best, current) => 
            calculatePerformanceScore(current) > calculatePerformanceScore(best) ? current : best
          ) : null,
          worstPerformer: suppliers.length > 0 ? suppliers.reduce((worst, current) => 
            calculatePerformanceScore(current) < calculatePerformanceScore(worst) ? current : worst
          ) : null,
          deliveryTrend: purchase.monthlyTrends?.slice(-6) || [], // Son 6 ay
          categoryBreakdown: purchase.categoryBreakdown?.map((cat: { name: string; value: number }) => ({
            name: cat.name,
            value: cat.value,
            percentage: purchase.totalValue > 0 ? ((cat.value / purchase.totalValue) * 100).toFixed(1) : '0'
          })) || []
        }
      } catch (error) {
        console.error('Supplier summary stats error:', error)
        
        // Return default structure on error
        return {
          totalSuppliers: 0,
          activeSuppliers: 0,
          avgDeliveryTime: 0,
          avgQualityRating: 0,
          totalPurchaseValue: 0,
          totalOrders: 0,
          topPerformer: null,
          worstPerformer: null,
          deliveryTrend: [],
          categoryBreakdown: []
        }
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const calculatePerformanceScore = (supplier: {
  onTimeDeliveries?: number
  qualityRating?: number
  totalValue?: number
}): number => {
  if (!supplier) return 0
  
  // Performans skoru hesaplama algoritması
  const deliveryWeight = 0.4
  const qualityWeight = 0.4
  const valueWeight = 0.2
  
  const deliveryScore = Math.min(supplier.onTimeDeliveries || 0, 100)
  const qualityScore = (supplier.qualityRating || 0) * 20 // 5 üzerinden 100'e çevir
  const valueScore = Math.min(((supplier.totalValue || 0) / 10000) * 10, 100) // Normalize
  
  return Math.round(
    deliveryScore * deliveryWeight + 
    qualityScore * qualityWeight + 
    valueScore * valueWeight
  )
}

// Export all hooks
export default {
  useSupplierReports,
  useSupplierPerformanceData,
  useSupplierComparison,
  useSupplierTrendAnalysis,
  useTopSuppliers,
  useSupplierDeliveryPerformance,
  useSupplierCostAnalysis,
  usePurchaseAnalysis,
  useSupplierSummaryStats
}