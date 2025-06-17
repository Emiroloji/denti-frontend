// src/modules/reports/hooks/useStockReports.ts

import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { message } from 'antd'
import { reportsApi } from '../services/reportsApi'
import type {
  ReportFilter,
  ReportsApiResponse,
  StockLevelReport,
  StockMovementReport,
  CategoryAnalysisReport,
  UsageTrendReport,
  ExpiryAnalysisReport,
  StockChartsData,
  StockTrendAnalysis,
  StockUsageData,
  ChartDataPoint
} from '../types/reports.types'

// =============================================================================
// MAIN STOCK REPORTS HOOK
// =============================================================================

export const useStockReports = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['stock-reports', 'levels', filters],
    queryFn: () => reportsApi.stocks.getLevelsReport(filters),
    select: (data: ReportsApiResponse<StockLevelReport>) => data.data,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// STOCK CHARTS DATA HOOK - Charts için
// =============================================================================

export const useStockChartsData = (filters?: ReportFilter): UseQueryResult<StockChartsData, Error> => {
  return useQuery({
    queryKey: ['stock-reports', 'charts', filters],
    queryFn: async () => {
      try {
        // Paralel olarak birden fazla API çağrısı yapalım
        const [levelsData, categoryData] = await Promise.all([
          reportsApi.stocks.getLevelsReport(filters),
          reportsApi.stocks.getCategoryAnalysis(filters)
        ])

        // Chart data'yı transform edelim
        const transformedData: StockChartsData = {
          levelData: levelsData.data.categories?.map((item): ChartDataPoint => ({
            name: item.name,
            value: item.value,
            label: item.label,
            color: item.color,
            percentage: item.percentage
          })) || [],
          categoryData: categoryData.data.categories?.map((cat): ChartDataPoint => ({
            name: cat.name,
            value: cat.totalStock,
            label: `${cat.itemCount} ürün`,
            color: getColorByStockLevel(cat.lowStockCount, cat.criticalStockCount),
            percentage: 0 // Backend'den hesaplanacak
          })) || [],
          trendData: [], // Backend'den gelecek
          summary: {
            total: levelsData.data.totalStocks,
            low: levelsData.data.lowLevel,
            critical: levelsData.data.criticalLevel,
            normal: levelsData.data.normalLevel
          }
        }

        return transformedData
      } catch (error) {
        console.error('Stock charts data error:', error)
        message.error('Grafik verileri yüklenirken hata oluştu')
        throw error
      }
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// STOCK TREND ANALYSIS HOOK
// =============================================================================

export const useStockTrendAnalysis = (filters?: ReportFilter): UseQueryResult<StockTrendAnalysis, Error> => {
  return useQuery({
    queryKey: ['stock-reports', 'trends', filters],
    queryFn: async () => {
      try {
        const response = await reportsApi.stocks.getTrendAnalysis(filters)
        
        // Mock data transform - Backend implementasyonuna kadar
        const mockTrendData: StockTrendAnalysis = {
          trends: [
            { date: '2024-01-01', value: 850, label: 'Ocak' },
            { date: '2024-02-01', value: 920, label: 'Şubat' },
            { date: '2024-03-01', value: 780, label: 'Mart' },
            { date: '2024-04-01', value: 890, label: 'Nisan' },
            { date: '2024-05-01', value: 940, label: 'Mayıs' },
            { date: '2024-06-01', value: 820, label: 'Haziran' }
          ],
          forecasts: [
            { date: '2024-07-01', value: 860, label: 'Temmuz (Tahmin)' },
            { date: '2024-08-01', value: 880, label: 'Ağustos (Tahmin)' },
            { date: '2024-09-01', value: 900, label: 'Eylül (Tahmin)' }
          ],
          indicators: {
            direction: 'up',
            percentage: 12.5,
            recommendation: 'Stok seviyeleri artış eğiliminde. Tedarik planlaması güncellenebilir.'
          }
        }

        return mockTrendData
      } catch (error) {
        console.error('Stock trend analysis error:', error)
        message.error('Trend analizi yüklenirken hata oluştu')
        throw error
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// STOCK USAGE REPORT HOOK
// =============================================================================

export const useStockUsageReport = (filters?: ReportFilter): UseQueryResult<StockUsageData, Error> => {
  return useQuery({
    queryKey: ['stock-reports', 'usage', filters],
    queryFn: async () => {
      try {
        const response = await reportsApi.stocks.getUsageReport(filters)
        
        // Mock data transform - Backend implementasyonuna kadar
        const mockUsageData: StockUsageData = {
          period: 'daily',
          data: [
            {
              date: '01.06',
              fullDate: '2024-06-01',
              totalUsage: 45,
              Ortodonti: 12,
              Periodontoloji: 8,
              Endodonti: 15,
              Protez: 6,
              Pedodonti: 4
            },
            {
              date: '02.06',
              fullDate: '2024-06-02',
              totalUsage: 38,
              Ortodonti: 10,
              Periodontoloji: 9,
              Endodonti: 12,
              Protez: 4,
              Pedodonti: 3
            },
            {
              date: '03.06',
              fullDate: '2024-06-03',
              totalUsage: 52,
              Ortodonti: 15,
              Periodontoloji: 11,
              Endodonti: 18,
              Protez: 5,
              Pedodonti: 3
            },
            {
              date: '04.06',
              fullDate: '2024-06-04',
              totalUsage: 41,
              Ortodonti: 11,
              Periodontoloji: 7,
              Endodonti: 16,
              Protez: 4,
              Pedodonti: 3
            },
            {
              date: '05.06',
              fullDate: '2024-06-05',
              totalUsage: 47,
              Ortodonti: 13,
              Periodontoloji: 9,
              Endodonti: 17,
              Protez: 5,
              Pedodonti: 3
            }
          ],
          summary: {
            totalUsage: 223,
            avgDaily: 44.6,
            trend: 'stable'
          }
        }

        return mockUsageData
      } catch (error) {
        console.error('Stock usage report error:', error)
        message.error('Kullanım raporu yüklenirken hata oluştu')
        throw error
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
}

// =============================================================================
// OTHER STOCK REPORT HOOKS
// =============================================================================

export const useStockMovementReport = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['stock-reports', 'movements', filters],
    queryFn: () => reportsApi.stocks.getMovementsReport(filters),
    select: (data: ReportsApiResponse<StockMovementReport>) => data.data,
    staleTime: 1000 * 60 * 5
  })
}

export const useCategoryAnalysisReport = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['stock-reports', 'categories', filters],
    queryFn: () => reportsApi.stocks.getCategoryAnalysis(filters),
    select: (data: ReportsApiResponse<CategoryAnalysisReport>) => data.data,
    staleTime: 1000 * 60 * 5
  })
}

export const useUsageTrendReport = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['stock-reports', 'usage-trends', filters],
    queryFn: () => reportsApi.stocks.getUsageTrends(filters),
    select: (data: ReportsApiResponse<UsageTrendReport>) => data.data,
    staleTime: 1000 * 60 * 5
  })
}

export const useExpiryAnalysisReport = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['stock-reports', 'expiry', filters],
    queryFn: () => reportsApi.stocks.getExpiryAnalysis(filters),
    select: (data: ReportsApiResponse<ExpiryAnalysisReport>) => data.data,
    staleTime: 1000 * 60 * 5
  })
}

// =============================================================================
// DASHBOARD HOOKS
// =============================================================================

export const useAllStockReports = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['stock-reports', 'dashboard', filters],
    queryFn: async () => {
      try {
        // Paralel API çağrıları
        const [levels, movements, categories] = await Promise.all([
          reportsApi.stocks.getLevelsReport(filters),
          reportsApi.stocks.getMovementsReport(filters),
          reportsApi.stocks.getCategoryAnalysis(filters)
        ])

        return {
          levels: levels.data,
          movements: movements.data,
          categories: categories.data
        }
      } catch (error) {
        console.error('All stock reports error:', error)
        message.error('Stok raporları yüklenirken hata oluştu')
        throw error
      }
    },
    staleTime: 1000 * 60 * 5
  })
}

