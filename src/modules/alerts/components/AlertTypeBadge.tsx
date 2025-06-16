// src/modules/alerts/components/AlertTypeBadge.tsx

import React from 'react'
import { Tag } from 'antd'
import { 
  WarningOutlined,
  ExclamationCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
  FireOutlined,
  DeleteOutlined,
  SwapOutlined,
  SendOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { AlertType } from '../types/alert.types'

interface AlertTypeBadgeProps {
  type: AlertType
  size?: 'small' | 'default'
}

export const AlertTypeBadge: React.FC<AlertTypeBadgeProps> = ({ 
  type,
  size = 'default' 
}) => {
  const getTypeConfig = (type: AlertType) => {
    switch (type) {
      case 'low_stock':
        return {
          color: 'orange',
          icon: <WarningOutlined />,
          text: 'Düşük Stok'
        }
      case 'critical_stock':
        return {
          color: 'red',
          icon: <ExclamationCircleOutlined />,
          text: 'Kritik Stok'
        }
      case 'out_of_stock':
        return {
          color: 'volcano',
          icon: <StopOutlined />,
          text: 'Stok Bitti'
        }
      case 'expiry_warning':
        return {
          color: 'gold',
          icon: <ClockCircleOutlined />,
          text: 'Son Kullanma Uyarısı'
        }
      case 'expiry_critical':
        return {
          color: 'red',
          icon: <FireOutlined />,
          text: 'Son Kullanma Kritik'
        }
      case 'expired':
        return {
          color: 'magenta',
          icon: <DeleteOutlined />,
          text: 'Süresi Geçmiş'
        }
      case 'stock_request':
        return {
          color: 'blue',
          icon: <SendOutlined />,
          text: 'Stok Talebi'
        }
      case 'stock_transfer':
        return {
          color: 'cyan',
          icon: <SwapOutlined />,
          text: 'Stok Transferi'
        }
      case 'system':
        return {
          color: 'purple',
          icon: <SettingOutlined />,
          text: 'Sistem'
        }
      default:
        return {
          color: 'default',
          icon: null,
          text: type
        }
    }
  }

  const config = getTypeConfig(type)

  return (
    <Tag 
      color={config.color} 
      icon={config.icon}
      style={{ 
        fontSize: size === 'small' ? '12px' : '14px',
        padding: size === 'small' ? '2px 6px' : '4px 8px',
        borderRadius: '6px',
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {config.text}
    </Tag>
  )
}