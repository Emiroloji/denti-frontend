// src/modules/stock/components/StockAlerts.tsx

import React from 'react'
import { Alert } from 'antd'
import { Stock } from '../types/stock.types'

interface StockAlertsProps {
  criticalStockItems: Stock[]
  lowStockItems: Stock[]
  expiringItems: Stock[]
}

export const StockAlerts: React.FC<StockAlertsProps> = ({
  criticalStockItems,
  lowStockItems,
  expiringItems,
}) => {
  return (
    <>
      {criticalStockItems && criticalStockItems.length > 0 && (
        <Alert
          message={`${criticalStockItems.length} ürün kritik seviyede!`}
          description={`Bu ürünler: ${criticalStockItems.slice(0, 3).map(item => item.name).join(', ')}${criticalStockItems.length > 3 ? '...' : ''}`}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {lowStockItems && lowStockItems.length > 0 && (
        <Alert
          message={`${lowStockItems.length} ürün düşük seviyede`}
          description={`Bu ürünler: ${lowStockItems.slice(0, 3).map(item => item.name).join(', ')}${lowStockItems.length > 3 ? '...' : ''}`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {expiringItems && expiringItems.length > 0 && (
        <Alert
          message={`${expiringItems.length} ürünün süresi 30 gün içinde doluyor`}
          description={`Bu ürünler: ${expiringItems.slice(0, 3).map(item => item.name).join(', ')}${expiringItems.length > 3 ? '...' : ''}`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
    </>
  )
}