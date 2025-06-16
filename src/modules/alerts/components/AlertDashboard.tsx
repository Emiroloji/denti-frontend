// src/modules/alerts/components/AlertDashboard.tsx

import React from 'react'
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Progress,
  Space,
  Typography,
  Alert as AntAlert,
  Spin
} from 'antd'
import { 
  BellOutlined,
  FireOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { useAlertStats, useActiveAlerts } from '../hooks/useAlerts'
import { AlertSeverityBadge } from './AlertSeverityBadge'
import { AlertTypeBadge } from './AlertTypeBadge'

const { Text } = Typography

interface AlertDashboardProps {
  clinicId?: number
}

export const AlertDashboard: React.FC<AlertDashboardProps> = ({ clinicId }) => {
  const { data: stats, isLoading: statsLoading } = useAlertStats(clinicId)
  const { data: activeAlerts, isLoading: alertsLoading } = useActiveAlerts(clinicId)

  if (statsLoading || alertsLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Uyarı verileri yükleniyor...</div>
        </div>
      </Card>
    )
  }

  const criticalAlerts = activeAlerts?.filter(alert => alert.severity === 'critical') || []
  const highAlerts = activeAlerts?.filter(alert => alert.severity === 'high') || []

  return (
    <div>
      {/* Kritik Uyarı Banner */}
      {criticalAlerts.length > 0 && (
        <AntAlert
          message={`${criticalAlerts.length} kritik uyarı var!`}
          description="Hemen müdahale edilmesi gereken kritik uyarılar bulunmaktadır."
          type="error"
          icon={<FireOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
          action={
            <Space>
              <Text strong style={{ color: '#ff4d4f' }}>
                Kritik: {criticalAlerts.length}
              </Text>
            </Space>
          }
        />
      )}

      {/* Yüksek Öncelik Uyarı Banner */}
      {highAlerts.length > 0 && criticalAlerts.length === 0 && (
        <AntAlert
          message={`${highAlerts.length} yüksek öncelikli uyarı var`}
          description="Dikkat edilmesi gereken uyarılar bulunmaktadır."
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* İstatistik Kartları */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Toplam Uyarı"
              value={stats?.total || 0}
              prefix={<BellOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Aktif"
              value={stats?.active || 0}
              prefix={<ExclamationCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Çözümlenen"
              value={stats?.resolved || 0}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Yok Sayılan"
              value={stats?.dismissed || 0}
              prefix={<CloseCircleOutlined style={{ color: '#999' }} />}
              valueStyle={{ color: '#999' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Önem Seviyesi Dağılımı */}
        <Col xs={24} lg={12}>
          <Card title="Önem Seviyesi Dağılımı" size="small">
            <Space direction="vertical" style={{ width: '100%' }} size={12}>
              <div>
                <Row justify="space-between" align="middle">
                  <Col>
                    <AlertSeverityBadge severity="critical" size="small" />
                  </Col>
                  <Col flex="auto" style={{ paddingLeft: 12 }}>
                    <Progress
                      percent={stats?.total ? (stats.by_severity.critical / stats.total) * 100 : 0}
                      strokeColor="#ff4d4f"
                      showInfo={false}
                    />
                  </Col>
                  <Col style={{ paddingLeft: 8 }}>
                    <Text strong>{stats?.by_severity.critical || 0}</Text>
                  </Col>
                </Row>
              </div>

              <div>
                <Row justify="space-between" align="middle">
                  <Col>
                    <AlertSeverityBadge severity="high" size="small" />
                  </Col>
                  <Col flex="auto" style={{ paddingLeft: 12 }}>
                    <Progress
                      percent={stats?.total ? (stats.by_severity.high / stats.total) * 100 : 0}
                      strokeColor="#fa8c16"
                      showInfo={false}
                    />
                  </Col>
                  <Col style={{ paddingLeft: 8 }}>
                    <Text strong>{stats?.by_severity.high || 0}</Text>
                  </Col>
                </Row>
              </div>

              <div>
                <Row justify="space-between" align="middle">
                  <Col>
                    <AlertSeverityBadge severity="medium" size="small" />
                  </Col>
                  <Col flex="auto" style={{ paddingLeft: 12 }}>
                    <Progress
                      percent={stats?.total ? (stats.by_severity.medium / stats.total) * 100 : 0}
                      strokeColor="#faad14"
                      showInfo={false}
                    />
                  </Col>
                  <Col style={{ paddingLeft: 8 }}>
                    <Text strong>{stats?.by_severity.medium || 0}</Text>
                  </Col>
                </Row>
              </div>

              <div>
                <Row justify="space-between" align="middle">
                  <Col>
                    <AlertSeverityBadge severity="low" size="small" />
                  </Col>
                  <Col flex="auto" style={{ paddingLeft: 12 }}>
                    <Progress
                      percent={stats?.total ? (stats.by_severity.low / stats.total) * 100 : 0}
                      strokeColor="#1890ff"
                      showInfo={false}
                    />
                  </Col>
                  <Col style={{ paddingLeft: 8 }}>
                    <Text strong>{stats?.by_severity.low || 0}</Text>
                  </Col>
                </Row>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Uyarı Tiplerinin Dağılımı */}
        <Col xs={24} lg={12}>
          <Card title="Uyarı Tipleri" size="small">
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {stats && Object.entries(stats.by_type).map(([type, count]) => {
                if (count === 0) return null
                
                return (
                  <Row key={type} justify="space-between" align="middle">
                    <Col>
                      <AlertTypeBadge type={type as AlertType} size="small" />
                    </Col>
                    <Col>
                      <Text strong>{count}</Text>
                    </Col>
                  </Row>
                )
              })}
              
              {stats && Object.values(stats.by_type).every(count => count === 0) && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                  <InfoCircleOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                  <div>Henüz uyarı bulunmuyor</div>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}