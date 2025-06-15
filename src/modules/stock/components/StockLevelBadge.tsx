// src/modules/stock/components/StockLevelBadge.tsx

import React from 'react'
import { Badge, Tooltip } from 'antd'
import { 
  ExclamationCircleOutlined, 
  WarningOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined 
} from '@ant-design/icons'
import { Stock, StockLevel } from '../types/stock.types'

interface StockLevelBadgeProps {
  stock: Stock
  showIcon?: boolean
  showText?: boolean
}

export const StockLevelBadge: React.FC<StockLevelBadgeProps> = ({ 
  stock, 
  showIcon = true, 
  showText = true 
}) => {
  const getStockLevel = (stock: Stock): StockLevel => {
    const { current_stock, min_stock_level, critical_stock_level, expiry_date } = stock

    // Süre kontrolü
    if (expiry_date) {
      const expiryDate = new Date(expiry_date)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry <= 0) {
        return {
          level: 'expired',
          color: 'gray',
          message: 'Süresi geçmiş'
        }
      }
      
      if (daysUntilExpiry <= 7) {
        return {
          level: 'expired',
          color: 'red',
          message: `${daysUntilExpiry} gün içinde süre dolacak`
        }
      }
    }

    // Stok seviye kontrolü
    if (current_stock <= critical_stock_level) {
      return {
        level: 'critical',
        color: 'red',
        message: `Kritik seviye! (${current_stock}/${critical_stock_level})`
      }
    }
    
    if (current_stock <= min_stock_level) {
      return {
        level: 'low',
        color: 'yellow',
        message: `Düşük seviye (${current_stock}/${min_stock_level})`
      }
    }
    
    return {
      level: 'normal',
      color: 'green',
      message: 'Normal seviye'
    }
  }

  const level = getStockLevel(stock)

  const getIcon = () => {
    switch (level.level) {
      case 'critical':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'low':
        return <WarningOutlined style={{ color: '#faad14' }} />
      case 'expired':
        return <CloseCircleOutlined style={{ color: '#d9d9d9' }} />
      default:
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
    }
  }

  const getBadgeStatus = () => {
    switch (level.color) {
      case 'red':
        return 'error'
      case 'yellow':
        return 'warning'
      case 'green':
        return 'success'
      default:
        return 'default'
    }
  }

  return (
    <Tooltip title={level.message}>
      <Badge 
        status={getBadgeStatus()} 
        text={
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {showIcon && getIcon()}
            {showText && (
              <span style={{ 
                color: level.color === 'yellow' ? '#faad14' : 
                       level.color === 'red' ? '#ff4d4f' : 
                       level.color === 'gray' ? '#d9d9d9' : '#52c41a'
              }}>
                {stock.current_stock} {stock.unit}
              </span>
            )}
          </span>
        }
      />
    </Tooltip>
  )
}