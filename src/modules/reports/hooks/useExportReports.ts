/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/modules/reports/hooks/useExportReports.ts

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { message, notification } from 'antd'
import { reportsApi } from '../services/reportsApi'
import type { ExportOptions } from '../types/reports.types'

// Export types
type ExportFormat = 'excel' | 'pdf' | 'csv'
type ReportType = 'stocks' | 'suppliers' | 'clinics' | 'transfers' | 'alerts' | 'dashboard'

interface ExportProgress {
  isExporting: boolean
  progress: number
  currentStep: string
  format: ExportFormat | null
}

interface ExportState {
  [key: string]: ExportProgress
}

// =============================================================================
// EXPORT REPORTS HOOK
// =============================================================================

export const useExportReports = () => {
  const [exportStates, setExportStates] = useState<ExportState>({})

  // Update export progress
  const updateProgress = (
    reportType: ReportType, 
    format: ExportFormat, 
    progress: number, 
    step: string
  ) => {
    const key = `${reportType}-${format}`
    setExportStates(prev => ({
      ...prev,
      [key]: {
        isExporting: true,
        progress,
        currentStep: step,
        format,
      }
    }))
  }

  // Clear export state
  const clearExportState = (reportType: ReportType, format: ExportFormat) => {
    const key = `${reportType}-${format}`
    setExportStates(prev => {
      const newState = { ...prev }
      delete newState[key]
      return newState
    })
  }

  // Download file helper
  const downloadFile = (blob: Blob, filename: string, _format: ExportFormat) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    
    // Add to DOM, click, and remove
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    window.URL.revokeObjectURL(url)
    
    // Success notification
    notification.success({
      message: 'Export Başarılı',
      description: `${filename} dosyası başarıyla indirildi.`,
      duration: 4,
    })
  }

  // Generate filename - ExportOptions interface'e uygun
  const generateFilename = (reportType: ReportType, format: ExportFormat, options: ExportOptions): string => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    const dateRange = options.fileName ? 
      `_${options.fileName}` : ''
    
    const reportNames = {
      stocks: 'Stok_Raporu',
      suppliers: 'Tedarikci_Raporu',
      clinics: 'Klinik_Raporu',
      transfers: 'Transfer_Raporu',
      alerts: 'Uyari_Raporu',
      dashboard: 'Dashboard_Raporu'
    }
    
    return `${reportNames[reportType]}_${timestamp}${dateRange}.${format}`
  }

  // =============================================================================
  // EXCEL EXPORT
  // =============================================================================

  const excelExportMutation = useMutation({
    mutationFn: async ({ reportType, options }: { reportType: ReportType, options: ExportOptions }) => {
      updateProgress(reportType, 'excel', 10, 'Veri hazırlanıyor...')
      
      updateProgress(reportType, 'excel', 30, 'Excel dosyası oluşturuluyor...')
      const blob = await reportsApi.export.exportToExcel(reportType, options)
      
      updateProgress(reportType, 'excel', 90, 'Dosya indiriliyor...')
      return { blob, reportType, options }
    },
    onSuccess: ({ blob, reportType, options }) => {
      const filename = generateFilename(reportType, 'excel', options)
      downloadFile(blob, filename, 'excel')
      clearExportState(reportType, 'excel')
    },
    onError: (error: any, variables) => {
      const errorMessage = error.response?.data?.message || 'Excel export işlemi başarısız'
      message.error(errorMessage)
      clearExportState(variables.reportType, 'excel')
    }
  })

  // =============================================================================
  // PDF EXPORT
  // =============================================================================

  const pdfExportMutation = useMutation({
    mutationFn: async ({ reportType, options }: { reportType: ReportType, options: ExportOptions }) => {
      updateProgress(reportType, 'pdf', 10, 'Veri hazırlanıyor...')
      
      updateProgress(reportType, 'pdf', 40, 'PDF formatlanıyor...')
      const blob = await reportsApi.export.exportToPdf(reportType, options)
      
      updateProgress(reportType, 'pdf', 90, 'Dosya indiriliyor...')
      return { blob, reportType, options }
    },
    onSuccess: ({ blob, reportType, options }) => {
      const filename = generateFilename(reportType, 'pdf', options)
      downloadFile(blob, filename, 'pdf')
      clearExportState(reportType, 'pdf')
    },
    onError: (error: any, variables) => {
      const errorMessage = error.response?.data?.message || 'PDF export işlemi başarısız'
      message.error(errorMessage)
      clearExportState(variables.reportType, 'pdf')
    }
  })

  // =============================================================================
  // CSV EXPORT
  // =============================================================================

  const csvExportMutation = useMutation({
    mutationFn: async ({ reportType, options }: { reportType: ReportType, options: ExportOptions }) => {
      updateProgress(reportType, 'csv', 10, 'Veri hazırlanıyor...')
      
      updateProgress(reportType, 'csv', 50, 'CSV formatına çevriliyor...')
      const blob = await reportsApi.export.exportToCsv(reportType, options)
      
      updateProgress(reportType, 'csv', 90, 'Dosya indiriliyor...')
      return { blob, reportType, options }
    },
    onSuccess: ({ blob, reportType, options }) => {
      const filename = generateFilename(reportType, 'csv', options)
      downloadFile(blob, filename, 'csv')
      clearExportState(reportType, 'csv')
    },
    onError: (error: any, variables) => {
      const errorMessage = error.response?.data?.message || 'CSV export işlemi başarısız'
      message.error(errorMessage)
      clearExportState(variables.reportType, 'csv')
    }
  })

  // =============================================================================
  // CHART IMAGE EXPORT
  // =============================================================================

  const chartImageExportMutation = useMutation({
    mutationFn: async ({ 
      chartConfig, 
      format, 
      filename 
    }: { 
      chartConfig: unknown, 
      format: 'png' | 'jpg', 
      filename?: string 
    }) => {
      const blob = await reportsApi.export.exportChartImage(chartConfig, format)
      return { blob, format, filename: filename || `chart_${Date.now()}.${format}` }
    },
    onSuccess: ({ blob, filename }) => {
      downloadFile(blob, filename, 'excel' as ExportFormat)
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Chart export işlemi başarısız'
      message.error(errorMessage)
    }
  })

  // =============================================================================
  // EXPORT FUNCTIONS
  // =============================================================================

  const exportToExcel = (reportType: ReportType, options: ExportOptions) => {
    excelExportMutation.mutate({ reportType, options })
  }

  const exportToPdf = (reportType: ReportType, options: ExportOptions) => {
    pdfExportMutation.mutate({ reportType, options })
  }

  const exportToCsv = (reportType: ReportType, options: ExportOptions) => {
    csvExportMutation.mutate({ reportType, options })
  }

  const exportChart = (chartConfig: unknown, format: 'png' | 'jpg' = 'png', filename?: string) => {
    chartImageExportMutation.mutate({ chartConfig, format, filename })
  }

  // Bulk export function
  const exportAllFormats = async (reportType: ReportType, options: ExportOptions) => {
    const exports = []
    
    if (options.format === 'excel' || !options.format) {
      exports.push(exportToExcel(reportType, { ...options, format: 'excel' }))
    }
    
    if (options.format === 'pdf' || !options.format) {
      exports.push(exportToPdf(reportType, { ...options, format: 'pdf' }))
    }
    
    if (options.format === 'csv' || !options.format) {
      exports.push(exportToCsv(reportType, { ...options, format: 'csv' }))
    }

    return Promise.all(exports)
  }

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getExportProgress = (reportType: ReportType, format: ExportFormat): ExportProgress | null => {
    const key = `${reportType}-${format}`
    return exportStates[key] || null
  }

  const isExporting = (reportType?: ReportType, format?: ExportFormat): boolean => {
    if (reportType && format) {
      const progress = getExportProgress(reportType, format)
      return progress?.isExporting || false
    }
    
    return Object.values(exportStates).some(state => state.isExporting)
  }

  const getActiveExports = () => {
    return Object.entries(exportStates)
      .filter(([, state]) => state.isExporting)
      .map(([key, state]) => ({
        key,
        ...state,
      }))
  }

  // =============================================================================
  // RETURN OBJECT
  // =============================================================================

  return {
    // Export functions
    exportToExcel,
    exportToPdf,
    exportToCsv,
    exportChart,
    exportAllFormats,
    
    // State queries
    getExportProgress,
    isExporting,
    getActiveExports,
    
    // Mutation states
    isExportingExcel: excelExportMutation.isPending,
    isExportingPdf: pdfExportMutation.isPending,
    isExportingCsv: csvExportMutation.isPending,
    isExportingChart: chartImageExportMutation.isPending,
    
    // Export states
    exportStates,
    
    // Utility functions
    generateFilename,
    downloadFile,
    clearExportState,
  }
}