export const useStockStatusSummary = (filters?: ReportFilter) => {
  return useQuery({
    queryKey: ['stock-reports', 'status-summary', filters],
    queryFn: async () => {
      try {
        const response = await reportsApi.stocks.getLevelsReport(filters)
        return {
          total: response.data.totalStocks,
          normal: response.data.normalLevel,
          low: response.data.lowLevel,
          critical: response.data.criticalLevel,
          outOfStock: response.data.outOfStock
        }
      } catch (error) {
        console.error('Stock status summary error:', error)
        message.error('Stok durumu özeti yüklenirken hata oluştu')
        throw error
      }
    },
    staleTime: 1000 * 60 * 3
  })
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Stok seviyesine göre renk belirleyici
const getColorByStockLevel = (lowCount: number, criticalCount: number): string => {
  if (criticalCount > 0) return '#ff4d4f' // Kırmızı
  if (lowCount > 0) return '#faad14' // Sarı
  return '#52c41a' // Yeşil
}

// Export all hooks
export default {
  useStockReports,
  useStockChartsData,
  useStockTrendAnalysis,
  useStockUsageReport,
  useStockMovementReport,
  useCategoryAnalysisReport,
  useUsageTrendReport,
  useExpiryAnalysisReport,
  useAllStockReports,
  useStockStatusSummary
}