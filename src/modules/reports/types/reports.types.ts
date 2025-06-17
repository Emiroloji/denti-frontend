// src/modules/reports/types/reports.types.ts

// Base Report Types
export interface ReportFilter {
  startDate?: string
  endDate?: string
  clinicId?: number
  clinicIds?: number[]
  supplierId?: number
  supplierIds?: number[]
  category?: string
  categories?: string[]
  stockStatus?: 'all' | 'low' | 'critical' | 'normal'
  // Eklenen: DateRange desteği için
  dateRange?: DateRange
}

// EKSİK: DateRange type'ı
export interface DateRange {
  startDate: string
  endDate: string
}

// EKSİK: ExportConfig type'ı
export interface ExportConfig {
  format: 'excel' | 'pdf' | 'csv'
  fileName?: string
  includeCharts?: boolean
  includeFilters?: boolean
  password?: string
  compression?: boolean
  quality?: 'low' | 'medium' | 'high'
  layout?: 'portrait' | 'landscape'
  theme?: 'professional' | 'medical' | 'modern' | 'minimal'
  watermark?: string
  customFields?: Record<string, any>
}

export interface ChartDataPoint {
  name: string
  value: number
  label?: string
  color?: string
  percentage?: number
}

export interface TrendDataPoint {
  date: string
  value: number
  label?: string
}

// Stok Raporları
export interface StockLevelReport {
  totalStocks: number
  normalLevel: number
  lowLevel: number
  criticalLevel: number
  outOfStock: number
  categories: ChartDataPoint[]
  clinics: ChartDataPoint[]
}

export interface StockMovementReport {
  totalMovements: number
  incoming: number
  outgoing: number
  adjustments: number
  movements: Array<{
    date: string
    incoming: number
    outgoing: number
    adjustments: number
  }>
}

export interface CategoryAnalysisReport {
  categories: Array<{
    name: string
    totalStock: number
    totalValue: number
    itemCount: number
    lowStockCount: number
    criticalStockCount: number
  }>
}

export interface UsageTrendReport {
  period: 'daily' | 'weekly' | 'monthly'
  data: Array<{
    date: string
    usage: number
    category?: string
    stockName?: string
  }>
}

export interface ExpiryAnalysisReport {
  expiringSoon: Array<{
    stockId: number
    stockName: string
    expiryDate: string
    daysToExpiry: number
    currentStock: number
    clinicName: string
  }>
  expired: Array<{
    stockId: number
    stockName: string
    expiryDate: string
    daysExpired: number
    currentStock: number
    clinicName: string
  }>
  summary: {
    totalExpiring: number
    totalExpired: number
    totalValue: number
  }
}

// Tedarikçi Raporları
export interface SupplierPerformanceReport {
  suppliers: Array<{
    id: number
    name: string
    totalOrders: number
    totalValue: number
    onTimeDelivery: number
    avgDeliveryTime: number
    qualityRating: number
    activeProducts: number
  }>
  summary: {
    totalSuppliers: number
    avgDeliveryTime: number
    avgQualityRating: number
  }
}

// EKSİK: Supplier ekstra type'ları
export interface SupplierReportResponse {
  success: boolean
  data: SupplierPerformanceReport
  message?: string
  generatedAt: string
}

export interface SupplierPerformanceData {
  id: number
  name: string
  performance: number
  deliveryScore: number
  qualityScore: number
  totalValue: number
}

export interface SupplierComparisonData {
  supplierId: number
  supplierName: string
  metrics: {
    deliveryTime: number
    qualityRating: number
    totalOrders: number
    totalValue: number
  }
}

export interface PurchaseAnalysisReport {
  totalPurchases: number
  totalValue: number
  monthlyTrend: TrendDataPoint[]
  supplierBreakdown: ChartDataPoint[]
  categoryBreakdown: ChartDataPoint[]
}

// Klinik Raporları
export interface ClinicConsumptionReport {
  clinics: Array<{
    id: number
    name: string
    totalConsumption: number
    totalValue: number
    avgDailyUsage: number
    mostUsedCategory: string
    efficiency: number
  }>
  comparison: Array<{
    clinicName: string
    thisMonth: number
    lastMonth: number
    change: number
  }>
}