// =============================================================================
// EXPORT BUTTON HOOK
// =============================================================================

export const useExportButton = (
  reportType: ReportType,
  defaultOptions: Partial<ExportOptions> = {}
) => {
  const exportReports = useExportReports()
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includeCharts: true,
    fileName: `${reportType}_report_${new Date().toISOString().split('T')[0]}`,
    // filters field removed to fix the interface error
    ...defaultOptions,
  })

  const handleExport = (format: ExportFormat, customOptions?: Partial<ExportOptions>) => {
    const finalOptions = {
      ...exportOptions,
      ...customOptions,
      format,
    }

    switch (format) {
      case 'excel':
        exportReports.exportToExcel(reportType, finalOptions)
        break
      case 'pdf':
        exportReports.exportToPdf(reportType, finalOptions)
        break
      case 'csv':
        exportReports.exportToCsv(reportType, finalOptions)
        break
    }
  }

  const isCurrentlyExporting = (format: ExportFormat) => {
    return exportReports.isExporting(reportType, format)
  }

  const getProgress = (format: ExportFormat) => {
    return exportReports.getExportProgress(reportType, format)
  }

  return {
    exportOptions,
    setExportOptions,
    handleExport,
    isCurrentlyExporting,
    getProgress,
    isAnyExporting: exportReports.isExporting(),
  }
}