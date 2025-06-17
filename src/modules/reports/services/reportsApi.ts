/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/reports/services/reportsApi.ts

import { api } from '@/shared/services/api'
import type {
  ReportFilter,
  ReportsApiResponse,
  StockLevelReport,
  StockMovementReport,
  CategoryAnalysisReport,
  UsageTrendReport,
  ExpiryAnalysisReport,
  SupplierPerformanceReport,
  PurchaseAnalysisReport,
  ClinicConsumptionReport,
  DoctorUsageReport,
  TransferAnalysisReport,
  AlertStatisticsReport,
  ReportsDashboardSummary,
  ExportOptions,
  ExportConfig,
  StockChartsData,
  StockTrendAnalysis,
  StockUsageData
} from '../types/reports.types'

// Helper function to build query string
const buildQueryString = (filters: ReportFilter): string => {
  const params = new URLSearchParams()
  
  if (filters.startDate) params.append('start_date', filters.startDate)
  if (filters.endDate) params.append('end_date', filters.endDate)
  if (filters.clinicId) params.append('clinic_id', filters.clinicId.toString())
  if (filters.supplierId) params.append('supplier_id', filters.supplierId.toString())
  if (filters.category) params.append('category', filters.category)
  if (filters.stockStatus) params.append('stock_status', filters.stockStatus)
  
  // DateRange desteği
  if (filters.dateRange) {
    params.append('start_date', filters.dateRange.startDate)
    params.append('end_date', filters.dateRange.endDate)
  }
  
  const queryString = params.toString()
  return queryString ? `?${queryString}` : ''
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const reportsApiHelpers = {
  buildQueryString,
  
  formatDateForApi: (date: string): string => {
    return new Date(date).toISOString().split('T')[0]
  },
  
  validateFilters: (filters: ReportFilter): boolean => {
    if (filters.startDate && filters.endDate) {
      return new Date(filters.startDate) <= new Date(filters.endDate)
    }
    return true
  },
  
  buildExportConfig: (baseConfig: Partial<ExportConfig>): ExportConfig => ({
    format: 'excel',
    includeCharts: true,
    includeFilters: true,
    compression: false,
    quality: 'medium',
    layout: 'portrait',
    theme: 'professional',
    ...baseConfig
  }),
  
  transformChartData: (data: any[]): any[] => {
    return data.map(item => ({
      ...item,
      value: Number(item.value) || 0,
      percentage: item.total ? ((item.value / item.total) * 100).toFixed(1) : 0
    }))
  },
  
  transformApiResponse: <T>(response: any): ReportsApiResponse<T> => ({
    success: response.success || true,
    data: response.data,
    message: response.message,
    generatedAt: response.generatedAt || new Date().toISOString()
  })
}

// =============================================================================
// DASHBOARD API
// =============================================================================

const dashboardApiMethods = {
  getSummary: (filters?: ReportFilter): Promise<ReportsApiResponse<ReportsDashboardSummary>> =>
    api.get(`/reports/dashboard/summary${buildQueryString(filters || {})}`),
}

// =============================================================================
// STOCK REPORTS API
// =============================================================================

const stockReportsApiMethods = {
  getLevelsReport: (filters?: ReportFilter): Promise<ReportsApiResponse<StockLevelReport>> =>
    api.get(`/reports/stocks/levels${buildQueryString(filters || {})}`),

  getMovementsReport: (filters?: ReportFilter): Promise<ReportsApiResponse<StockMovementReport>> =>
    api.get(`/reports/stocks/movements${buildQueryString(filters || {})}`),

  getCategoryAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<CategoryAnalysisReport>> =>
    api.get(`/reports/stocks/categories${buildQueryString(filters || {})}`),

  getUsageTrends: (filters?: ReportFilter): Promise<ReportsApiResponse<UsageTrendReport>> =>
    api.get(`/reports/stocks/usage-trends${buildQueryString(filters || {})}`),

  getExpiryAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<ExpiryAnalysisReport>> =>
    api.get(`/reports/stocks/expiry-analysis${buildQueryString(filters || {})}`),

  getTopUsedItems: (filters?: ReportFilter & { limit?: number }): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/stocks/top-used${buildQueryString(filters || {})}`),

  getLeastUsedItems: (filters?: ReportFilter & { limit?: number }): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/stocks/least-used${buildQueryString(filters || {})}`),

  getChartsData: (filters?: ReportFilter): Promise<ReportsApiResponse<StockChartsData>> =>
    api.get(`/reports/stocks/charts${buildQueryString(filters || {})}`),

  getTrendAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<StockTrendAnalysis>> =>
    api.get(`/reports/stocks/trend-analysis${buildQueryString(filters || {})}`),

  getUsageReport: (filters?: ReportFilter): Promise<ReportsApiResponse<StockUsageData>> =>
    api.get(`/reports/stocks/usage-report${buildQueryString(filters || {})}`),
}

// =============================================================================
// SUPPLIER REPORTS API
// =============================================================================

