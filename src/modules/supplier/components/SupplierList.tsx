// src/modules/supplier/components/SupplierList.tsx

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
  Spin
} from 'antd'
import { 
  PlusOutlined, 
  ReloadOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { useSuppliers, useSupplierStats } from '../hooks/useSuppliers'
import { Supplier, SupplierFilter } from '../types/supplier.types'
import { SupplierCard } from './SupplierCard'
import { SupplierForm } from './SupplierForm'

const { Option } = Select
const { Search } = Input
const { Title } = Typography
const { confirm } = Modal

// Debug için development kontrolü
const isDev = import.meta.env.MODE === 'development'

export const SupplierList: React.FC = () => {
  const [filters, setFilters] = useState<SupplierFilter>({})
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [isFormModalVisible, setIsFormModalVisible] = useState(false)

  const { 
    suppliers, 
    isLoading, 
    refetch, 
    deleteSupplier
  } = useSuppliers(filters)

  const { data: supplierStats } = useSupplierStats()

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, name: value }))
  }

  const handleFilterChange = (field: keyof SupplierFilter, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleAdd = () => {
    setEditingSupplier(null)
    setIsFormModalVisible(true)
  }

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier)
    setIsFormModalVisible(true)
  }

  const handleDelete = (id: number) => {
    confirm({
      title: 'Tedarikçi Silme',
      content: 'Bu tedarikçiyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Evet, Sil',
      cancelText: 'İptal',
      okType: 'danger',
      onOk: async () => {
        await deleteSupplier(id)
      }
    })
  }

  const onFormSuccess = () => {
    setIsFormModalVisible(false)
    setEditingSupplier(null)
  }

  const statsCards = (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic 
            title="Toplam Tedarikçi" 
            value={supplierStats?.total_suppliers || 0}
            prefix={<TeamOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic 
            title="Aktif Tedarikçi" 
            value={supplierStats?.active_suppliers || 0}
            valueStyle={{ color: '#52c41a' }}
            prefix={<CheckCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic 
            title="Pasif Tedarikçi" 
            value={supplierStats?.inactive_suppliers || 0}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<CloseCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic 
            title="Toplam Sipariş" 
            value={supplierStats?.total_orders || 0}
          />
        </Card>
      </Col>
    </Row>
  )

  const filterSection = (
    <Card style={{ marginBottom: 24 }}>
      <Row gutter={16} align="middle">
        <Col span={8}>
          <Search
            placeholder="Tedarikçi adı ile ara..."
            onSearch={handleSearch}
            style={{ width: '100%' }}
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
        <Col span={8}>
          <Input
            placeholder="İletişim kişisi ile ara..."
            onChange={(e) => handleFilterChange('contact_person', e.target.value)}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
            >
              Yeni Tedarikçi
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

  return (
    <div>
      <Title level={2}>Tedarikçi Yönetimi</Title>
      
      {/* Debug Info - Sadece development'ta göster */}
      {isDev && (
        <Card style={{ marginBottom: 16, backgroundColor: '#fff7e6' }}>
          <div>
            <strong>🔧 Debug Info:</strong>
            <div>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}</div>
            <div>Suppliers Count: {suppliers?.length || 0}</div>
          </div>
        </Card>
      )}
      
      {statsCards}
      {filterSection}

      <Spin spinning={isLoading}>
        {suppliers && suppliers.length > 0 ? (
          <Row gutter={[16, 16]}>
            {suppliers.map((supplier) => (
              <Col key={supplier.id} xs={24} sm={12} lg={8} xl={6}>
                <SupplierCard
                  supplier={supplier}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty 
            description="Henüz tedarikçi kaydı bulunmuyor"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              İlk Tedarikçi Kaydını Oluştur
            </Button>
          </Empty>
        )}
      </Spin>

      {/* Form Modal */}
      <Modal
        title={editingSupplier ? 'Tedarikçi Düzenle' : 'Yeni Tedarikçi Ekle'}
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <SupplierForm 
          supplier={editingSupplier || undefined}
          onSuccess={onFormSuccess}
          onCancel={() => setIsFormModalVisible(false)}
        />
      </Modal>
    </div>
  )
}