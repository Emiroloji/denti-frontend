// src/modules/stock/components/StockForm.tsx

import React, { useEffect } from 'react'
import { 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  DatePicker, 
  Switch, 
  Button, 
  Row, 
  Col,
  Divider,
  message
} from 'antd'
import { 
  PlusOutlined, 
  SaveOutlined
} from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import { useStocks } from '../hooks/useStocks'
import { CreateStockRequest, Stock } from '../types/stock.types'

const { Option } = Select
const { TextArea } = Input

// Mock suppliers and clinics - gerçek hook'ları varsa import edin
const mockSuppliers = [
  { id: 1, name: 'Tedarikçi A' },
  { id: 2, name: 'Tedarikçi B' },
  { id: 3, name: 'Tedarikçi C' }
]

const mockClinics = [
  { id: 1, name: 'Ana Klinik', code: 'ANA' },
  { id: 2, name: 'Şube Klinik', code: 'SB1' }
]

// StockForm için interface
interface StockFormProps {
  stock?: Stock
  onSuccess?: () => void
  onCancel?: () => void
}

// StockForm için özel form values interface
interface StockFormValues {
  name: string
  description?: string
  brand?: string
  unit: string
  category: string
  current_stock: number
  min_stock_level: number
  critical_stock_level: number
  yellow_alert_level?: number
  red_alert_level?: number
  purchase_price: number
  currency?: string
  supplier_id: number
  clinic_id: number
  purchase_date: Dayjs | null
  expiry_date?: Dayjs | null
  track_expiry?: boolean
  track_batch?: boolean
  storage_location?: string
  is_active?: boolean
}

