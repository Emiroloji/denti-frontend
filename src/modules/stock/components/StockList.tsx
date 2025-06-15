// src/modules/stock/components/StockList.tsx

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
  Form,
  InputNumber,
  Typography,
  Statistic,
  Alert,
  Empty,
  Spin
} from 'antd'
import { 
  PlusOutlined, 
  WarningOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useStocks, useLowStockItems, useCriticalStockItems, useExpiringItems, useStockStats } from '../hooks/useStocks'
import { Stock, StockFilter, StockAdjustmentRequest, StockUsageRequest } from '../types/stock.types'
import { StockCard } from './StockCard'
import { StockForm } from './StockForm'

// Debug için geçici import
const isDev = import.meta.env.MODE === 'development'

const { Option } = Select
const { Search } = Input
const { Title } = Typography
const { confirm } = Modal

export const StockList: React.FC = () => {
  const [filters, setFilters] = useState<StockFilter>({})
  const [editingStock, setEditingStock] = useState<Stock | null>(null)
  const [isFormModalVisible, setIsFormModalVisible] = useState(false)
  const [isAdjustModalVisible, setIsAdjustModalVisible] = useState(false)
  const [isUseModalVisible, setIsUseModalVisible] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [adjustForm] = Form.useForm()
  const [useForm] = Form.useForm()

  const { 
    stocks, 
    isLoading, 
    refetch, 
    deleteStock, 
    adjustStock, 
    useStock,
    isAdjusting,
    isUsing
  } = useStocks(filters)

  const { data: stockStats } = useStockStats()
  const { data: lowStockItems } = useLowStockItems()
  const { data: criticalStockItems } = useCriticalStockItems()
  const { data: expiringItems } = useExpiringItems(30)

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, name: value }))
  }

  const handleFilterChange = (field: keyof StockFilter, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleAdd = () => {
    setEditingStock(null)
    setIsFormModalVisible(true)
  }

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock)
    setIsFormModalVisible(true)
  }

  const handleDelete = (id: number) => {
    confirm({
      title: 'Stok Silme',
      content: 'Bu stok kaydını silmek istediğinizden emin misiniz?',
      okText: 'Evet, Sil',
      cancelText: 'İptal',
      okType: 'danger',
      onOk: async () => {
        await deleteStock(id)
      }
    })
  }

  const handleAdjust = (stock: Stock) => {
    setSelectedStock(stock)
    setIsAdjustModalVisible(true)
    adjustForm.resetFields()
  }

  const handleUse = (stock: Stock) => {
    setSelectedStock(stock)
    setIsUseModalVisible(true)
    useForm.resetFields()
  }

  const onAdjustSubmit = async (values: StockAdjustmentRequest) => {
    if (!selectedStock) return
    
    try {
      await adjustStock({ id: selectedStock.id, data: values })
      setIsAdjustModalVisible(false)
      setSelectedStock(null)
      adjustForm.resetFields()
    } catch (error) {
      console.error('Stok ayarlama hatası:', error)
    }
  }

  const onUseSubmit = async (values: StockUsageRequest) => {
    if (!selectedStock) return
    
    try {
      await useStock({ id: selectedStock.id, data: values })
      setIsUseModalVisible(false)
      setSelectedStock(null)
      useForm.resetFields()
    } catch (error) {
      console.error('Stok kullanım hatası:', error)
    }
  }

  const onFormSuccess = () => {
    setIsFormModalVisible(false)
    setEditingStock(null)
  }

  const categoryOptions = [
    { label: 'Diş Hekimliği Malzemeleri', value: 'dental_materials' },
    { label: 'Anestezi Malzemeleri', value: 'anesthesia' },
    { label: 'Cerrahi Aletler', value: 'surgical_instruments' },
    { label: 'Röntgen Malzemeleri', value: 'xray_materials' },
    { label: 'Temizlik Malzemeleri', value: 'cleaning_supplies' },
    { label: 'Ortodonti Malzemeleri', value: 'orthodontics' },
    { label: 'Endodonti Malzemeleri', value: 'endodontics' },
    { label: 'Protez Malzemeleri', value: 'prosthetics' },
    { label: 'İmplant Malzemeleri', value: 'implants' },
    { label: 'Diğer', value: 'other' }
  ]

  const levelOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Düşük Seviye', value: 'low' },
    { label: 'Kritik Seviye', value: 'critical' },
    { label: 'Süresi Geçmiş', value: 'expired' }
  ]

  const statsCards = (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic 
            title="Toplam Stok" 
            value={stockStats?.total_items || 0}
            prefix={<SettingOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic 
            title="Düşük Seviye" 
            value={stockStats?.low_stock_items || 0}
            valueStyle={{ color: '#faad14' }}
            prefix={<WarningOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic 
            title="Kritik Seviye" 
            value={stockStats?.critical_stock_items || 0}
            valueStyle={{ color: '#ff4d4f' }}
            prefix={<ExclamationCircleOutlined />}
          />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic 
            title="Toplam Değer" 
            value={stockStats?.total_value || 0}
            precision={2}
            suffix="TL"
          />
        </Card>
      </Col>
    </Row>
  )

  const alertsSection = (
    <>
      {(criticalStockItems && criticalStockItems.length > 0) && (
        <Alert
          message={`${criticalStockItems.length} ürün kritik seviyede!`}
          description={`Bu ürünler: ${criticalStockItems.slice(0, 3).map(item => item.name).join(', ')}${criticalStockItems.length > 3 ? '...' : ''}`}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {(lowStockItems && lowStockItems.length > 0) && (
        <Alert
          message={`${lowStockItems.length} ürün düşük seviyede`}
          description={`Bu ürünler: ${lowStockItems.slice(0, 3).map(item => item.name).join(', ')}${lowStockItems.length > 3 ? '...' : ''}`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {(expiringItems && expiringItems.length > 0) && (
        <Alert
          message={`${expiringItems.length} ürünün süresi 30 gün içinde doluyor`}
          description={`Bu ürünler: ${expiringItems.slice(0, 3).map(item => item.name).join(', ')}${expiringItems.length > 3 ? '...' : ''}`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
    </>
  )

  const filterSection = (
    <Card style={{ marginBottom: 24 }}>
      <Row gutter={16} align="middle">
        <Col span={8}>
          <Search
            placeholder="Stok adı ile ara..."
            onSearch={handleSearch}
            style={{ width: '100%' }}
            allowClear
          />
        </Col>
        <Col span={4}>
          <Select
            placeholder="Kategori"
            style={{ width: '100%' }}
            allowClear
            onChange={(value) => handleFilterChange('category', value)}
          >
            {categoryOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Select
            placeholder="Seviye"
            style={{ width: '100%' }}
            allowClear
            onChange={(value) => handleFilterChange('level', value)}
          >
            {levelOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={4}>
          <Select
            placeholder="Durum"
            style={{ width: '100%' }}
            allowClear
            onChange={(value) => handleFilterChange('status', value)}
          >
            <Option value="active">Aktif</Option>
            <Option value="inactive">Pasif</Option>
            <Option value="expired">Süresi Geçmiş</Option>
          </Select>
        </Col>
        <Col span={4}>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
            >
              Yeni Stok
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
      <Title level={2}>Stok Yönetimi</Title>
      
      
      
      {statsCards}
      {alertsSection}
      {filterSection}

      <Spin spinning={isLoading}>
        {stocks && stocks.length > 0 ? (
          <Row gutter={[16, 16]}>
            {stocks.map((stock) => (
              <Col key={stock.id} xs={24} sm={12} lg={8} xl={6}>
                <StockCard
                  stock={stock}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onAdjust={handleAdjust}
                  onUse={handleUse}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty 
            description="Henüz stok kaydı bulunmuyor"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              İlk Stok Kaydını Oluştur
            </Button>
          </Empty>
        )}
      </Spin>

      {/* Form Modal */}
      <Modal
        title={editingStock ? 'Stok Düzenle' : 'Yeni Stok Ekle'}
        open={isFormModalVisible}
        onCancel={() => setIsFormModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <StockForm 
          stock={editingStock || undefined}
          onSuccess={onFormSuccess}
          onCancel={() => setIsFormModalVisible(false)}
        />
      </Modal>

      {/* Stok Ayarlama Modal */}
      <Modal
        title="Stok Miktarı Ayarla"
        open={isAdjustModalVisible}
        onCancel={() => setIsAdjustModalVisible(false)}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={adjustForm}
          layout="vertical"
          onFinish={onAdjustSubmit}
        >
          <Alert
            message={`Mevcut Miktar: ${selectedStock?.current_stock} ${selectedStock?.unit}`}
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="İşlemi Yapan"
            name="performed_by"
            rules={[{ required: true, message: 'İşlemi yapan kişi gereklidir!' }]}
          >
            <Input placeholder="İşlemi yapan kişi adı" />
          </Form.Item>

          <Form.Item
            label="İşlem Tipi"
            name="type"
            rules={[{ required: true, message: 'İşlem tipi seçimi gereklidir!' }]}
          >
            <Select placeholder="İşlem tipi seçin">
              <Option value="increase">Artır</Option>
              <Option value="decrease">Azalt</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Miktar"
            name="quantity"
            rules={[{ required: true, message: 'Miktar gereklidir!' }]}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }}
              placeholder="Ayarlanacak miktar"
            />
          </Form.Item>

          <Form.Item
            label="Sebep"
            name="reason"
            rules={[{ required: true, message: 'Sebep gereklidir!' }]}
          >
            <Select placeholder="Sebep seçin">
              <Option value="purchase">Satın alma</Option>
              <Option value="return">İade</Option>
              <Option value="correction">Düzeltme</Option>
              <Option value="damage">Hasar</Option>
              <Option value="loss">Kayıp</Option>
              <Option value="other">Diğer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Notlar"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Ek notlar (opsiyonel)" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsAdjustModalVisible(false)}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={isAdjusting}>
                Uygula
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Stok Kullanım Modal */}
      <Modal
        title="Stok Kullanımı"
        open={isUseModalVisible}
        onCancel={() => setIsUseModalVisible(false)}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={useForm}
          layout="vertical"
          onFinish={onUseSubmit}
        >
          <Alert
            message={`Mevcut Miktar: ${selectedStock?.current_stock} ${selectedStock?.unit}`}
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="İşlemi Yapan"
            name="performed_by"
            rules={[{ required: true, message: 'İşlemi yapan kişi gereklidir!' }]}
          >
            <Input placeholder="İşlemi yapan kişi adı" />
          </Form.Item>

          <Form.Item
            label="Kullanılacak Miktar"
            name="quantity"
            rules={[
              { required: true, message: 'Miktar gereklidir!' },
              { 
                validator: (_, value) => {
                  if (value && selectedStock && value > selectedStock.current_stock) {
                    return Promise.reject('Mevcut stoktan fazla miktar kullanılamaz!')
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <InputNumber 
              min={1} 
              max={selectedStock?.current_stock}
              style={{ width: '100%' }}
              placeholder="Kullanılacak miktar"
            />
          </Form.Item>

          <Form.Item
            label="Kullanım Sebebi"
            name="reason"
            rules={[{ required: true, message: 'Kullanım sebebi gereklidir!' }]}
          >
            <Select placeholder="Sebep seçin">
              <Option value="treatment">Tedavi</Option>
              <Option value="surgery">Cerrahi</Option>
              <Option value="cleaning">Temizlik</Option>
              <Option value="maintenance">Bakım</Option>
              <Option value="other">Diğer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Kullanan Kişi"
            name="used_by"
          >
            <Input placeholder="Kullanan kişi adı (opsiyonel)" />
          </Form.Item>

          <Form.Item
            label="Notlar"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Ek notlar (opsiyonel)" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsUseModalVisible(false)}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={isUsing}>
                Kullan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}