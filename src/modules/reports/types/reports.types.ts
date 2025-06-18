// src/modules/reports/types/reports.types.ts

// =============================================================================
// BASE TYPES
// =============================================================================

export interface DateRange {
  startDate: string
  endDate: string
}

export interface DateRangePreset {
  key: string
  label: string
  range: DateRange
}

export interface ReportFilter {
  startDate?: string
  endDate?: string
  dateRange?: DateRange
  clinicId?: number
  clinicIds?: number[]
  supplierId?: number
  supplierIds?: number[]
  category?: string
  categories?: string[] // ✅ ADDED
  stockStatus?: 'low' | 'critical' | 'normal' | 'out_of_stock'
  search?: string
}

// =============================================================================
// EXPORT CONFIG & OPTIONS
// =============================================================================

export interface ExportConfig {
  format: 'excel' | 'pdf' | 'csv'
  fileName?: string
  includeCharts: boolean
  includeRawData?: boolean
  includeFilters?: boolean
  compression?: boolean
  quality?: 'low' | 'medium' | 'high' | 'print'
  layout?: 'portrait' | 'landscape'
  theme?: 'professional' | 'medical' | 'modern' | 'minimal'
}

export interface ExportOptions {
  fileName?: string
  format: 'excel' | 'pdf' | 'csv' | 'xlsx' | 'xls'
  includeCharts?: boolean
  includeRawData?: boolean
  compression?: boolean
  password?: string
  sections?: string[]
  
  // PDF specific
  layout?: 'executive' | 'detailed' | 'presentation' | 'dashboard'
  theme?: 'professional' | 'medical' | 'modern' | 'minimal'
  chartQuality?: 'standard' | 'high' | 'print'
  pageOrientation?: 'portrait' | 'landscape'
  includeWatermark?: boolean
  headerFooter?: boolean
  
