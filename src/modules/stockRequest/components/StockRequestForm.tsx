// src/modules/stockRequest/components/StockRequestForm.tsx

import React, { useState, useEffect } from 'react'
import { 
  Card,
  Form, 
  Select, 
  InputNumber, 
  Input, 
  Button, 
  Row, 
  Col,
  Typography,
  Space,
  Alert,
  Tag
} from 'antd'
import { 
  PlusOutlined, 
  SwapOutlined,
  ShopOutlined,
  WarningOutlined
} from '@ant-design/icons'
import { useStockRequests } from '../hooks/useStockRequests'
import { useClinics } from '@/modules/clinic/hooks/useClinics'
import { useStocks } from '@/modules/stock/hooks/useStocks'
import { CreateStockRequestRequest } from '../types/stockRequest.types'

const { Option } = Select
const { TextArea } = Input
const { Text } = Typography

interface StockRequestFormProps {
  onSuccess?: () => void
  defaultRequesterClinicId?: number
}

export const StockRequestForm: React.FC<StockRequestFormProps> = ({ 
  onSuccess,
  defaultRequesterClinicId
}) => {
  const [form] = Form.useForm()
  const { createStockRequest, isCreating } = useStockRequests()
  const { clinics: allClinics } = useClinics()
  const { stocks: allStocks } = useStocks()

  const [selectedRequesterClinic, setSelectedRequesterClinic] = useState<number | undefined>(defaultRequesterClinicId)
  const [selectedTargetClinic, setSelectedTargetClinic] = useState<number | undefined>()
  const [selectedStock, setSelectedStock] = useState<number | undefined>()
  const [availableStocks, setAvailableStocks] = useState<Array<{
    id: number
    name: string
    current_stock: number
    min_stock_level: number
    critical_stock_level: number
    unit: string
    category: string
    brand?: string
    clinic_id: number
    status?: string
    storage_location?: string
  }>>([])
  const [selectedStockInfo, setSelectedStockInfo] = useState<{
    id: number
    name: string
    current_stock: number
    min_stock_level: number
    critical_stock_level: number
    unit: string
    category: string
    brand?: string
    clinic_id: number
    status?: string
    storage_location?: string
  } | null>(null)

  // Hedef klinik seçildiğinde o klinikteki stokları filtrele
  useEffect(() => {
    if (selectedTargetClinic && allStocks) {
      const clinicStocks = allStocks.filter(stock => 
        stock.clinic_id === selectedTargetClinic && 
        stock.current_stock > 0
      )
      setAvailableStocks(clinicStocks)
      setSelectedStock(undefined)
      setSelectedStockInfo(null)
      form.setFieldValue('stock_id', undefined)
      form.setFieldValue('requested_quantity', undefined)
    } else {
      setAvailableStocks([])
    }
  }, [selectedTargetClinic, allStocks, form])

  // Stok seçildiğinde bilgilerini göster
  useEffect(() => {
    if (selectedStock && availableStocks) {
      const stock = availableStocks.find(s => s.id === selectedStock)
      setSelectedStockInfo(stock || null)
      
      // Maksimum talep edilebilir miktarı hesapla (mevcut stokun %50'si)
      if (stock) {
        const maxRequestable = Math.floor(stock.current_stock * 0.5)
        form.setFieldValue('requested_quantity', Math.min(10, maxRequestable))
      }
    } else {
      setSelectedStockInfo(null)
    }
  }, [selectedStock, availableStocks, form])

  const onFinish = async (values: Omit<CreateStockRequestRequest, 'requested_by'>) => {
    try {
      await createStockRequest({
        ...values,
        requested_by: 'Sistem Kullanıcısı' // Bu dinamik olmalı
      })
      form.resetFields()
      setSelectedRequesterClinic(defaultRequesterClinicId)
      setSelectedTargetClinic(undefined)
      setSelectedStock(undefined)
      setSelectedStockInfo(null)
      onSuccess?.()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const activeClinics = allClinics?.filter(clinic => clinic.is_active) || []

  const getStockLevelColor = (stock: typeof selectedStockInfo) => {
    if (!stock) return '#d9d9d9'
    if (stock.current_stock <= stock.critical_stock_level) return '#ff4d4f'
    if (stock.current_stock <= stock.min_stock_level) return '#faad14'
    return '#52c41a'
  }

  const getMaxRequestable = (stock: typeof selectedStockInfo) => {
    if (!stock) return 0
    // Mevcut stokun maksimum %50'si talep edilebilir
    return Math.floor(stock.current_stock * 0.5)
  }

  return (
    <Card title="Yeni Stok Talebi Oluştur" style={{ marginBottom: 24 }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        initialValues={{
          requester_clinic_id: defaultRequesterClinicId
        }}
      >
        <Row gutter={16}>
          {/* Talep Eden Klinik */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Talep Eden Klinik"
              name="requester_clinic_id"
              rules={[{ required: true, message: 'Talep eden klinik seçiniz!' }]}
            >
              <Select
                placeholder="Klinik seçin"
                showSearch
                optionFilterProp="children"
                onChange={setSelectedRequesterClinic}
              >
                {activeClinics.map(clinic => (
                  <Option key={clinic.id} value={clinic.id}>
                    <Space>
                      <ShopOutlined />
                      <span>{clinic.name}</span>
                      {clinic.specialty_code && (
                        <Tag color="blue">{clinic.specialty_code}</Tag>
                      )}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Talep Edilen Klinik */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Talep Edilen Klinik"
              name="requested_from_clinic_id"
              rules={[{ required: true, message: 'Talep edilen klinik seçiniz!' }]}
            >
              <Select
                placeholder="Klinik seçin"
                showSearch
                optionFilterProp="children"
                onChange={setSelectedTargetClinic}
                disabled={!selectedRequesterClinic}
              >
                {activeClinics
                  .filter(clinic => clinic.id !== selectedRequesterClinic)
                  .map(clinic => (
                  <Option key={clinic.id} value={clinic.id}>
                    <Space>
                      <ShopOutlined />
                      <span>{clinic.name}</span>
                      {clinic.specialty_code && (
                        <Tag color="green">{clinic.specialty_code}</Tag>
                      )}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Transfer Direction Visual */}
        {selectedRequesterClinic && selectedTargetClinic && (
          <Row justify="center" style={{ margin: '16px 0' }}>
            <Col>
              <Space align="center" size="large">
                <Tag color="green" icon={<ShopOutlined />}>
                  {activeClinics.find(c => c.id === selectedTargetClinic)?.name}
                </Tag>
                <SwapOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
                <Tag color="blue" icon={<ShopOutlined />}>
                  {activeClinics.find(c => c.id === selectedRequesterClinic)?.name}
                </Tag>
              </Space>
            </Col>
          </Row>
        )}

        {/* Stok Seçimi */}
        <Form.Item
          label="Stok Ürünü"
          name="stock_id"
          rules={[{ required: true, message: 'Stok ürünü seçiniz!' }]}
        >
          <Select
            placeholder="Önce hedef klinik seçin"
            showSearch
            optionFilterProp="children"
            onChange={setSelectedStock}
            disabled={!selectedTargetClinic}
            loading={Boolean(selectedTargetClinic && availableStocks.length === 0)}
            notFoundContent={
              selectedTargetClinic ? (
                availableStocks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <WarningOutlined style={{ color: '#faad14', fontSize: '20px' }} />
                    <div>Bu klinikten talep edilebilir stok bulunamadı</div>
                  </div>
                ) : null
              ) : "Önce hedef klinik seçin"
            }
          >
            {availableStocks.map(stock => (
              <Option key={stock.id} value={stock.id}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space direction="vertical" size={0}>
                      <Text strong>{stock.name}</Text>
                      <Space size="small">
                        <Tag color="purple">{stock.category}</Tag>
                        {stock.brand && <Tag color="cyan">{stock.brand}</Tag>}
                      </Space>
                    </Space>
                  </Col>
                  <Col>
                    <Tag color={getStockLevelColor(stock)}>
                      {stock.current_stock} {stock.unit}
                    </Tag>
                  </Col>
                </Row>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Seçilen Stok Bilgileri */}
        {selectedStockInfo && (
          <Alert
            style={{ marginBottom: 16 }}
            type="info"
            showIcon
            message="Stok Bilgileri"
            description={
              <Space direction="vertical" size={4}>
                <Text>
                  <strong>Mevcut Stok:</strong> {selectedStockInfo.current_stock} {selectedStockInfo.unit}
                </Text>
                <Text>
                  <strong>Minimum Seviye:</strong> {selectedStockInfo.min_stock_level} {selectedStockInfo.unit}
                </Text>
                <Text>
                  <strong>Maksimum Talep Edilebilir:</strong> {getMaxRequestable(selectedStockInfo)} {selectedStockInfo.unit}
                </Text>
                {selectedStockInfo.storage_location && (
                  <Text>
                    <strong>Konum:</strong> {selectedStockInfo.storage_location}
                  </Text>
                )}
              </Space>
            }
          />
        )}

        <Row gutter={16}>
          {/* Talep Miktarı */}
          <Col xs={24} md={12}>
            <Form.Item
              label="Talep Miktarı"
              name="requested_quantity"
              rules={[
                { required: true, message: 'Talep miktarı gereklidir!' },
                { type: 'number', min: 1, message: 'Miktar 0\'dan büyük olmalıdır!' },
                ...(selectedStockInfo ? [{
                  type: 'number' as const, 
                  max: getMaxRequestable(selectedStockInfo), 
                  message: `Maksimum ${getMaxRequestable(selectedStockInfo)} ${selectedStockInfo.unit} talep edilebilir!`
                }] : [])
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder="Miktar girin"
                addonAfter={selectedStockInfo?.unit || 'adet'}
                disabled={!selectedStock}
              />
            </Form.Item>
          </Col>

          {/* Boş alan */}
          <Col xs={24} md={12} />
        </Row>

        {/* Talep Sebebi */}
        <Form.Item
          label="Talep Sebebi"
          name="request_reason"
          rules={[
            { required: true, message: 'Talep sebebi gereklidir!' },
            { min: 10, message: 'Talep sebebi en az 10 karakter olmalıdır!' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Neden bu stok talebinde bulunuyorsunuz? Detaylı açıklama yazın..."
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<PlusOutlined />}
            loading={isCreating}
            size="large"
          >
            Talep Oluştur
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}