const supplierReportsApiMethods = {
  getPerformanceReport: (filters?: ReportFilter): Promise<ReportsApiResponse<SupplierPerformanceReport>> =>
    api.get(`/reports/suppliers/performance${buildQueryString(filters || {})}`),

  getPurchaseAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<PurchaseAnalysisReport>> =>
    api.get(`/reports/suppliers/purchases${buildQueryString(filters || {})}`),

  getComparison: (supplierIds: number[], filters?: ReportFilter): Promise<ReportsApiResponse<any>> => {
    const params = new URLSearchParams()
    supplierIds.forEach(id => params.append('supplier_ids[]', id.toString()))
    const queryString = buildQueryString(filters || {})
    const separator = queryString ? '&' : '?'
    return api.get(`/reports/suppliers/comparison${queryString}${separator}${params.toString()}`)
  },

  getPriceTrends: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/suppliers/price-trends${buildQueryString(filters || {})}`),

  getTrendAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/suppliers/trends${buildQueryString(filters || {})}`),

  getTopSuppliers: (filters?: ReportFilter & { limit?: number }): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/suppliers/top-performers${buildQueryString(filters || {})}`),

  getDeliveryPerformance: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/suppliers/delivery-performance${buildQueryString(filters || {})}`),

  getCostAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/suppliers/cost-analysis${buildQueryString(filters || {})}`),
}

// =============================================================================
// CLINIC REPORTS API
// =============================================================================

const clinicReportsApiMethods = {
  getConsumptionReport: (filters?: ReportFilter): Promise<ReportsApiResponse<ClinicConsumptionReport>> =>
    api.get(`/reports/clinics/consumption${buildQueryString(filters || {})}`),

  getDoctorUsage: (filters?: ReportFilter): Promise<ReportsApiResponse<DoctorUsageReport>> =>
    api.get(`/reports/clinics/doctor-usage${buildQueryString(filters || {})}`),

  getEfficiencyReport: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/clinics/efficiency${buildQueryString(filters || {})}`),

  getComparison: (clinicIds: number[], filters?: ReportFilter): Promise<ReportsApiResponse<any>> => {
    const params = new URLSearchParams()
    clinicIds.forEach(id => params.append('clinic_ids[]', id.toString()))
    const queryString = buildQueryString(filters || {})
    const separator = queryString ? '&' : '?'
    return api.get(`/reports/clinics/comparison${queryString}${separator}${params.toString()}`)
  },

  getCostAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/clinics/cost-analysis${buildQueryString(filters || {})}`),

  getStockReport: (clinicId: number, filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/clinics/${clinicId}/stocks${buildQueryString(filters || {})}`),

  getUsageTrend: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/clinics/usage-trends${buildQueryString(filters || {})}`),

  getCostReport: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/clinics/costs${buildQueryString(filters || {})}`),

  getTurnoverRate: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/clinics/turnover-rate${buildQueryString(filters || {})}`),
}

// =============================================================================
// TRANSFER REPORTS API
// =============================================================================

const transferReportsApiMethods = {
  getAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<TransferAnalysisReport>> =>
    api.get(`/reports/transfers/analysis${buildQueryString(filters || {})}`),

  getFlowAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/transfers/flow${buildQueryString(filters || {})}`),

  getFrequencyReport: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/transfers/frequency${buildQueryString(filters || {})}`),

  getApprovalTimes: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/transfers/approval-times${buildQueryString(filters || {})}`),

  getEfficiency: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/transfers/efficiency${buildQueryString(filters || {})}`),
}

// =============================================================================
// ALERT REPORTS API
// =============================================================================

const alertReportsApiMethods = {
  getStatistics: (filters?: ReportFilter): Promise<ReportsApiResponse<AlertStatisticsReport>> =>
    api.get(`/reports/alerts/statistics${buildQueryString(filters || {})}`),

  getResolutionTimes: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/alerts/resolution-times${buildQueryString(filters || {})}`),

  getRecurringAlerts: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/alerts/recurring${buildQueryString(filters || {})}`),

  getTrendAnalysis: (filters?: ReportFilter): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/alerts/trends${buildQueryString(filters || {})}`),
}

// =============================================================================
// EXPORT API
// =============================================================================

const exportApiMethods = {
  exportToExcel: (reportType: string, options: ExportOptions): Promise<Blob> =>
    api.post(`/reports/export/excel`, { reportType, ...options }, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    }),

  exportToPdf: (reportType: string, options: ExportOptions): Promise<Blob> =>
    api.post(`/reports/export/pdf`, { reportType, ...options }, {
      responseType: 'blob',
      headers: {
        'Accept': 'application/pdf'
      }
    }),

  exportToCsv: (reportType: string, options: ExportOptions): Promise<Blob> =>
    api.post(`/reports/export/csv`, { reportType, ...options }, {
      responseType: 'blob',
      headers: {
        'Accept': 'text/csv'
      }
    }),

  exportChartImage: (chartConfig: any, format: 'png' | 'jpg'): Promise<Blob> =>
    api.post(`/reports/export/chart-image`, { chartConfig, format }, {
      responseType: 'blob',
      headers: {
        'Accept': `image/${format}`
      }
    }),

  generateReportPreview: (reportType: string, options: ExportOptions): Promise<ReportsApiResponse<any>> =>
    api.post(`/reports/export/preview`, { reportType, ...options }),

  validateExportOptions: (options: ExportOptions): Promise<ReportsApiResponse<boolean>> =>
    api.post(`/reports/export/validate`, options),

  getExportProgress: (exportId: string): Promise<ReportsApiResponse<any>> =>
    api.get(`/reports/export/progress/${exportId}`),
}

// =============================================================================
// EXPORTS
// =============================================================================

export const dashboardApi = dashboardApiMethods
export const stockReportsApi = stockReportsApiMethods
export const supplierReportsApi = supplierReportsApiMethods
export const clinicReportsApi = clinicReportsApiMethods
export const transferReportsApi = transferReportsApiMethods
export const alertReportsApi = alertReportsApiMethods
export const exportApi = exportApiMethods

// Combined API
export const reportsApi = {
  dashboard: dashboardApi,
  stocks: stockReportsApi,
  suppliers: supplierReportsApi,
  clinics: clinicReportsApi,
  transfers: transferReportsApi,
  alerts: alertReportsApi,
  export: exportApi,
  helpers: reportsApiHelpers,
}

export default reportsApi
export { buildQueryString }