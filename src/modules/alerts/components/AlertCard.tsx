// src/modules/alerts/components/AlertCard.tsx

import React from 'react'
import { 
  Card, 
  Space, 
  Typography, 
  Divider, 
  Row, 
  Col, 
  Progress,
  Tooltip,
  Avatar
} from 'antd'
import { 
  UserOutlined,
  ShopOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/tr'
import { Alert } from '../types/alert.types'
import { AlertTypeBadge } from './AlertTypeBadge'
import { AlertSeverityBadge } from './AlertSeverityBadge'
import { AlertActions } from './AlertActions'

dayjs.extend(relativeTime)
dayjs.locale('tr')

const { Text, Title } = Typography

interface AlertCardProps {
  alert: Alert
  currentUser: string
  showActions?: boolean
  onClick?: () => void
}

export const AlertCard: React.FC<AlertCardProps> = ({ 
  alert, 
  currentUser,
  showActions = true,
  onClick 
}) => {
  const getCardBorderColor = (severity: string, isResolved: boolean) => {
    if (isResolved) return '#52c41a'
    
    switch (severity) {
      case 'low': return '#1890ff'
      case 'medium': return '#fa8c16'
      case 'high': return '#f5222d'
      case 'critical': return '#ff4d4f'
      default: return '#d9d9d9'
    }
  }

  const getProgressColor = () => {
    if (alert.current_value === undefined || alert.threshold_value === undefined) return '#1890ff'
    
    const percentage = (alert.current_value / alert.threshold_value) * 100
    if (percentage <= 25) return '#ff4d4f'
    if (percentage <= 50) return '#fa8c16'
    return '#52c41a'
  }

  const getStockProgress = () => {
    if (!alert.stock || alert.current_value === undefined || alert.threshold_value === undefined) {
      return null
    }

    const percentage = Math.min((alert.current_value / alert.threshold_value) * 100, 100)
    
    return (
      <div style={{ marginTop: 12 }}>
        <Row justify="space-between" style={{ marginBottom: 4 }}>
          <Text style={{ fontSize: '12px' }}>Mevcut Stok</Text>
          <Text style={{ fontSize: '12px' }}>
            {alert.current_value} / {alert.threshold_value} {alert.stock.unit}
          </Text>
        </Row>
        <Progress
          percent={percentage}
          size="small"
          strokeColor={getProgressColor()}
          showInfo={false}
        />
      </div>
    )
  }

  const getExpiryInfo = () => {
    if (!alert.days_until_expiry && !alert.expiry_date) return null

    return (
      <div style={{ marginTop: 8 }}>
        {alert.days_until_expiry !== undefined && (
          <Text style={{ 
            fontSize: '12px', 
            color: alert.days_until_expiry <= 0 ? '#ff4d4f' : '#fa8c16' 
          }}>
            {alert.days_until_expiry <= 0 
              ? 'Süresi geçmiş' 
              : `${alert.days_until_expiry} gün kaldı`
            }
          </Text>
        )}
        {alert.expiry_date && (
          <div>
            <Text style={{ fontSize: '12px', color: '#666' }}>
              Son kullanma: {dayjs(alert.expiry_date).format('DD/MM/YYYY')}
            </Text>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card
      style={{ 
        marginBottom: 16,
        borderLeft: `4px solid ${getCardBorderColor(alert.severity, alert.is_resolved)}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        opacity: alert.is_resolved ? 0.7 : 1,
        cursor: onClick ? 'pointer' : 'default'
      }}
      bodyStyle={{ padding: '16px' }}
      onClick={onClick}
      hoverable={!!onClick}
    >
      {/* Header */}
      <Row justify="space-between" align="top" style={{ marginBottom: 12 }}>
        <Col flex="auto">
          <Space direction="vertical" size={4}>
            <Space>
              <AlertSeverityBadge severity={alert.severity} size="small" />
              <AlertTypeBadge type={alert.type} size="small" />
            </Space>
            <Title level={5} style={{ margin: 0, color: alert.is_resolved ? '#999' : '#1890ff' }}>
              {alert.title}
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              #{alert.id} • {dayjs(alert.created_at).fromNow()}
            </Text>
          </Space>
        </Col>
        <Col>
          {alert.is_resolved ? (
            <Tooltip title={`${alert.resolved_by} tarafından çözüldü`}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
            </Tooltip>
          ) : alert.status === 'dismissed' ? (
            <Tooltip title="Yok sayıldı">
              <CloseCircleOutlined style={{ color: '#fa8c16', fontSize: '18px' }} />
            </Tooltip>
          ) : (
            <Tooltip title="Aktif uyarı">
              <ClockCircleOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
            </Tooltip>
          )}
        </Col>
      </Row>

      {/* Message */}
      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Text style={{ 
            fontSize: '14px', 
            lineHeight: '1.5',
            color: alert.is_resolved ? '#999' : '#333'
          }}>
            {alert.message}
          </Text>
        </Col>
      </Row>

      {/* Stock Progress */}
      {getStockProgress()}

      {/* Expiry Info */}
      {getExpiryInfo()}

      <Divider style={{ margin: '12px 0' }} />

      {/* Details */}
      <Space direction="vertical" size={6} style={{ width: '100%' }}>
        {/* Stock Info */}
        {alert.stock && (
          <Row>
            <Col span={6}>
              <Text type="secondary">
                <InboxOutlined /> Stok:
              </Text>
            </Col>
            <Col span={18}>
              <Space>
                <Text>{alert.stock.name}</Text>
                {alert.stock.category && (
                  <Text type="secondary">({alert.stock.category})</Text>
                )}
              </Space>
            </Col>
          </Row>
        )}

        {/* Clinic Info */}
        {alert.clinic && (
          <Row>
            <Col span={6}>
              <Text type="secondary">
                <ShopOutlined /> Klinik:
              </Text>
            </Col>
            <Col span={18}>
              <Text>{alert.clinic.name}</Text>
              {alert.clinic.specialty_code && (
                <Text type="secondary"> ({alert.clinic.specialty_code})</Text>
              )}
            </Col>
          </Row>
        )}

        {/* Resolution Info */}
        {alert.is_resolved && alert.resolved_by && (
          <>
            <Row>
              <Col span={6}>
                <Text type="secondary">Çözen:</Text>
              </Col>
              <Col span={18}>
                <Space>
                  <Avatar size={20} icon={<UserOutlined />} />
                  <Text>{alert.resolved_by}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {dayjs(alert.resolved_at).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </Space>
              </Col>
            </Row>

            {alert.resolution_notes && (
              <Row>
                <Col span={6}>
                  <Text type="secondary">Notlar:</Text>
                </Col>
                <Col span={18}>
                  <Text italic style={{ color: '#666' }}>"{alert.resolution_notes}"</Text>
                </Col>
              </Row>
            )}
          </>
        )}
      </Space>

      {/* Actions */}
      {showActions && (
        <>
          <Divider style={{ margin: '16px 0 8px 0' }} />
          <Row justify="end">
            <Col>
              <AlertActions 
                alert={alert} 
                currentUser={currentUser}
                size="small"
                showDropdown={true}
              />
            </Col>
          </Row>
        </>
      )}
    </Card>
  )
}