// EKSİK: Clinic ekstra type'ları
export interface ClinicReportResponse {
  success: boolean
  data: ClinicConsumptionReport
  message?: string
  generatedAt: string
}

export interface ClinicStockData {
  clinicId: number
  clinicName: string
  totalItems: number
  totalValue: number
  lowStockCount: number
  criticalStockCount: number
}

export interface ClinicComparisonData {
  clinicId: number
  clinicName: string
  metrics: {
    consumption: number
    efficiency: number
    stockValue: number
    alertCount: number
  }
}

export interface ClinicTrendData {
  clinicId: number
  clinicName: string
  monthlyData: Array<{
    month: string
    consumption: number
    efficiency: number
  }>
}

export interface DoctorUsageReport {
  doctors: Array<{
    name: string
    clinic: string
    totalUsage: number
    mostUsedItem: string
    usageFrequency: number
  }>
}

// Transfer Raporları
export interface TransferAnalysisReport {
  totalTransfers: number
  completedTransfers: number
  pendingTransfers: number
  rejectedTransfers: number
  avgApprovalTime: number
  transferFlow: Array<{
    fromClinic: string
    toClinic: string
    transferCount: number
    totalQuantity: number
  }>
  monthlyTrend: TrendDataPoint[]
}

// Uyarı Raporları
export interface AlertStatisticsReport {
  totalAlerts: number
  activeAlerts: number
  resolvedAlerts: number
  alertTypes: ChartDataPoint[]
  priorityDistribution: ChartDataPoint[]
  clinicAlerts: Array<{
    clinicName: string
    alertCount: number
    criticalCount: number
  }>
  resolutionTimes: Array<{
    alertType: string
    avgResolutionHours: number
  }>
}

// Export Types - Güncellendi
export interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv'
  includeCharts: boolean
  dateRange: {
    start: string
    end: string
  }
  filters: ReportFilter
  // Eklenen ekstra opsiyonlar
  config?: ExportConfig
}

export interface ReportExportData {
  title: string
  generatedAt: string
  filters: ReportFilter
  data: unknown
  charts?: Array<{
    title: string
    type: string
    data: ChartDataPoint[] | TrendDataPoint[]
  }>
}

// Dashboard Summary
export interface ReportsDashboardSummary {
  stockMetrics: {
    totalItems: number
    lowStockCount: number
    criticalStockCount: number
    totalValue: number
  }
  transferMetrics: {
    pendingRequests: number
    completedToday: number
    avgApprovalTime: number
  }
  alertMetrics: {
    activeAlerts: number
    criticalAlerts: number
    resolvedToday: number
  }
  topCategories: ChartDataPoint[]
  recentActivity: Array<{
    type: 'stock_used' | 'transfer_completed' | 'alert_created'
    description: string
    timestamp: string
    clinic?: string
  }>
}

// API Response Wrapper
export interface ReportsApiResponse<T> {
  success: boolean
  data: T
  message?: string
  generatedAt: string
}

// Chart Configuration Types
export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'area' | 'donut'
  title: string
  subtitle?: string
  height?: number
  colors?: string[]
  showLegend?: boolean
  showTooltip?: boolean
  showGrid?: boolean
}

export interface DateRangePreset {
  label: string
  value: string
  startDate: string
  endDate: string
}

// EKSİK: Hook Data Types
export interface StockChartsData {
  levelData: ChartDataPoint[]
  categoryData: ChartDataPoint[]
  trendData: TrendDataPoint[]
  summary: {
    total: number
    low: number
    critical: number
    normal: number
  }
}

export interface StockTrendAnalysis {
  trends: TrendDataPoint[]
  forecasts: TrendDataPoint[]
  indicators: {
    direction: 'up' | 'down' | 'stable'
    percentage: number
    recommendation: string
  }
}

export interface StockUsageData {
  period: 'daily' | 'weekly' | 'monthly'
  data: Array<{
    date: string
    fullDate: string
    totalUsage: number
    [category: string]: number | string
  }>
  summary: {
    totalUsage: number
    avgDaily: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }
}