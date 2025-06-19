// src/modules/stock/components/StockList.tsx

import React, { useState, useCallback, useMemo } from 'react'
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
  Table,
  Tag,
  Tooltip,
  Dropdown,
  MenuProps,
} from 'antd'
import { 
  PlusOutlined, 
  WarningOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  MinusOutlined,
  CalendarOutlined,
  DollarOutlined,
  ShopOutlined,
  BankOutlined
} from '@ant-design/icons'
import { useStocks } from '../hooks/useStocks'
import { Stock, StockFilter, StockAdjustmentRequest, StockUsageRequest } from '../types/stock.types'
import { StockForm } from './StockForm'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'

const { Option } = Select
const { Search } = Input
const { Title } = Typography

// Stok seviye badge component'i
const StockLevelBadge: React.FC<{ stock: Stock }> = ({ stock }) => {
  const getStockLevel = () => {
    const { current_stock, min_stock_level, critical_stock_level, expiry_date } = stock
    
    // Süre kontrolü
    if (expiry_date) {
      const expiryDate = new Date(expiry_date)
      const today = new Date()
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntilExpiry <= 0) {
        return { level: 'expired', color: 'default', text: 'Süresi Geçmiş' }
      }
      
      if (daysUntilExpiry <= 7) {
        return { level: 'expiring', color: 'red', text: `${daysUntilExpiry} gün kaldı` }
      }
    }
    
    // Stok seviye kontrolü
    if (current_stock <= critical_stock_level) {
      return { level: 'critical', color: 'red', text: 'Kritik Seviye' }
    }
    
    if (current_stock <= min_stock_level) {
      return { level: 'low', color: 'orange', text: 'Düşük Seviye' }
    }
    
    return { level: 'normal', color: 'green', text: 'Normal' }
  }

  const levelInfo = getStockLevel()

  return (
    <Tag color={levelInfo.color} style={{ margin: 0 }}>
      {levelInfo.text}
    </Tag>
  )
}

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
    useStock: executeStockUsage,
    isAdjusting,
    isUsing
  } = useStocks(filters)

  // Manuel hesaplamalar (hook'lar disable edildi)
  const stockStats = useMemo(() => {
    if (!stocks) return null
    
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    return {
      total_items: stocks.length,
      low_stock_items: stocks.filter(s => s.current_stock <= s.min_stock_level).length,
      critical_stock_items: stocks.filter(s => s.current_stock <= s.critical_stock_level).length,
      expiring_items: stocks.filter(s => {
        if (!s.expiry_date) return false
        const expiryDate = new Date(s.expiry_date)
        return expiryDate <= thirtyDaysFromNow && expiryDate >= today
      }).length,
      total_value: stocks.reduce((sum, s) => sum + (s.purchase_price * s.current_stock), 0)
    }
  }, [stocks])

  const lowStockItems = useMemo(() => {
    if (!stocks) return []
    return stocks.filter(s => s.current_stock <= s.min_stock_level)
  }, [stocks])

  const criticalStockItems = useMemo(() => {
    if (!stocks) return []
    return stocks.filter(s => s.current_stock <= s.critical_stock_level)
  }, [stocks])

  const expiringItems = useMemo(() => {
    if (!stocks) return []
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)
    
    return stocks.filter(s => {
      if (!s.expiry_date) return false
      const expiryDate = new Date(s.expiry_date)
      return expiryDate <= thirtyDaysFromNow && expiryDate >= today
    })
  }, [stocks])

  // Event handlers
  const handleSearch = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, name: value }))
  }, [])

  const handleFilterChange = useCallback((field: keyof StockFilter, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleAdd = useCallback(() => {
    setEditingStock(null)
    setIsFormModalVisible(true)
  }, [])

  const handleEdit = useCallback((stock: Stock) => {
    setEditingStock(stock)
    setIsFormModalVisible(true)
  }, [])

  const handleDelete = useCallback(async (id: number) => {
    await deleteStock(id)
  }, [deleteStock])

  const handleAdjust = useCallback((stock: Stock) => {
    setSelectedStock(stock)
    setIsAdjustModalVisible(true)
    adjustForm.resetFields()
  }, [adjustForm])

  const handleUse = useCallback((stock: Stock) => {
    setSelectedStock(stock)
    setIsUseModalVisible(true)
    useForm.resetFields()
  }, [useForm])

  const onAdjustSubmit = useCallback(async (values: StockAdjustmentRequest) => {
    if (!selectedStock) return
    
    try {
      await adjustStock({ id: selectedStock.id, data: values })
      setIsAdjustModalVisible(false)
      setSelectedStock(null)
      adjustForm.resetFields()
    } catch (error) {
      console.error('Stok ayarlama hatası:', error)
    }
  }, [selectedStock, adjustStock, adjustForm])

  const handleStockUsage = useCallback(async (values: StockUsageRequest) => {
    if (!selectedStock) return
    
    try {
      await executeStockUsage({ id: selectedStock.id, data: values })
      setIsUseModalVisible(false)
      setSelectedStock(null)
      useForm.resetFields()
    } catch (error) {
      console.error('Stok kullanım hatası:', error)
    }
  }, [selectedStock, executeStockUsage, useForm])

  const onFormSuccess = useCallback(() => {
    setIsFormModalVisible(false)
    setEditingStock(null)
  }, [])

  // Tablo kolonları
  const columns: ColumnsType<Stock> = [
    {
      title: 'Ürün Bilgileri',
      key: 'product_info',
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>
            {record.name}
          </div>
          {record.brand && (
            <Tag color="blue">{record.brand}</Tag>
          )}
          {record.description && (
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {record.description}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => (
        <Tag color="geekblue">{category}</Tag>
      ),
    },
    {
      title: 'Mevcut Stok',
      key: 'current_stock',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 600, fontSize: 16 }}>
            {record.current_stock}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {record.unit}
          </div>
        </div>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <StockLevelBadge stock={record} />
      ),
    },
    {
      title: 'Min/Kritik',
      key: 'limits',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12 }}>
            Min: {record.min_stock_level}
          </div>
          <div style={{ fontSize: 12, color: '#ff4d4f' }}>
            Kritik: {record.critical_stock_level}
          </div>
        </div>
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600 }}>
            {record.purchase_price} {record.currency}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            Toplam: {(record.purchase_price * record.current_stock).toLocaleString()} {record.currency}
          </div>
        </div>
      ),
    },
    {
      title: 'Son Kullanma',
      dataIndex: 'expiry_date',
      key: 'expiry_date',
      width: 120,
      align: 'center',
      render: (expiry_date) => {
        if (!expiry_date) return <span style={{ color: '#999' }}>-</span>
        
        const expiryDate = dayjs(expiry_date)
        const today = dayjs()
        const daysLeft = expiryDate.diff(today, 'day')
        
        let color = 'green'
        if (daysLeft <= 0) color = 'red'
        else if (daysLeft <= 7) color = 'orange'
        else if (daysLeft <= 30) color = 'yellow'
        
        return (
          <Tooltip title={`${daysLeft} gün kaldı`}>
            <Tag color={color} icon={<CalendarOutlined />}>
              {expiryDate.format('DD/MM/YYYY')}
            </Tag>
          </Tooltip>
        )
      },
    },
    {
      title: 'Tedarikçi',
      key: 'supplier',
      width: 150,
      render: (_, record) => (
        <div>
          <div style={{ fontSize: 12 }}>
            <ShopOutlined /> {record.supplier?.name || 'Bilinmiyor'}
          </div>
          <div style={{ fontSize: 12, color: '#666' }}>
            <BankOutlined /> {record.clinic?.name || 'Bilinmiyor'}
          </div>
        </div>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'adjust',
            label: 'Stok Ayarla',
            icon: <PlusOutlined />,
            onClick: () => handleAdjust(record)
          },
          {
            key: 'use',
            label: 'Stok Kullan',
            icon: <MinusOutlined />,
            onClick: () => handleUse(record)
          },
          {
            type: 'divider'
          },
          {
            key: 'edit',
            label: 'Düzenle',
            icon: <EditOutlined />,
            onClick: () => handleEdit(record)
          },
          {
            key: 'delete',
            label: 'Sil',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record.id)
          }
        ]

        return (
          <Space>
            <Tooltip title="Düzenle">
              <Button 
                type="text" 
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            <Tooltip title="Stok Kullan">
              <Button 
                type="text" 
                size="small"
                icon={<MinusOutlined />}
                onClick={() => handleUse(record)}
              />
            </Tooltip>
            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        )
      },
    },
  ]

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
            prefix={<DollarOutlined />}
          />
        </Card>
      </Col>
    </Row>
  )

  const alertsSection = (
    <>
      {criticalStockItems && criticalStockItems.length > 0 && (
        <Alert
          message={`${criticalStockItems.length} ürün kritik seviyede!`}
          description={`Bu ürünler: ${criticalStockItems.slice(0, 3).map(item => item.name).join(', ')}${criticalStockItems.length > 3 ? '...' : ''}`}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {lowStockItems && lowStockItems.length > 0 && (
        <Alert
          message={`${lowStockItems.length} ürün düşük seviyede`}
          description={`Bu ürünler: ${lowStockItems.slice(0, 3).map(item => item.name).join(', ')}${lowStockItems.length > 3 ? '...' : ''}`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {expiringItems && expiringItems.length > 0 && (
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

  return (
    <div>
      <Title level={2}>Stok Yönetimi</Title>
      
      {statsCards}
      {alertsSection}
      
      {/* Filtreler */}
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

      {/* Ana Tablo */}
      <Card>
        <Table
          columns={columns}
          dataSource={stocks}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} / ${total} ürün`,
          }}
          scroll={{ x: 1400 }}
          size="middle"
        />
      </Card>

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
          onFinish={handleStockUsage}
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