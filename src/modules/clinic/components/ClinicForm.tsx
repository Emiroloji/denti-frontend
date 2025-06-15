// src/modules/clinic/components/ClinicForm.tsx

import React, { useEffect } from 'react'
import { 
  Form, 
  Input, 
  Switch, 
  Button, 
  Row, 
  Col,
  Card,
  Divider,
  Select
} from 'antd'
import { 
  PlusOutlined, 
  EditOutlined, 
  SaveOutlined,
  BankOutlined,
  UserOutlined,
  PhoneOutlined,
  HomeOutlined
} from '@ant-design/icons'
import { useClinics } from '../hooks/useClinics'
import { CreateClinicRequest, Clinic } from '../types/clinic.types'

const { TextArea } = Input
const { Option } = Select

// ClinicForm için interface
interface ClinicFormProps {
  clinic?: Clinic
  onSuccess?: () => void
  onCancel?: () => void
}

// ClinicForm için özel form values interface
interface ClinicFormValues {
  name: string
  code: string
  description?: string
  responsible_person?: string
  phone?: string
  location?: string
  is_active: boolean
}

export const ClinicForm: React.FC<ClinicFormProps> = ({ 
  clinic, 
  onSuccess, 
  onCancel 
}) => {
  const [form] = Form.useForm()
  
  // useClinics hook'unu kullan
  const clinicsData = useClinics({})
  const createClinic = clinicsData.createClinic
  const updateClinic = clinicsData.updateClinic
  const isCreating = clinicsData.isCreating
  const isUpdating = clinicsData.isUpdating

  useEffect(() => {
    if (clinic) {
      form.setFieldsValue({
        name: clinic.name,
        code: clinic.code,
        description: clinic.description,
        responsible_person: clinic.responsible_person,
        phone: clinic.phone,
        location: clinic.location,
        is_active: clinic.is_active
      })
    }
  }, [clinic, form])

  const onFinish = async (values: ClinicFormValues) => {
    try {
      const formData: CreateClinicRequest = {
        name: values.name,
        code: values.code.toUpperCase(), // Kod büyük harfle
        description: values.description,
        responsible_person: values.responsible_person,
        phone: values.phone,
        location: values.location,
        is_active: values.is_active
      }

      console.log('📝 Clinic Form Data to Send:', formData)

      if (clinic) {
        await updateClinic({ id: clinic.id, data: formData })
      } else {
        await createClinic(formData)
        form.resetFields()
      }
      onSuccess?.()
    } catch (error) {
      console.error('❌ Klinik işlemi başarısız:', error)
    }
  }

  // Klinik uzmanlık alanları
  const specialtyOptions = [
    { label: 'Ortodonti (ORT)', value: 'ORT' },
    { label: 'Periodontoloji (PER)', value: 'PER' },
    { label: 'Estetik Diş Hekimliği (EST)', value: 'EST' },
    { label: 'Çocuk Diş Hekimliği (PED)', value: 'PED' },
    { label: 'Oral Cerrahi (OCS)', value: 'OCS' },
    { label: 'Endodonti (END)', value: 'END' },
    { label: 'Protez (PRO)', value: 'PRO' },
    { label: 'İmplantoloji (IMP)', value: 'IMP' },
    { label: 'Genel Diş Hekimliği (GEN)', value: 'GEN' }
  ]

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {clinic ? <EditOutlined /> : <PlusOutlined />}
          {clinic ? 'Klinik Düzenle' : 'Yeni Klinik Ekle'}
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          is_active: true
        }}
      >
        <Divider orientation="left">Temel Bilgiler</Divider>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              label="Klinik Adı"
              name="name"
              rules={[
                { required: true, message: 'Klinik adı gereklidir!' },
                { min: 2, message: 'Klinik adı en az 2 karakter olmalıdır!' },
                { max: 255, message: 'Klinik adı en fazla 255 karakter olabilir!' }
              ]}
            >
              <Input 
                prefix={<BankOutlined />}
                placeholder="Klinik adını girin" 
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Klinik Kodu"
              name="code"
              rules={[
                { required: true, message: 'Klinik kodu gereklidir!' },
                { min: 2, message: 'Klinik kodu en az 2 karakter olmalıdır!' },
                { max: 10, message: 'Klinik kodu en fazla 10 karakter olabilir!' },
                { pattern: /^[A-Z0-9]+$/, message: 'Sadece büyük harf ve rakam kullanın!' }
              ]}
            >
              <Select
                placeholder="Uzmanlık seçin veya özel kod girin"
                showSearch
                allowClear
                optionFilterProp="children"
              >
                {specialtyOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Açıklama"
          name="description"
        >
          <TextArea 
            rows={3} 
            placeholder="Klinik açıklaması (opsiyonel)" 
          />
        </Form.Item>

        <Divider orientation="left">İletişim Bilgileri</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Sorumlu Doktor"
              name="responsible_person"
            >
              <Input 
                prefix={<UserOutlined />}
                placeholder="Dr. Ad Soyad" 
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Telefon"
              name="phone"
              rules={[
                { pattern: /^[0-9\s+\-()]+$/, message: 'Geçerli bir telefon numarası girin!' }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined />}
                placeholder="0212 555 0000" 
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              label="Lokasyon"
              name="location"
            >
              <Input 
                prefix={<HomeOutlined />}
                placeholder="Kat ve oda bilgisi (örn: 1. Kat, Oda 105-106)" 
              />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              label="Aktif Durumu"
              name="is_active"
              valuePropName="checked"
            >
              <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            İptal
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={clinic ? <SaveOutlined /> : <PlusOutlined />}
            loading={isCreating || isUpdating}
          >
            {clinic ? 'Güncelle' : 'Kaydet'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}