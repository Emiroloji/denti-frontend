// src/modules/stockRequest/components/StockRequestCard.tsx

import React from 'react'
import { 
  Card, 
  Space, 
  Typography, 
  Divider, 
  Row, 
  Col, 
  Tag,
  Tooltip,
  Avatar
} from 'antd'
import { 
  SwapOutlined,
  CalendarOutlined,
  UserOutlined,
  ShopOutlined,
  NumberOutlined,
  CommentOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/tr'
import { StockRequest } from '../types/stockRequest.types'
import { StockRequestStatusBadge } from './StockRequestStatusBadge'
import { StockRequestActions } from './StockRequestActions'

dayjs.extend(relativeTime)
dayjs.locale('tr')

const { Text, Title } = Typography

interface StockRequestCardProps {
  request: StockRequest
  currentUser: string
  showActions?: boolean
}

export const StockRequestCard: React.FC<StockRequestCardProps> = ({ 
  request, 
  currentUser,
  showActions = true 
}) => {
  const getCardBorderColor = (status: string) => {
    switch (status) {
      case 'pending': return '#faad14'
      case 'approved': return '#1890ff'
      case 'rejected': return '#ff4d4f'
      case 'completed': return '#52c41a'
      default: return '#d9d9d9'
    }
  }

  const getQuantityText = () => {
    if (request.status === 'approved' && request.approved_quantity) {
      return `${request.approved_quantity} / ${request.requested_quantity}`
    }
    return request.requested_quantity.toString()
  }

  const getQuantityColor = () => {
    if (request.status === 'approved' && request.approved_quantity !== request.requested_quantity) {
      return '#faad14' // Kısmi onay
    }
    if (request.status === 'rejected') {
      return '#ff4d4f'
    }
    return '#52c41a'
  }

  return (
    <Card
      style={{ 
        marginBottom: 16,
        borderLeft: `4px solid ${getCardBorderColor(request.status)}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      bodyStyle={{ padding: '16px' }}
    >
      {/* Header */}
      <Row justify="space-between" align="top" style={{ marginBottom: 12 }}>
        <Col flex="auto">
          <Space direction="vertical" size={4}>
            <Title level={5} style={{ margin: 0, color: '#1890ff' }}>
              {request.stock?.name}
            </Title>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              #{request.id} • {dayjs(request.created_at).fromNow()}
            </Text>
          </Space>
        </Col>
        <Col>
          <StockRequestStatusBadge status={request.status} />
        </Col>
      </Row>

      {/* Transfer Info */}
      <Row style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Space align="center" style={{ width: '100%', justifyContent: 'center' }}>
            <Tooltip title={request.requested_from_clinic?.name}>
              <Tag color="blue" icon={<ShopOutlined />}>
                {request.requested_from_clinic?.specialty_code || 'Bilinmiyor'}
              </Tag>
            </Tooltip>
            <SwapOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
            <Tooltip title={request.requester_clinic?.name}>
              <Tag color="green" icon={<ShopOutlined />}>
                {request.requester_clinic?.specialty_code || 'Bilinmiyor'}
              </Tag>
            </Tooltip>
          </Space>
        </Col>
      </Row>

      {/* Quantity */}
      <Row style={{ marginBottom: 16 }}>
        <Col span={24} style={{ textAlign: 'center' }}>
          <Space align="center">
            <NumberOutlined style={{ color: '#666' }} />
            <Text strong style={{ color: getQuantityColor(), fontSize: '16px' }}>
              {getQuantityText()} {request.stock?.unit}
            </Text>
          </Space>
          {request.status === 'approved' && request.approved_quantity !== request.requested_quantity && (
            <div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                (Kısmi onay)
              </Text>
            </div>
          )}
        </Col>
      </Row>

      <Divider style={{ margin: '12px 0' }} />

      {/* Details */}
      <Space direction="vertical" size={8} style={{ width: '100%' }}>
        {/* Requested By */}
        <Row>
          <Col span={6}>
            <Text type="secondary">
              <UserOutlined /> Talep Eden:
            </Text>
          </Col>
          <Col span={18}>
            <Text>{request.requested_by}</Text>
          </Col>
        </Row>

        {/* Request Reason */}
        <Row>
          <Col span={6}>
            <Text type="secondary">
              <CommentOutlined /> Sebep:
            </Text>
          </Col>
          <Col span={18}>
            <Text>{request.request_reason}</Text>
          </Col>
        </Row>

        {/* Stock Info */}
        <Row>
          <Col span={6}>
            <Text type="secondary">Kategori:</Text>
          </Col>
          <Col span={18}>
            <Tag color="purple">{request.stock?.category}</Tag>
            {request.stock?.brand && (
              <Tag color="cyan">{request.stock?.brand}</Tag>
            )}
          </Col>
        </Row>

        {/* Approval Info */}
        {request.status === 'approved' && request.approved_by && (
          <>
            <Row>
              <Col span={6}>
                <Text type="secondary">Onaylayan:</Text>
              </Col>
              <Col span={18}>
                <Space>
                  <Avatar size={20} icon={<UserOutlined />} />
                  <Text>{request.approved_by}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {dayjs(request.approved_at).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </Space>
              </Col>
            </Row>

            {request.notes && (
              <Row>
                <Col span={6}>
                  <Text type="secondary">Notlar:</Text>
                </Col>
                <Col span={18}>
                  <Text italic style={{ color: '#666' }}>"{request.notes}"</Text>
                </Col>
              </Row>
            )}
          </>
        )}

        {/* Rejection Info */}
        {request.status === 'rejected' && request.rejected_by && (
          <>
            <Row>
              <Col span={6}>
                <Text type="secondary">
                  <CloseCircleOutlined style={{ color: '#ff4d4f' }} /> Reddeden:
                </Text>
              </Col>
              <Col span={18}>
                <Space>
                  <Avatar size={20} icon={<UserOutlined />} style={{ backgroundColor: '#ff4d4f' }} />
                  <Text>{request.rejected_by}</Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {dayjs(request.rejected_at).format('DD/MM/YYYY HH:mm')}
                  </Text>
                </Space>
              </Col>
            </Row>

            {request.rejection_reason && (
              <Row>
                <Col span={6}>
                  <Text type="secondary">Red Sebebi:</Text>
                </Col>
                <Col span={18}>
                  <Text style={{ color: '#ff4d4f' }}>"{request.rejection_reason}"</Text>
                </Col>
              </Row>
            )}
          </>
        )}

        {/* Completion Info */}
        {request.status === 'completed' && request.performed_by && (
          <Row>
            <Col span={6}>
              <Text type="secondary">
                <CalendarOutlined /> Tamamlayan:
              </Text>
            </Col>
            <Col span={18}>
              <Space>
                <Avatar size={20} icon={<UserOutlined />} style={{ backgroundColor: '#52c41a' }} />
                <Text>{request.performed_by}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {dayjs(request.completed_at).format('DD/MM/YYYY HH:mm')}
                </Text>
              </Space>
            </Col>
          </Row>
        )}
      </Space>

      {/* Actions */}
      {showActions && (
        <>
          <Divider style={{ margin: '16px 0 8px 0' }} />
          <Row justify="end">
            <Col>
              <StockRequestActions 
                request={request} 
                currentUser={currentUser}
                size="small"
              />
            </Col>
          </Row>
        </>
      )}
    </Card>
  )
}