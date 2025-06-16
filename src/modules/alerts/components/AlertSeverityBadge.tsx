// src/modules/alerts/components/AlertSeverityBadge.tsx

import React from 'react'
import { Tag } from 'antd'
import { 
  InfoCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  FireOutlined
} from '@ant-design/icons'
import { AlertSeverity } from '../types/alert.types'

interface AlertSeverityBadgeProps {
  severity: AlertSeverity
  size?: 'small' | 'default'
  showIcon?: boolean
}

export const AlertSeverityBadge: React.FC<AlertSeverityBadgeProps> = ({ 
  severity,
  size = 'default',
  showIcon = true
}) => {
  const getSeverityConfig = (severity: AlertSeverity) => {
    switch (severity) {
      case 'low':
        return {
          color: 'blue',
          backgroundColor: '#e6f7ff',
          borderColor: '#91d5ff',
          textColor: '#1890ff',
          icon: <InfoCircleOutlined />,
          text: 'Düşük',
          pulse: false
        }
      case 'medium':
        return {
          color: 'orange',
          backgroundColor: '#fff7e6',
          borderColor: '#ffd591',
          textColor: '#fa8c16',
          icon: <WarningOutlined />,
          text: 'Orta',
          pulse: false
        }
      case 'high':
        return {
          color: 'red',
          backgroundColor: '#fff2f0',
          borderColor: '#ffb3b3',
          textColor: '#f5222d',
          icon: <ExclamationCircleOutlined />,
          text: 'Yüksek',
          pulse: true
        }
      case 'critical':
        return {
          color: 'volcano',
          backgroundColor: '#fff1f0',
          borderColor: '#ff9c96',
          textColor: '#ff4d4f',
          icon: <FireOutlined />,
          text: 'Kritik',
          pulse: true
        }
      default:
        return {
          color: 'default',
          backgroundColor: '#fafafa',
          borderColor: '#d9d9d9',
          textColor: '#595959',
          icon: null,
          text: severity,
          pulse: false
        }
    }
  }

  const config = getSeverityConfig(severity)

  const pulseStyle = config.pulse ? {
    animation: 'pulse 2s infinite',
    '@keyframes pulse': {
      '0%': { opacity: 1 },
      '50%': { opacity: 0.7 },
      '100%': { opacity: 1 }
    }
  } : {}

  return (
    <>
      {config.pulse && (
        <style>
          {`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.7; }
              100% { opacity: 1; }
            }
          `}
        </style>
      )}
      <Tag 
        style={{ 
          fontSize: size === 'small' ? '12px' : '14px',
          padding: size === 'small' ? '2px 6px' : '4px 8px',
          borderRadius: '6px',
          fontWeight: 600,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          color: config.textColor,
          border: `1px solid ${config.borderColor}`,
          ...pulseStyle
        }}
      >
        {showIcon && config.icon}
        {config.text}
      </Tag>
    </>
  )
}