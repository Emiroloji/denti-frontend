// =============================================================================
// src/modules/reports/hooks/useClinicReports.ts (fixed)
// =============================================================================

import { useQuery, type UseQueryResult } from '@tanstack/react-query'
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

// -----------------------------------------------------------------------------
// Internal helper types (raw shapes expected from API)
// -----------------------------------------------------------------------------
interface RawClinicComparisonItem {
  id: number
  name: string
  totalConsumption?: number
  efficiency?: number
  stockValue?: number
  alertCount?: number
}

interface RawClinicConsumptionItem {
  id: number
  name: string
  totalConsumption?: number
  totalValue?: number
  avgDailyUsage?: number
  mostUsedCategory?: string
  efficiency?: number
}

// -----------------------------------------------------------------------------
// Raw stock data interface
// -----------------------------------------------------------------------------
interface RawStockData {
  clinicName?: string
  totalItems?: number
  totalValue?: number
  lowStockCount?: number
  criticalStockCount?: number
}

// =============================================================================
// 1) MAIN CLINIC REPORTS HOOK
// =============================================================================
export const useClinicReports = (filters?: ReportFilter) =>
  useQuery({
    queryKey: ['clinic-reports', 'consumption', filters],
    queryFn : () => reportsApi.clinics.getConsumptionReport(filters),
    select  : (d: ReportsApiResponse<ClinicConsumptionReport>) => d.data,
    staleTime: 5 * 60 * 1_000,
    refetchOnWindowFocus: false
  })

// =============================================================================
// 2) CLINIC STOCK DATA HOOK
// =============================================================================
export const useClinicStockData = (
  clinicId: number,
  filters?: ReportFilter
): UseQueryResult<ClinicStockData, Error> =>
  useQuery({
    queryKey: ['clinic-reports', 'stock-data', clinicId, filters],
    enabled : Boolean(clinicId),
    queryFn : async (): Promise<ClinicStockData> => {
      const { data } = await reportsApi.clinics.getStockReport(clinicId, filters) as { data: RawStockData }
      return {
        clinicId,
        clinicName        : data.clinicName ?? 'Bilinmeyen Klinik',
        totalStock        : data.totalItems ?? 0,
        totalValue        : data.totalValue ?? 0,
        lowStock          : data.lowStockCount ?? 0,
        criticalStock     : data.criticalStockCount ?? 0
      } as ClinicStockData
    },
    staleTime: 3 * 60 * 1_000,
    refetchOnWindowFocus: false
  })

// =============================================================================
// 3) CLINIC COMPARISON HOOK
// =============================================================================
export const useClinicComparison = (
  clinicIds: number[],
  filters?: ReportFilter
): UseQueryResult<ClinicComparisonData[], Error> =>
  useQuery({
    queryKey: ['clinic-reports', 'comparison', clinicIds, filters],
    enabled : clinicIds.length > 0,
    queryFn : async () => {
      if (clinicIds.length === 0) return []
      const { data } = await reportsApi.clinics.getComparison(clinicIds, filters)
      return (data as RawClinicComparisonItem[]).map<ClinicComparisonData>(c => ({
        clinicId  : c.id,
        clinicName: c.name,
        metrics   : {
          totalConsumption: c.totalConsumption ?? 0,
          efficiency : c.efficiency ?? 0,
          totalValue : c.stockValue ?? 0,
          stockCount : c.alertCount ?? 0
        }
      }))
    },
    staleTime: 5 * 60 * 1_000,
    refetchOnWindowFocus: false
  })

// =============================================================================
// 4) SIMPLE PASS‑THROUGH REPORT HOOKS (USAGE/EFFICIENCY/COST/TURNOVER)
// =============================================================================
export const useClinicUsageTrend = (filters?: ReportFilter) =>
  useQuery({
    queryKey: ['clinic-reports', 'usage-trend', filters],
    queryFn : () => reportsApi.clinics.getUsageTrend(filters),
    select  : (d: ReportsApiResponse<unknown>) => d.data,
    staleTime: 5 * 60 * 1_000,
    refetchOnWindowFocus: false
  })

export const useClinicEfficiencyReport = (filters?: ReportFilter) =>
  useQuery({
    queryKey: ['clinic-reports', 'efficiency', filters],
    queryFn : () => reportsApi.clinics.getEfficiencyReport(filters),
    select  : (d: ReportsApiResponse<unknown>) => d.data,
    staleTime: 5 * 60 * 1_000,
    refetchOnWindowFocus: false
  })

