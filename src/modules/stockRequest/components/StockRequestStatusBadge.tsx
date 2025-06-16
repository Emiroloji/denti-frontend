// src/modules/stockRequest/components/StockRequestStatusBadge.tsx

import React from 'react'
import { Tag } from 'antd'
import { 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import { StockRequestStatus } from '../types/stockRequest.types'

interface StockRequestStatusBadgeProps {
  status: StockRequestStatus
  size?: 'small' | 'default'
}

export const StockRequestStatusBadge: React.FC<StockRequestStatusBadgeProps> = ({ 
  status,
  size = 'default' 
}) => {
  const getStatusConfig = (status: StockRequestStatus) => {
    switch (status) {
      case 'pending':
        return {
          color: 'orange',
          icon: <ClockCircleOutlined />,
          text: 'Bekliyor'
        }
      case 'approved':
        return {
          color: 'blue',
          icon: <CheckCircleOutlined />,
          text: 'Onaylandı'
        }
      case 'rejected':
        return {
          color: 'red',
          icon: <CloseCircleOutlined />,
          text: 'Reddedildi'
        }
      case 'completed':
        return {
          color: 'green',
          icon: <DownloadOutlined />,
          text: 'Tamamlandı'
        }
      default:
        return {
          color: 'default',
          icon: null,
          text: status
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Tag 
      color={config.color} 
      icon={config.icon}
      style={{ 
        fontSize: size === 'small' ? '12px' : '14px',
        padding: size === 'small' ? '2px 6px' : '4px 8px',
        borderRadius: '6px',
        fontWeight: 500
      }}
    >
      {config.text}
    </Tag>
  )
}