export const StockForm: React.FC<StockFormProps> = ({ 
  stock, 
  onSuccess, 
  onCancel 
}) => {
  const [form] = Form.useForm()
  
  // useStocks hook'unu kullan
  const { createStock, updateStock, isCreating, isUpdating } = useStocks({})

  useEffect(() => {
    if (stock) {
      form.setFieldsValue({
        name: stock.name,
        description: stock.description,
        brand: stock.brand,
        unit: stock.unit,
        category: stock.category,
        current_stock: stock.current_stock,
        min_stock_level: stock.min_stock_level,
        critical_stock_level: stock.critical_stock_level,
        yellow_alert_level: stock.yellow_alert_level,
        red_alert_level: stock.red_alert_level,
        purchase_price: stock.purchase_price,
        currency: stock.currency,
        supplier_id: stock.supplier_id,
        clinic_id: stock.clinic_id,
        purchase_date: stock.purchase_date ? dayjs(stock.purchase_date) : null,
        expiry_date: stock.expiry_date ? dayjs(stock.expiry_date) : null,
        track_expiry: stock.track_expiry,
        track_batch: stock.track_batch,
        storage_location: stock.storage_location,
        is_active: stock.is_active
      })
    } else {
      // Yeni stok için default değerler
      form.setFieldsValue({
        currency: 'TRY',
        is_active: true,
        unit: 'adet',
        track_expiry: true,
        track_batch: false,
        current_stock: 0,
        min_stock_level: 10,
        critical_stock_level: 5
      })
    }
  }, [stock, form])

  const onFinish = async (values: StockFormValues) => {
    try {
      const formData: CreateStockRequest = {
        name: values.name,
        description: values.description,
        brand: values.brand,
        unit: values.unit,
        category: values.category,
        current_stock: values.current_stock,
        min_stock_level: values.min_stock_level,
        critical_stock_level: values.critical_stock_level,
        yellow_alert_level: values.yellow_alert_level || values.min_stock_level,
        red_alert_level: values.red_alert_level || values.critical_stock_level,
        purchase_price: values.purchase_price,
        currency: values.currency || 'TRY',
        supplier_id: values.supplier_id,
        clinic_id: values.clinic_id,
        purchase_date: values.purchase_date?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
        expiry_date: values.expiry_date?.format('YYYY-MM-DD'),
        track_expiry: values.track_expiry,
        track_batch: values.track_batch,
        storage_location: values.storage_location,
        is_active: values.is_active
      }

      console.log('📝 Form Data to Send:', formData)

      if (stock) {
        await updateStock({ id: stock.id, data: formData })
        message.success('Stok başarıyla güncellendi!')
      } else {
        await createStock(formData)
        message.success('Stok başarıyla oluşturuldu!')
        form.resetFields()
      }
      onSuccess?.()
    } catch (error) {
      console.error('❌ Stok işlemi başarısız:', error)
      message.error('İşlem sırasında hata oluştu!')
    }
  }

  const unitOptions = [
    { label: 'Adet', value: 'adet' },
    { label: 'Kutu', value: 'kutu' },
    { label: 'Paket', value: 'paket' },
    { label: 'Şişe', value: 'şişe' },
    { label: 'Şırınga', value: 'şırınga' },
    { label: 'Tüp', value: 'tüp' },
    { label: 'Kilogram', value: 'kg' },
    { label: 'Gram', value: 'gram' },
    { label: 'Litre', value: 'litre' },
    { label: 'Metre', value: 'metre' }
  ]

  const categoryOptions = [
    { label: 'Diş Hekimliği Malzemeleri', value: 'dental_materials' },
    { label: 'Dolgu Malzemeleri', value: 'filling_materials' },
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

  const currencyOptions = [
    { label: 'TL', value: 'TRY' },
    { label: 'USD', value: 'USD' },
    { label: 'EUR', value: 'EUR' }
  ]

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        currency: 'TRY',
        is_active: true,
        unit: 'adet',
        track_expiry: true,
        track_batch: false,
        current_stock: 0,
        min_stock_level: 10,
        critical_stock_level: 5
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Ürün Adı"
            name="name"
            rules={[
              { required: true, message: 'Ürün adı gereklidir!' },
              { min: 2, message: 'Ürün adı en az 2 karakter olmalıdır!' }
            ]}
          >
            <Input placeholder="Ürün adını girin" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Marka"
            name="brand"
          >
            <Input placeholder="Marka adı" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Açıklama"
        name="description"
      >
        <TextArea 
          rows={3} 
          placeholder="Ürün açıklaması (opsiyonel)" 
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Birim"
            name="unit"
            rules={[{ required: true, message: 'Birim seçimi gereklidir!' }]}
          >
            <Select placeholder="Birim seçin">
              {unitOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={16}>
          <Form.Item
            label="Kategori"
            name="category"
            rules={[{ required: true, message: 'Kategori seçimi gereklidir!' }]}
          >
            <Select placeholder="Kategori seçin">
              {categoryOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Stok Miktarları</Divider>

      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            label="Mevcut Stok"
            name="current_stock"
            rules={[{ required: true, message: 'Mevcut stok gereklidir!' }]}
          >
            <InputNumber 
              min={0} 
              style={{ width: '100%' }}
              placeholder="0"
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="Minimum Stok (Sarı Alarm)"
            name="min_stock_level"
            rules={[{ required: true, message: 'Minimum stok gereklidir!' }]}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }}
              placeholder="10"
            />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="Kritik Stok (Kırmızı Alarm)"
            name="critical_stock_level"
            rules={[{ required: true, message: 'Kritik stok gereklidir!' }]}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }}
              placeholder="5"
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Fiyat Bilgileri</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Alış Fiyatı"
            name="purchase_price"
            rules={[{ required: true, message: 'Alış fiyatı gereklidir!' }]}
          >
            <InputNumber 
              min={0} 
              precision={2}
              style={{ width: '100%' }}
              placeholder="0.00"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Para Birimi"
            name="currency"
            rules={[{ required: true, message: 'Para birimi seçimi gereklidir!' }]}
          >
            <Select>
              {currencyOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Depolama Yeri"
            name="storage_location"
          >
            <Input placeholder="Örn: Buzdolabı A-2" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Takip Ayarları"
            style={{ marginBottom: 8 }}
          >
            <div>
              <Form.Item
                name="track_expiry"
                valuePropName="checked"
                style={{ display: 'inline-block', marginRight: 16 }}
              >
                <Switch /> Son Kullanma Takibi
              </Form.Item>
              
              <Form.Item
                name="track_batch"
                valuePropName="checked"
                style={{ display: 'inline-block' }}
              >
                <Switch /> Lot Takibi
              </Form.Item>
            </div>
          </Form.Item>
        </Col>
      </Row>

      <Divider orientation="left">Tedarik Bilgileri</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Tedarikçi"
            name="supplier_id"
            rules={[{ required: true, message: 'Tedarikçi seçimi gereklidir!' }]}
          >
            <Select 
              placeholder="Tedarikçi seçin"
              showSearch
              optionFilterProp="children"
            >
              {mockSuppliers.map((supplier) => (
                <Option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Klinik"
            name="clinic_id"
            rules={[{ required: true, message: 'Klinik seçimi gereklidir!' }]}
          >
            <Select 
              placeholder="Klinik seçin"
              showSearch
              optionFilterProp="children"
            >
              {mockClinics.map((clinic) => (
                <Option key={clinic.id} value={clinic.id}>
                  {clinic.name} ({clinic.code})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Alış Tarihi"
            name="purchase_date"
            rules={[{ required: true, message: 'Alış tarihi gereklidir!' }]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Alış tarihini seçin"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Son Kullanma Tarihi"
            name="expiry_date"
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Son kullanma tarihi (opsiyonel)"
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Aktif Durumu"
        name="is_active"
        valuePropName="checked"
      >
        <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Button onClick={onCancel} style={{ marginRight: 8 }}>
          İptal
        </Button>
        <Button 
          type="primary" 
          htmlType="submit" 
          icon={stock ? <SaveOutlined /> : <PlusOutlined />}
          loading={isCreating || isUpdating}
        >
          {stock ? 'Güncelle' : 'Kaydet'}
        </Button>
      </Form.Item>
    </Form>
  )
}