  // Excel specific
  excelFormat?: 'xlsx' | 'xls'
  dataSections?: string[]
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ReportsApiResponse<T> {
  success: boolean
  data: T
  message?: string
  generatedAt?: string
}

// =============================================================================
// CHART DATA TYPES
// =============================================================================

export interface ChartDataPoint {
  name: string
  value: number
  percentage?: number
  count?: number
  date?: string
  category?: string
  label?: string // ✅ ADDED
  color?: string // ✅ ADDED
}

export interface StockChartsData {
  levelChart: Array<{
    category: string
    normal: number
    low: number
    critical: number
    outOfStock: number
  }>
  usageChart: Array<ChartDataPoint>
  categoryChart: Array<ChartDataPoint> // ✅ FIXED: was categoryData
}

// =============================================================================
// STOCK REPORTS
// =============================================================================

export interface StockLevelReport {
  summary: {
    total: number
    normal: number
    low: number
    critical: number
    outOfStock: number
    totalStocks: number // ✅ ADDED
    normalLevel: number // ✅ ADDED  
    lowLevel: number // ✅ ADDED
    criticalLevel: number // ✅ ADDED
  }
  details: Array<{
    id: number
    name: string
    currentStock: number
    minLevel: number
    criticalLevel: number
    status: 'normal' | 'low' | 'critical' | 'out_of_stock'
    category: string
    clinic: string
  }>
  categories?: Array<{ // ✅ ADDED
    name: string
    value: number
    label: string
    color: string
    percentage: number
  }>
}

export interface StockMovementReport {
  totalMovements: number
  inboundMovements: number
  outboundMovements: number
  adjustments: number
  movements: Array<{
    id: number
    stockName: string
    type: 'in' | 'out' | 'adjustment'
    quantity: number
    date: string
    performedBy: string
    reason?: string
  }>
}

export interface CategoryAnalysisReport {
  categories: Array<{
    name: string
    totalItems: number
    totalValue: number
    averageUsage: number
    totalStock: number // ✅ ADDED
    itemCount: number // ✅ ADDED
    lowStockCount: number // ✅ ADDED
    criticalStockCount: number // ✅ ADDED
    topItems: Array<{
      name: string
      usage: number
      value: number
    }>
  }>
}

export interface UsageTrendReport {
  trends: Array<{
    date: string
    totalUsage: number
    categories: Record<string, number>
    metric?: string // ✅ ADDED
    change?: number // ✅ ADDED
    changePercent?: number // ✅ ADDED
    label?: string // ✅ ADDED
  }>
  predictions: Array<{
    date: string
    predictedUsage: number
    confidence: number
    label?: string // ✅ ADDED
  }>
}

export interface ExpiryAnalysisReport {
  expiringSoon: Array<{
    id: number
    name: string
    expiryDate: string
    daysUntilExpiry: number
    currentStock: number
    estimatedLoss: number
  }>
  expired: Array<{
    id: number
    name: string
    expiryDate: string
    daysExpired: number
    stockLost: number
    lossValue: number
  }>
}

export interface StockTrendAnalysis {
  trends: Array<{
    date: string
    metric: string
    value: number
    change: number
    changePercent: number
    label?: string // ✅ ADDED
  }>
  forecast: Array<{
    date: string
    predicted: number
    confidence: number
    upperBound: number
    lowerBound: number
    label?: string // ✅ ADDED
  }>
  kpis: {
    totalValue: number
    avgTurnover: number
    efficiency: number
    costSavings: number
  }
}

export interface StockUsageData {
  period?: string // ✅ ADDED
  data: Array<{
    date: string
    fullDate?: string // ✅ ADDED
    totalUsage: number
    [key: string]: string | number | undefined // for dynamic categories
  }>
  summary?: { // ✅ ADDED
    totalUsage: number
    avgDaily: number
    trend: string
  }
  daily: Array<{
    date: string
    usage: number
    categories: Record<string, number>
  }>
  weekly: Array<{
    week: string
    usage: number
    categories: Record<string, number>
  }>
  monthly: Array<{
    month: string
    usage: number
    categories: Record<string, number>
  }>
}

// =============================================================================
// SUPPLIER REPORTS
// =============================================================================

export interface SupplierPerformanceReport {
  summary?: { // ✅ ADDED
    totalSuppliers: number
    avgDeliveryTime: number
    avgQualityRating: number
  }
  suppliers: Array<{
    id: number
    name: string
    totalOrders: number
    onTimeDeliveries: number
    onTimeDelivery?: number // ✅ ADDED for compatibility
    qualityRating: number
    averageDeliveryTime: number
    totalValue: number
    lastOrderDate: string
    activeProducts?: number // ✅ ADDED
  }>
}

export interface SupplierPerformanceData { // ✅ ADDED
  id: number
  name: string
  performance: number
  deliveryScore: number
  qualityScore: number
  totalValue: number
}

export interface SupplierComparisonData { // ✅ ADDED
  supplierId: number
  supplierName: string
  metrics: {
    deliveryTime: number
    qualityRating: number
    totalOrders: number
    totalValue: number
  }
}

export interface TrendDataPoint { // ✅ ADDED
  date: string
  value: number
  label?: string
  category?: string
}

export interface PurchaseAnalysisReport {
  totalPurchases: number
  totalValue: number
  averageOrderValue: number
  monthlyTrends: Array<{
    month: string
    orderCount: number
    totalValue: number
  }>
  monthlyTrend?: Array<{ // ✅ ADDED for compatibility
    month: string
    orderCount: number
    totalValue: number
  }>
  categoryBreakdown?: Array<{ // ✅ ADDED
    name: string
    value: number
  }>
  topSuppliers: Array<{
    name: string
    orderCount: number
    totalValue: number
    averageDeliveryTime: number
  }>
}

// =============================================================================
// CLINIC REPORTS
// =============================================================================

export interface ClinicConsumptionReport {
  clinics: Array<{
    id: number
    name: string
    totalConsumption: number
    totalValue: number
    efficiency: number
    topCategories: Array<{
      category: string
      consumption: number
      value: number
    }>
  }>
  comparison?: Array<{ // ✅ ADDED
    clinicId: number
    clinicName: string
    totalConsumption: number
    efficiency: number
  }>
}

export interface ClinicStockData { // ✅ ADDED
  clinicId: number
  clinicName: string
  totalStock: number
  lowStock: number
  criticalStock: number
}

export interface ClinicComparisonData { // ✅ ADDED
  clinicId: number
  clinicName: string
  metrics: {
    totalConsumption: number
    efficiency: number
    totalValue: number
    stockCount: number
  }
}

export interface DoctorUsageReport {
  doctors: Array<{
    name: string
    clinic: string
    totalUsage: number
    averageDaily: number
    categories: Record<string, number>
    efficiency: number
  }>
}

export interface TransferAnalysisReport {
  totalTransfers: number
  averageApprovalTime: number
  mostRequestedItems: Array<{
    itemName: string
    requestCount: number
    totalQuantity: number
  }>
  clinicActivity: Array<{
    clinicName: string
    requestsSent: number
    requestsReceived: number
    approvalRate: number
  }>
}

// =============================================================================
// ALERT REPORTS
// =============================================================================

export interface AlertStatisticsReport {
  totalAlerts: number
  activeAlerts: number
  resolvedAlerts: number
  averageResolutionTime: number
  alertsByType: Record<string, number>
  alertsByPriority: Record<string, number>
  trends: Array<{
    date: string
    alertCount: number
    resolvedCount: number
  }>
}

// =============================================================================
// DASHBOARD SUMMARY
// =============================================================================

export interface ReportsDashboardSummary {
  stockSummary: {
    total: number
    normal: number
    low: number
    critical: number
    outOfStock: number
  }
  supplierSummary: {
    totalSuppliers: number
    activeSuppliers: number
    averageRating: number
    avgDeliveryTime: number
  }
  clinicSummary: {
    totalClinics: number
    activeClinics: number
    totalConsumption: number
    avgEfficiency: number
  }
  alertSummary: {
    totalAlerts: number
    criticalAlerts: number
    pendingAlerts: number
    resolvedToday: number
  }
}

// =============================================================================
// HOOK RESPONSE TYPES
// =============================================================================

export interface UseStockReportsReturn {
  stockLevels: StockLevelReport | null
  stockMovements: StockMovementReport | null
  categoryAnalysis: CategoryAnalysisReport | null
  usageTrends: UsageTrendReport | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

export interface ChartComponentProps {
  filters?: Partial<ReportFilter>
  height?: number
  showControls?: boolean
  onExport?: (data: unknown, format: string) => void
}

export interface FilterComponentProps {
  value?: Partial<ReportFilter>
  onChange?: (filters: Partial<ReportFilter>) => void
  disabled?: boolean
}

// =============================================================================
// EXPORT FORMATS
// =============================================================================

export type ExportFormat = 'excel' | 'pdf' | 'csv' | 'xlsx' | 'xls'
export type ReportType = 'stock' | 'supplier' | 'clinic' | 'trend'
export type ChartType = 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'table'
export type ValueType = 'count' | 'percentage' | 'value'