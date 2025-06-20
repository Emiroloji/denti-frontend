// src/modules/stock/components/StockList.tsx

import React, { useState, useCallback, useMemo } from 'react'
import { Card, Form, Typography } from 'antd'
import { useStocks } from '../hooks/useStocks'
import { Stock, StockFilter, StockAdjustmentRequest, StockUsageRequest } from '../types/stock.types'

// Component imports
import { StockTable } from './StockTable'
import { StockFilters } from './StockFilters'
import { StockStats } from './StockStats'
import { StockAlerts } from './StockAlerts'
import { StockModals } from './StockModals'

const { Title } = Typography

export const StockList: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<StockFilter>({})
  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [isFormModalVisible, setIsFormModalVisible] = useState(false)
  const [isAdjustModalVisible, setIsAdjustModalVisible] = useState(false)
  const [isUseModalVisible, setIsUseModalVisible] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  
  // Form instances
  const [adjustForm] = Form.useForm()
  const [useForm] = Form.useForm()

  // Hooks
  const { 
    stocks, 
    isLoading, 
    refetch, 
    softDeleteStock,      // ✅ YENİ - Pasif yap
    hardDeleteStock,      // ✅ YENİ - Kalıcı sil
    reactivateStock,      // ✅ YENİ - Aktif et
    adjustStock, 
    useStock: executeStockUsage,
    isAdjusting,
    isUsing,
    isSoftDeleting,       // ✅ YENİ Loading state
    isHardDeleting,       // ✅ YENİ Loading state
    isReactivating        // ✅ YENİ Loading state
  } = useStocks(filters)

  // Computed data (manual calculations since hooks are disabled)
  const stockStats = useMemo(() => {
    if (!stocks) return null
    
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    return {
      total_items: stocks.length,
      low_stock_items: stocks.filter(s => s.current_stock <= s.min_stock_level).length,
      critical_stock_items: stocks.filter(s => s.current_stock <= s.critical_stock_level).length,
      expiring_items: stocks.filter(s => {
        if (!s.expiry_date) return false
        const expiryDate = new Date(s.expiry_date)
        return expiryDate <= thirtyDaysFromNow && expiryDate >= today
      }).length,
      total_value: stocks.reduce((sum, s) => sum + (s.purchase_price * s.current_stock), 0)
    }
  }, [stocks])

  const lowStockItems = useMemo(() => {
    if (!stocks) return []
    return stocks.filter(s => s.current_stock <= s.min_stock_level)
  }, [stocks])

  const criticalStockItems = useMemo(() => {
    if (!stocks) return []
    return stocks.filter(s => s.current_stock <= s.critical_stock_level)
  }, [stocks])

  const expiringItems = useMemo(() => {
    if (!stocks) return []
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    
    return stocks.filter(s => {
      if (!s.expiry_date) return false
      const expiryDate = new Date(s.expiry_date)
      return expiryDate <= thirtyDaysFromNow && expiryDate >= today
    })
  }, [stocks])

  // Event handlers
  const handleSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, name: value }))
  }, [])

  const handleFilterChange = useCallback((field: keyof StockFilter, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleAdd = useCallback(() => {
    setEditingStock(null)
    setIsFormModalVisible(true)
  }, [])

  const handleEdit = useCallback((stock: Stock) => {
    setEditingStock(stock)
    setIsFormModalVisible(true)
  }, [])

  // ✅ YENİ HANDLER'LAR - Pasif/Aktif/Kalıcı Silme
  const handleSoftDelete = useCallback(async (id: number) => {
    try {
      await softDeleteStock(id)
    } catch (error) {
      console.error('Soft delete hatası:', error)
    }
  }, [softDeleteStock])

  const handleHardDelete = useCallback(async (id: number) => {
    try {
      await hardDeleteStock(id)
    } catch (error) {
      console.error('Hard delete hatası:', error)
    }
  }, [hardDeleteStock])

  const handleReactivate = useCallback(async (id: number) => {
    try {
      await reactivateStock(id)
    } catch (error) {
      console.error('Reactivate hatası:', error)
    }
  }, [reactivateStock])

  const handleAdjust = useCallback((stock: Stock) => {
    setSelectedStock(stock)
    setIsAdjustModalVisible(true)
    adjustForm.resetFields()
  }, [adjustForm])

  const handleUse = useCallback((stock: Stock) => {
    setSelectedStock(stock)
    setIsUseModalVisible(true)
    useForm.resetFields()
  }, [useForm])

  const onAdjustSubmit = useCallback(async (values: StockAdjustmentRequest) => {
    if (!selectedStock) return
    
    try {
      await adjustStock({ id: selectedStock.id, data: values })
      setIsAdjustModalVisible(false)
      setSelectedStock(null)
      adjustForm.resetFields()
    } catch (error) {
      console.error('Stok ayarlama hatası:', error)
    }
  }, [selectedStock, adjustStock, adjustForm])

  const handleStockUsage = useCallback(async (values: StockUsageRequest) => {
    if (!selectedStock) return
    
    try {
      await executeStockUsage({ id: selectedStock.id, data: values })
      setIsUseModalVisible(false)
      setSelectedStock(null)
      useForm.resetFields()
    } catch (error) {
      console.error('Stok kullanım hatası:', error)
    }
  }, [selectedStock, executeStockUsage, useForm])

  const onFormSuccess = useCallback(() => {
    setIsFormModalVisible(false)
    setEditingStock(null)
  }, [])

  // Modal handlers
  const handleFormModalClose = useCallback(() => setIsFormModalVisible(false), [])
  const handleAdjustModalClose = useCallback(() => setIsAdjustModalVisible(false), [])
  const handleUseModalClose = useCallback(() => setIsUseModalVisible(false), [])

  return (
    <div>
      <Title level={2}>Stok Yönetimi</Title>
      
      {/* İstatistik Kartları */}
      <StockStats stats={stockStats} />
      
      {/* Uyarı Mesajları */}
      <StockAlerts 
        criticalStockItems={criticalStockItems}
        lowStockItems={lowStockItems}
        expiringItems={expiringItems}
      />
      
      {/* Filtreler */}
      <StockFilters 
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onAdd={handleAdd}
        onRefresh={refetch}
      />

      {/* Ana Tablo - ✅ YENİ HANDLER'LAR EKLENDİ */}
      <Card>
        <StockTable 
          stocks={stocks || []}
          loading={isLoading || isSoftDeleting || isHardDeleting || isReactivating}
          onEdit={handleEdit}
          onSoftDelete={handleSoftDelete}      // ✅ YENİ - Pasif yap
          onHardDelete={handleHardDelete}      // ✅ YENİ - Kalıcı sil
          onReactivate={handleReactivate}      // ✅ YENİ - Aktif et
          onAdjust={handleAdjust}
          onUse={handleUse}
        />
      </Card>

      {/* Modal'lar */}
      <StockModals 
        // Form Modal
        isFormModalVisible={isFormModalVisible}
        editingStock={editingStock}
        onFormModalClose={handleFormModalClose}
        onFormSuccess={onFormSuccess}
        
        // Adjust Modal
        isAdjustModalVisible={isAdjustModalVisible}
        selectedStock={selectedStock}
        adjustForm={adjustForm}
        onAdjustModalClose={handleAdjustModalClose}
        onAdjustSubmit={onAdjustSubmit}
        isAdjusting={isAdjusting}
        
        // Use Modal
        isUseModalVisible={isUseModalVisible}
        useForm={useForm}
        onUseModalClose={handleUseModalClose}
        onUseSubmit={handleStockUsage}
        isUsing={isUsing}
      />
    </div>
  )
}