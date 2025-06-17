// src/modules/reports/hooks/useClinicReports.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { message } from 'antd'
import { reportsApi } from '../services/reportsApi'
import type {
  ReportFilter,
  ReportsApiResponse,
  ClinicConsumptionReport,
  DoctorUsageReport,
  ClinicStockData,
  ClinicComparisonData
} from '../types/reports.types'

// =============================================================================
// MAIN CLINIC REPORTS HOOK
// =============================================================================

export const useClinicReports = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['clinic-reports', 'consumption', filters],
    queryFn: () => reportsApi.clinics.getConsumptionReport(filters),
    select: (data: ReportsApiResponse<ClinicConsumptionReport>) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// CLINIC STOCK DATA HOOK
// =============================================================================

export const useClinicStockData = (clinicId: number, filters?: ReportFilter): UseQueryResult<ClinicStockData, Error> => {
  return useQuery({
    queryKey: ['clinic-reports', 'stock-data', clinicId, filters],
    queryFn: async () => {
      const response = await reportsApi.clinics.getStockReport(clinicId, filters)
      
      // Transform response to ClinicStockData format
      const transformedData: ClinicStockData = {
        clinicId: clinicId,
        clinicName: response.data.clinicName || 'Bilinmeyen Klinik',
        totalItems: response.data.totalItems || 0,
        totalValue: response.data.totalValue || 0,
        lowStockCount: response.data.lowStockCount || 0,
        criticalStockCount: response.data.criticalStockCount || 0
      }

      return transformedData
    },
    enabled: !!clinicId,
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// CLINIC COMPARISON HOOK
// =============================================================================

export const useClinicComparison = (clinicIds: number[], filters?: ReportFilter): UseQueryResult<ClinicComparisonData[], Error> => {
  return useQuery({
    queryKey: ['clinic-reports', 'comparison', clinicIds, filters],
    queryFn: async () => {
      if (clinicIds.length === 0) return []
      
      const response = await reportsApi.clinics.getComparison(clinicIds, filters)
      
      // Transform to comparison format
      const transformedData: ClinicComparisonData[] = response.data.map((clinic: any) => ({
        clinicId: clinic.id,
        clinicName: clinic.name,
        metrics: {
          consumption: clinic.totalConsumption || 0,
          efficiency: clinic.efficiency || 0,
          stockValue: clinic.stockValue || 0,
          alertCount: clinic.alertCount || 0
        }
      }))

      return transformedData
    },
    enabled: clinicIds.length > 0,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// CLINIC USAGE TREND HOOK
// =============================================================================

export const useClinicUsageTrend = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['clinic-reports', 'usage-trend', filters],
    queryFn: () => reportsApi.clinics.getUsageTrend(filters),
    select: (data: any) => data.data,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// CLINIC EFFICIENCY REPORT HOOK
// =============================================================================

export const useClinicEfficiencyReport = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['clinic-reports', 'efficiency', filters],
    queryFn: () => reportsApi.clinics.getEfficiencyReport(filters),
    select: (data: any) => data.data,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// CLINIC COST ANALYSIS HOOK
// =============================================================================

export const useClinicCostAnalysis = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['clinic-reports', 'cost-analysis', filters],
    queryFn: () => reportsApi.clinics.getCostAnalysis(filters),
    select: (data: any) => data.data,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// CLINIC TURNOVER RATE HOOK
// =============================================================================

export const useClinicTurnoverRate = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['clinic-reports', 'turnover-rate', filters],
    queryFn: () => reportsApi.clinics.getTurnoverRate(filters),
    select: (data: any) => data.data,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// DOCTOR USAGE REPORT HOOK
// =============================================================================

export const useDoctorUsageReport = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['clinic-reports', 'doctor-usage', filters],
    queryFn: () => reportsApi.clinics.getDoctorUsage(filters),
    select: (data: ReportsApiResponse<DoctorUsageReport>) => data.data,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// CLINIC SUMMARY STATISTICS HOOK
// =============================================================================

export const useClinicSummaryStats = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['clinic-reports', 'summary-stats', filters],
    queryFn: async () => {
      try {
        // Paralel API çağrıları
        const [consumptionData, efficiencyData, costData] = await Promise.all([
          reportsApi.clinics.getConsumptionReport(filters),
          reportsApi.clinics.getEfficiencyReport(filters),
          reportsApi.clinics.getCostAnalysis(filters)
        ])

        const consumption = consumptionData.data
        const efficiency = efficiencyData.data
        const cost = costData.data

        // Özet istatistikleri hesapla
        const totalClinics = consumption.clinics?.length || 0
        const totalConsumption = consumption.clinics?.reduce((sum: number, clinic: any) => sum + (clinic.totalConsumption || 0), 0) || 0
        const avgEfficiency = totalClinics > 0 
          ? efficiency.clinics?.reduce((sum: number, clinic: any) => sum + (clinic.efficiency || 0), 0) / totalClinics 
          : 0
        const totalCost = cost.clinics?.reduce((sum: number, clinic: any) => sum + (clinic.totalValue || 0), 0) || 0

        // En iyi ve en kötü performans gösteren klinikler
        const bestPerformer = consumption.clinics?.reduce((best: any, current: any) => 
          (current.efficiency || 0) > (best.efficiency || 0) ? current : best
        ) || null

        const worstPerformer = consumption.clinics?.reduce((worst: any, current: any) => 
          (current.efficiency || 0) < (worst.efficiency || 0) ? current : worst
        ) || null

        // Top kategoriler
        const topCategories = consumption.clinics?.map((clinic: any) => ({
          name: clinic.name,
          value: clinic.totalConsumption,
          category: clinic.mostUsedCategory
        })).sort((a: any, b: any) => b.value - a.value).slice(0, 5) || []

        return {
          totalClinics,
          totalConsumption,
          avgEfficiency: Math.round(avgEfficiency * 100) / 100,
          totalCost,
          bestPerformer: bestPerformer ? {
            id: bestPerformer.id,
            name: bestPerformer.name,
            totalConsumption: bestPerformer.totalConsumption,
            totalValue: bestPerformer.totalValue,
            avgDailyUsage: bestPerformer.avgDailyUsage,
            mostUsedCategory: bestPerformer.mostUsedCategory,
            efficiency: bestPerformer.efficiency
          } : null,
          worstPerformer: worstPerformer ? {
            id: worstPerformer.id,
            name: worstPerformer.name,
            totalConsumption: worstPerformer.totalConsumption,
            totalValue: worstPerformer.totalValue,
            avgDailyUsage: worstPerformer.avgDailyUsage,
            mostUsedCategory: worstPerformer.mostUsedCategory,
            efficiency: worstPerformer.efficiency
          } : null,
          topCategories,
          monthlyTrend: consumption.comparison?.map((item: any) => ({
            clinicName: item.clinicName,
            thisMonth: item.thisMonth,
            lastMonth: item.lastMonth,
            change: item.change
          })) || []
        }
      } catch (error) {
        console.error('Clinic summary stats error:', error)
        message.error('Klinik özet istatistikleri yüklenirken hata oluştu')
        throw error
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// CLINIC PERFORMANCE COMPARISON HOOK
// =============================================================================

export const useClinicPerformanceComparison = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['clinic-reports', 'performance-comparison', filters],
    queryFn: async () => {
      try {
        const consumptionData = await reportsApi.clinics.getConsumptionReport(filters)
        const consumption = consumptionData.data

        if (!consumption.clinics || consumption.clinics.length === 0) {
          return {
            clinics: [],
            averages: { consumption: 0, efficiency: 0, usage: 0, cost: 0 }
          }
        }

        // Performance metrics hesapla
        const clinics = consumption.clinics.map((clinic: any) => ({
          id: clinic.id,
          name: clinic.name,
          consumption: clinic.totalConsumption || 0,
          efficiency: clinic.efficiency || 0,
          avgDailyUsage: clinic.avgDailyUsage || 0,
          totalValue: clinic.totalValue || 0,
          performanceScore: calculateClinicPerformanceScore(clinic)
        }))

        // Ortalamalar
        const averages = {
          consumption: clinics.length > 0 ? clinics.reduce((sum, clinic) => sum + clinic.consumption, 0) / clinics.length : 0,
          efficiency: clinics.length > 0 ? clinics.reduce((sum, clinic) => sum + clinic.efficiency, 0) / clinics.length : 0,
          usage: clinics.length > 0 ? clinics.reduce((sum, clinic) => sum + clinic.avgDailyUsage, 0) / clinics.length : 0,
          cost: clinics.length > 0 ? clinics.reduce((sum, clinic) => sum + clinic.totalValue, 0) / clinics.length : 0
        }

        return { clinics, averages }
      } catch (error) {
        console.error('Clinic performance comparison error:', error)
        message.error('Klinik performans karşılaştırması yüklenirken hata oluştu')
        throw error
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const calculateClinicPerformanceScore = (clinic: any): number => {
  // Klinik performans skoru hesaplama
  const efficiencyWeight = 0.4
  const consumptionWeight = 0.3
  const usageWeight = 0.3

  const efficiencyScore = Math.min(clinic.efficiency || 0, 100)
  const consumptionScore = Math.min(((clinic.totalConsumption || 0) / 1000) * 10, 100)
  const usageScore = Math.min(((clinic.avgDailyUsage || 0) / 50) * 100, 100)

  return Math.round(
    efficiencyScore * efficiencyWeight +
    consumptionScore * consumptionWeight +
    usageScore * usageWeight
  )
}

// Export all hooks
export default {
  useClinicReports,
  useClinicStockData,
  useClinicComparison,
  useClinicUsageTrend,
  useClinicEfficiencyReport,
  useClinicCostAnalysis,
  useClinicTurnoverRate,
  useDoctorUsageReport,
  useClinicSummaryStats,
  useClinicPerformanceComparison
}