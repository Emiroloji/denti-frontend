// src/modules/clinic/components/ClinicList.tsx

import React, { useState } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Input, 
  Select, 
  Button, 
  Space, 
  Modal, 
  Typography,
  Statistic,
  Empty,
  Spin,
  Drawer,
  Table,
  Tag,
  Badge
} from 'antd'
import { 
  PlusOutlined, 
  ReloadOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons'
import { useClinics, useClinicStats, useClinicStocks } from '../hooks/useClinics'
import { Clinic, ClinicFilter } from '../types/clinic.types'
import { Stock } from '../../stock/types/stock.types'
import { ClinicCard } from './ClinicCard'
import { ClinicForm } from './ClinicForm'

const { Option } = Select
const { Search } = Input
const { Title } = Typography
const { confirm } = Modal

// Debug için development kontrolü
const isDev = import.meta.env.MODE === 'development'

export const ClinicList: React.FC = () => {
  const [filters, setFilters] = useState<ClinicFilter>({})
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null)
  const [isFormModalVisible, setIsFormModalVisible] = useState(false)
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)
  const [isStockDrawerVisible, setIsStockDrawerVisible] = useState(false)

  const { 
    clinics, 
    isLoading, 
    refetch, 
    deleteClinic
  } = useClinics(filters)

  const { data: clinicStats } = useClinicStats()
  const { data: clinicStocks, isLoading: stocksLoading } = useClinicStocks(selectedClinic?.id || 0)

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, name: value }))
  }

  const handleFilterChange = (field: keyof ClinicFilter, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleAdd = () => {
    setEditingClinic(null)
    setIsFormModalVisible(true)
  }

  const handleEdit = (clinic: Clinic) => {
    setEditingClinic(clinic)
    setIsFormModalVisible(true)
  }

  const handleDelete = (id: number) => {
    confirm({
      title: 'Klinik Silme',
      content: 'Bu kliniği silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Evet, Sil',
      cancelText: 'İptal',
      okType: 'danger',
      onOk: async () => {
        await deleteClinic(id)
      }
    })
  }

  const handleViewStocks = (clinic: Clinic) => {
    setSelectedClinic(clinic)
    setIsStockDrawerVisible(true)
  }

  const onFormSuccess = () => {
    setIsFormModalVisible(false)
    setEditingClinic(null)
  }

  const statsCards = (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic 
            title="Toplam Klinik" 
            value={clinicStats?.total_clinics || 0}
            prefix={<BankOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic 
            title="Aktif Klinik" 
            value={clinicStats?.active_clinics || 0}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic 
            title="Pasif Klinik" 
            value={clinicStats?.inactive_clinics || 0}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic 
            title="Toplam Stok" 
            value={clinicStats?.total_stocks || 0}
            prefix={<MedicineBoxOutlined />}
          />
        </Card>
      </Col>
    </Row>
  )

  const filterSection = (
    <Card style={{ marginBottom: 24 }}>
      <Row gutter={16} align="middle">
        <Col span={6}>
          <Search
            placeholder="Klinik adı ile ara..."
            onSearch={handleSearch}
            style={{ width: '100%' }}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Input
            placeholder="Klinik kodu..."
            onChange={(e) => handleFilterChange('code', e.target.value)}
            allowClear
          />
        </Col>
        <Col span={6}>
          <Input
            placeholder="Sorumlu doktor..."
            onChange={(e) => handleFilterChange('responsible_person', e.target.value)}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select
            placeholder="Durum"
            style={{ width: '100%' }}
            allowClear
            onChange={(value) => handleFilterChange('is_active', value)}
          >
            <Option value={true}>Aktif</Option>
            <Option value={false}>Pasif</Option>
          </Select>
        </Col>
        <Col span={4}>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
            >
              Yeni Klinik
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => refetch()}
            >
              Yenile
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  )

  // Stok tablosu kolonları
  const stockColumns = [
    {
      title: 'Ürün Adı',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <Tag color="blue">{category}</Tag>
    },
    {
      title: 'Mevcut Stok',
      dataIndex: 'current_stock',
      key: 'current_stock',
      render: (current: number, record: Stock) => {
        const level = current <= record.critical_stock_level ? 'error' : 
                     current <= record.min_stock_level ? 'warning' : 'success'
        return <Badge status={level} text={`${current} ${record.unit}`} />
      }
    },
    {
      title: 'Tedarikçi',
      dataIndex: ['supplier', 'name'],
      key: 'supplier',
      render: (name: string) => name || '-'
    },
    {
      title: 'Alış Fiyatı',
      dataIndex: 'purchase_price',
      key: 'purchase_price',
      render: (price: number, record: Stock) => `${price} ${record.currency || 'TL'}`
    }
  ]

  return (
    <div>
      <Title level={2}>Klinik Yönetimi</Title>
      
      {/* Debug Info - Sadece development'ta göster */}
      {isDev && (
        <Card style={{ marginBottom: 16, backgroundColor: '#fff7e6' }}>
          <div>
            <strong>🔧 Debug Info:</strong>
            <div>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}</div>
            <div>Clinics Count: {clinics?.length || 0}</div>
          </div>
        </Card>
      )}
      
      {statsCards}
      {filterSection}

      <Spin spinning={isLoading}>
        {clinics && clinics.length > 0 ? (
          <Row gutter={[16, 16]}>
            {clinics.map((clinic) => (
              <Col key={clinic.id} xs={24} sm={12} lg={8} xl={6}>
                <ClinicCard
                  clinic={clinic}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewStocks={handleViewStocks}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty 
            description="Henüz klinik kaydı bulunmuyor"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              İlk Klinik Kaydını Oluştur
            </Button>
          </Empty>
        )}
      </Spin>

      {/* Form Modal */}
      <Modal
        title={editingClinic ? 'Klinik Düzenle' : 'Yeni Klinik Ekle'}
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <ClinicForm 
          clinic={editingClinic || undefined}
          onSuccess={onFormSuccess}
          onCancel={() => setIsFormModalVisible(false)}
        />
      </Modal>

      {/* Stok Drawer */}
      <Drawer
        title={
          <Space>
            <MedicineBoxOutlined />
            {`${selectedClinic?.name} - Stok Listesi`}
          </Space>
        }
        open={isStockDrawerVisible}
        onClose={() => setIsStockDrawerVisible(false)}
        width={800}
        destroyOnClose
      >
        <Spin spinning={stocksLoading}>
          {clinicStocks && clinicStocks.length > 0 ? (
            <Table<Stock>
              columns={stockColumns}
              dataSource={clinicStocks}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Toplam ${total} stok kalemi`,
              }}
              size="small"
            />
          ) : (
            <Empty 
              description="Bu klinik için stok kaydı bulunmuyor"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Spin>
      </Drawer>
    </div>
  )
}