export const useClinicCostAnalysis = (filters?: ReportFilter) =>
  useQuery({
    queryKey: ['clinic-reports', 'cost-analysis', filters],
    queryFn : () => reportsApi.clinics.getCostAnalysis(filters),
    select  : (d: ReportsApiResponse<unknown>) => d.data,
    staleTime: 5 * 60 * 1_000,
    refetchOnWindowFocus: false
  })

export const useClinicTurnoverRate = (filters?: ReportFilter) =>
  useQuery({
    queryKey: ['clinic-reports', 'turnover-rate', filters],
    queryFn : () => reportsApi.clinics.getTurnoverRate(filters),
    select  : (d: ReportsApiResponse<unknown>) => d.data,
    staleTime: 5 * 60 * 1_000,
    refetchOnWindowFocus: false
  })

// =============================================================================
// 5) DOCTOR USAGE REPORT HOOK
// =============================================================================
export const useDoctorUsageReport = (filters?: ReportFilter) =>
  useQuery({
    queryKey: ['clinic-reports', 'doctor-usage', filters],
    queryFn : () => reportsApi.clinics.getDoctorUsage(filters),
    select  : (d: ReportsApiResponse<DoctorUsageReport>) => d.data,
    staleTime: 5 * 60 * 1_000,
    refetchOnWindowFocus: false
  })

// =============================================================================
// 6) CLINIC SUMMARY STATISTICS HOOK
// =============================================================================
export const useClinicSummaryStats = (filters?: ReportFilter) =>
  useQuery({
    queryKey: ['clinic-reports', 'summary-stats', filters],
    queryFn : async () => {
      try {
        const [consumptionD, costD] = await Promise.all([
          reportsApi.clinics.getConsumptionReport(filters),
          reportsApi.clinics.getCostAnalysis(filters)
        ])

        const consumption = consumptionD.data
        const cost = costD.data

        const clinicRows = (consumption.clinics ?? []) as RawClinicConsumptionItem[]
        const totalClinics = clinicRows.length
        const totalConsumption = clinicRows.reduce((sum: number, c) => sum + (c.totalConsumption ?? 0), 0)
        const avgEfficiency = totalClinics > 0 ? clinicRows.reduce((sum: number, c) => sum + (c.efficiency ?? 0), 0) / totalClinics : 0
        const totalCost = (cost.clinics as { totalValue?: number }[] ?? []).reduce((sum: number, c) => sum + (c.totalValue ?? 0), 0)

        const bestPerformer = clinicRows.reduce<RawClinicConsumptionItem | null>((best, curr) =>
          (curr.efficiency ?? 0) > (best?.efficiency ?? 0) ? curr : best,
          null
        )

        const worstPerformer = clinicRows.reduce<RawClinicConsumptionItem | null>((worst, curr) =>
          (curr.efficiency ?? 0) < (worst?.efficiency ?? 0) ? curr : worst,
          null
        )

        const topCategories = clinicRows
          .map(c => ({ name: c.name, value: c.totalConsumption ?? 0, category: c.mostUsedCategory }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5)

        return {
          totalClinics,
          totalConsumption,
          avgEfficiency: Math.round(avgEfficiency * 100) / 100,
          totalCost,
          bestPerformer,
          worstPerformer,
          topCategories,
          monthlyTrend: [] // API'den gelecek olan comparison verisi için placeholder
        }
      } catch (err) {
        console.error('Clinic summary stats error:', err)
        message.error('Klinik özet istatistikleri yüklenirken hata oluştu')
        throw err
      }
    },
    staleTime: 5 * 60 * 1_000,
    refetchOnWindowFocus: false
  })

// =============================================================================
// 7) CLINIC PERFORMANCE COMPARISON HOOK
// =============================================================================
export const useClinicPerformanceComparison = (filters?: ReportFilter) =>
  useQuery({
    queryKey: [ 'clinic-reports', 'performance-comparison', filters],
    queryFn : async () => {
      try {
        // Use the existing comparison endpoint since getPerformanceComparison doesn't exist
        const { data } = await reportsApi.clinics.getComparison([], filters)
        return (data as RawClinicComparisonItem[]).map<ClinicComparisonData>(c => ({
          clinicId  : c.id,
          clinicName: c.name,
          metrics   : {
            totalConsumption: c.totalConsumption ?? 0,
            efficiency : c.efficiency ?? 0,
            totalValue : c.stockValue ?? 0,
            stockCount : c.alertCount ?? 0
          }
        }))
      } catch (err) {
        console.error('Clinic performance comparison error:', err)
        message.error('Klinik performans karşılaştırması yüklenirken hata oluştu')
        throw err
      }
    },
    staleTime: 5 * 60 * 1_000,
    refetchOnWindowFocus: false
  })

// =============================================================================