// src/modules/alerts/components/AlertList.tsx

import React, { useState, useMemo } from 'react'
import { 
  Card,
  Row, 
  Col, 
  Input, 
  Select, 
  Button,
  Space,
  Empty,
  Spin,
  Typography,
  DatePicker,
  Checkbox,
  Modal,
  Form,
  Badge,
  Affix
} from 'antd'
import { 
  FilterOutlined,
  ReloadOutlined,
  BellOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
  SettingOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useAlerts, useAlertStats } from '../hooks/useAlerts'
import { useClinics } from '@/modules/clinics/hooks/useClinics'
import { AlertCard } from './AlertCard'
import { AlertDashboard } from './AlertDashboard'
import { AlertSeverityBadge } from './AlertSeverityBadge'
import { AlertFilters, AlertType, AlertSeverity } from '../types/alert.types'

const { Search } = Input
const { Option } = Select
const { RangePicker } = DatePicker
const { Title } = Typography
const { TextArea } = Input

interface AlertListProps {
  defaultClinicId?: number
  currentUser: string
  showDashboard?: boolean
}

export const AlertList: React.FC<AlertListProps> = ({ 
  defaultClinicId,
  currentUser,
  showDashboard = true 
}) => {
  const [filters, setFilters] = useState<AlertFilters>({
    clinic_id: defaultClinicId,
    is_resolved: false
  })
  const [selectedAlerts, setSelectedAlerts] = useState<number[]>([])
  const [bulkActionModalVisible, setBulkActionModalVisible] = useState(false)
  const [bulkActionType, setBulkActionType] = useState<'resolve' | 'dismiss' | 'delete'>('resolve')
  const [bulkModalKey, setBulkModalKey] = useState(0) // Modal'ı yeniden mount etmek için

  const { 
    alerts, 
    isLoading, 
    refetch,
    bulkResolveAlerts,
    bulkDismissAlerts,
    isBulkProcessing
  } = useAlerts(filters)
  
  const { data: stats } = useAlertStats(defaultClinicId)
  const { clinics } = useClinics()

  // Null check ile güvenli filtreleme
  const activeClinics = useMemo(() => {
    if (!clinics || clinics.length === 0) return []
    return clinics.filter((clinic) => clinic.is_active)
  }, [clinics])

  const handleFilterChange = (key: keyof AlertFilters, value: string | number | boolean | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setSelectedAlerts([])
  }

  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      setFilters(prev => ({
        ...prev,
        date_from: dates[0] ? dates[0].format('YYYY-MM-DD') : undefined,
        date_to: dates[1] ? dates[1].format('YYYY-MM-DD') : undefined
      }))
    } else {
      setFilters(prev => ({
        ...prev,
        date_from: undefined,
        date_to: undefined
      }))
    }
  }

  const clearFilters = () => {
    setFilters({
      clinic_id: defaultClinicId,
      is_resolved: false
    })
    setSelectedAlerts([])
  }

  const toggleSelectAlert = (alertId: number) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId) 
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    )
  }

  const selectAllAlerts = () => {
    if (!alerts || alerts.length === 0) return
    
    if (selectedAlerts.length === alerts.length) {
      setSelectedAlerts([])
    } else {
      setSelectedAlerts(alerts.map((alert) => alert.id))
    }
  }

  const handleBulkAction = (action: 'resolve' | 'dismiss' | 'delete') => {
    if (selectedAlerts.length === 0) return
    
    setBulkActionType(action)
    setBulkActionModalVisible(true)
  }

  const executeBulkAction = async (values?: { resolution_notes?: string }) => {
    try {
      if (bulkActionType === 'resolve') {
        await bulkResolveAlerts({
          ids: selectedAlerts,
          data: {
            resolved_by: currentUser,
            resolution_notes: values?.resolution_notes
          }
        })
      } else if (bulkActionType === 'dismiss') {
        await bulkDismissAlerts(selectedAlerts)
      }
      
      setBulkActionModalVisible(false)
      setSelectedAlerts([])
      // Modal'ı yeniden mount et (form otomatik temizlenir)
      setBulkModalKey(prev => prev + 1)
    } catch (error) {
      console.error('Bulk action error:', error)
    }
  }

  const getFilteredAlertCount = () => {
    return alerts?.length || 0
  }

  const getPendingCount = () => {
    return stats?.active || 0
  }

  const alertTypeOptions: { value: AlertType; label: string }[] = [
    { value: 'low_stock', label: 'Düşük Stok' },
    { value: 'critical_stock', label: 'Kritik Stok' },
    { value: 'out_of_stock', label: 'Stok Bitti' },
    { value: 'expiry_warning', label: 'Son Kullanma Uyarısı' },
    { value: 'expiry_critical', label: 'Son Kullanma Kritik' },
    { value: 'expired', label: 'Süresi Geçmiş' },
    { value: 'stock_request', label: 'Stok Talebi' },
    { value: 'stock_transfer', label: 'Stok Transferi' },
    { value: 'system', label: 'Sistem' }
  ]

  const severityOptions: { value: AlertSeverity; label: string }[] = [
    { value: 'low', label: 'Düşük' },
    { value: 'medium', label: 'Orta' },
    { value: 'high', label: 'Yüksek' },
    { value: 'critical', label: 'Kritik' }
  ]

  return (
    <div>
      {/* Dashboard */}
      {showDashboard && (
        <div style={{ marginBottom: 24 }}>
          <AlertDashboard clinicId={defaultClinicId} />
        </div>
      )}

      {/* Filtreler */}
      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Search
              placeholder="Başlık veya mesaj ara..."
              allowClear
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onSearch={(value) => handleFilterChange('search', value)}
            />
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Klinik"
              allowClear
              style={{ width: '100%' }}
              value={filters.clinic_id}
              onChange={(value) => handleFilterChange('clinic_id', value)}
            >
              {activeClinics.map((clinic) => (
                <Option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Tip"
              allowClear
              style={{ width: '100%' }}
              value={filters.type}
              onChange={(value) => handleFilterChange('type', value as AlertType)}
            >
              {alertTypeOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={12} sm={6} md={3}>
            <Select
              placeholder="Önem"
              allowClear
              style={{ width: '100%' }}
              value={filters.severity}
              onChange={(value) => handleFilterChange('severity', value as AlertSeverity)}
            >
              {severityOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  <AlertSeverityBadge severity={option.value} size="small" />
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={12} sm={8} md={4}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Başlangıç', 'Bitiş']}
              onChange={handleDateRangeChange}
            />
          </Col>

          <Col xs={24} sm={8} md={3}>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
                loading={isLoading}
                title="Yenile"
              />
              <Button
                icon={<FilterOutlined />}
                onClick={clearFilters}
                title="Filtreleri Temizle"
              />
            </Space>
          </Col>
        </Row>

        <Row style={{ marginTop: 12 }}>
          <Col span={24}>
            <Space>
              <Checkbox
                checked={filters.is_resolved === false}
                onChange={(e) => handleFilterChange('is_resolved', e.target.checked ? false : undefined)}
              >
                Sadece aktif uyarılar
              </Checkbox>
              <Checkbox
                checked={filters.is_resolved === true}
                onChange={(e) => handleFilterChange('is_resolved', e.target.checked ? true : undefined)}
              >
                Sadece çözülmüş uyarılar
              </Checkbox>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Başlık ve İstatistikler */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={4} style={{ margin: 0 }}>
            <BellOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Uyarılar
            {getFilteredAlertCount() > 0 && (
              <Badge 
                count={getFilteredAlertCount()} 
                style={{ marginLeft: 8 }}
                showZero={false}
              />
            )}
          </Title>
          <div style={{ marginTop: 4 }}>
            <Space size="large">
              <span style={{ color: '#666', fontSize: '14px' }}>
                Toplam: {getFilteredAlertCount()} uyarı
              </span>
              <span style={{ color: '#fa8c16', fontSize: '14px' }}>
                Bekleyen: {getPendingCount()} uyarı
              </span>
            </Space>
          </div>
        </Col>
        <Col>
          <Space>
            <Button icon={<SettingOutlined />} title="Uyarı Ayarları">
              Ayarlar
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Toplu İşlemler */}
      {selectedAlerts.length > 0 && (
        <Affix offsetTop={10}>
          <Card size="small" style={{ marginBottom: 16, backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}>
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <span>{selectedAlerts.length} uyarı seçildi</span>
                  <Button size="small" type="link" onClick={() => setSelectedAlerts([])}>
                    Seçimi Temizle
                  </Button>
                </Space>
              </Col>
              <Col>
                <Space>
                  <Button
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => handleBulkAction('resolve')}
                    loading={isBulkProcessing}
                  >
                    Toplu Çözümle
                  </Button>
                  <Button
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => handleBulkAction('dismiss')}
                    loading={isBulkProcessing}
                  >
                    Toplu Yok Say
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleBulkAction('delete')}
                    loading={isBulkProcessing}
                  >
                    Toplu Sil
                  </Button>
                </Space>
              </Col>
            </Row>
          </Card>
        </Affix>
      )}

      {/* Uyarı Listesi */}
      <div>
        {isLoading ? (
          <Card>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16 }}>Uyarılar yükleniyor...</div>
            </div>
          </Card>
        ) : !alerts || alerts.length === 0 ? (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                Object.keys(filters).length > 1 || filters.search ? 
                "Filtrelere uygun uyarı bulunamadı" : 
                "Henüz uyarı bulunmuyor"
              }
              style={{ padding: '40px' }}
            >
              {Object.keys(filters).length > 1 && (
                <Button onClick={clearFilters}>
                  Filtreleri Temizle
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <>
            {/* Tümünü Seç */}
            <div style={{ marginBottom: 12 }}>
              <Checkbox
                indeterminate={selectedAlerts.length > 0 && selectedAlerts.length < alerts.length}
                checked={alerts.length > 0 && selectedAlerts.length === alerts.length}
                onChange={selectAllAlerts}
              >
                Tümünü Seç ({alerts.length} uyarı)
              </Checkbox>
            </div>

            <Row gutter={[16, 16]}>
              {alerts.map((alert) => (
                <Col xs={24} lg={12} xl={8} key={alert.id}>
                  <div style={{ position: 'relative' }}>
                    <Checkbox
                      style={{ 
                        position: 'absolute', 
                        top: 8, 
                        left: 8, 
                        zIndex: 10,
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        padding: '2px'
                      }}
                      checked={selectedAlerts.includes(alert.id)}
                      onChange={() => toggleSelectAlert(alert.id)}
                    />
                    <AlertCard
                      alert={alert}
                      currentUser={currentUser}
                      showActions={true}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </>
        )}
      </div>

      {/* Toplu İşlem Modal */}
      <Modal
        key={`bulk-modal-${bulkModalKey}`}
        title={`Toplu ${
          bulkActionType === 'resolve' ? 'Çözümleme' : 
          bulkActionType === 'dismiss' ? 'Yok Sayma' : 'Silme'
        }`}
        open={bulkActionModalVisible}
        onCancel={() => setBulkActionModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          layout="vertical"
          onFinish={executeBulkAction}
        >
          <div style={{ marginBottom: 16 }}>
            <ExclamationCircleOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
            <span>{selectedAlerts.length} uyarı {
              bulkActionType === 'resolve' ? 'çözümlenecek' : 
              bulkActionType === 'dismiss' ? 'yok sayılacak' : 'silinecek'
            }. Devam edilsin mi?</span>
          </div>
          
          {bulkActionType === 'resolve' && (
            <Form.Item
              label="Çözüm Notları (Opsiyonel)"
              name="resolution_notes"
            >
              <TextArea
                rows={4}
                placeholder="Toplu çözümleme hakkında notlar..."
              />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setBulkActionModalVisible(false)}>
                İptal
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isBulkProcessing}
                danger={bulkActionType === 'delete'}
              >
                {bulkActionType === 'resolve' ? 'Çözümle' : 
                 bulkActionType === 'dismiss' ? 'Yok Say' : 'Sil'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}