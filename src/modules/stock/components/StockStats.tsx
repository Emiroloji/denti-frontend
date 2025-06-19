// src/modules/stock/components/StockStats.tsx

import React from 'react'
import { Card, Row, Col, Statistic } from 'antd'
import { 
  SettingOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  DollarOutlined
} from '@ant-design/icons'

interface StockStatsData {
  total_items: number
  low_stock_items: number
  critical_stock_items: number
  expiring_items: number
  total_value: number
}

interface StockStatsProps {
  stats: StockStatsData | null
}

export const StockStats: React.FC<StockStatsProps> = ({ stats }) => {
  if (!stats) return null

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic 
            title="Toplam Stok" 
            value={stats.total_items}
            prefix={<SettingOutlined />}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card>
          <Statistic 
            title="Düşük Seviye" 
            value={stats.low_stock_items}
            valueStyle={{ color: '#faad14' }}
            prefix={<WarningOutlined />}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card>
          <Statistic 
            title="Kritik Seviye" 
            value={stats.critical_stock_items}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<ExclamationCircleOutlined />}
          />
        </Card>
      </Col>
      
      <Col span={6}>
        <Card>
          <Statistic 
            title="Toplam Değer" 
            value={stats.total_value}
            precision={2}
            suffix="TL"
            prefix={<DollarOutlined />}
          />
        </Card>
      </Col>
    </Row>
  )
}