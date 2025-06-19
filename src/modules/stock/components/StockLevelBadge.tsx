// src/modules/stock/components/StockLevelBadge.tsx

import React from 'react'
import { Tag } from 'antd'
import { Stock } from '../types/stock.types'

interface StockLevelBadgeProps {
  stock: Stock
}

export const StockLevelBadge: React.FC<StockLevelBadgeProps> = ({ stock }) => {
  const getStockLevel = () => {
    const { current_stock, min_stock_level, critical_stock_level, expiry_date } = stock
    
    // Süre kontrolü
    if (expiry_date) {
      const expiryDate = new Date(expiry_date)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry <= 0) {
        return { level: 'expired', color: 'default', text: 'Süresi Geçmiş' }
      }
      
      if (daysUntilExpiry <= 7) {
        return { level: 'expiring', color: 'red', text: `${daysUntilExpiry} gün kaldı` }
      }
    }
    
    // Stok seviye kontrolü
    if (current_stock <= critical_stock_level) {
      return { level: 'critical', color: 'red', text: 'Kritik Seviye' }
    }
    
    if (current_stock <= min_stock_level) {
      return { level: 'low', color: 'orange', text: 'Düşük Seviye' }
    }
    
    return { level: 'normal', color: 'green', text: 'Normal' }
  }

  const levelInfo = getStockLevel()

  return (
    <Tag color={levelInfo.color} style={{ margin: 0 }}>
      {levelInfo.text}
    </Tag>
  )
}