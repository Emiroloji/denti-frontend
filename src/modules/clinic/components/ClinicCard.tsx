// src/modules/clinic/components/ClinicCard.tsx

import React, { useState } from 'react'
import { 
  Card, 
  Tag, 
  Button, 
  Space, 
  Tooltip, 
  Modal, 
  Typography, 
  Descriptions,
  Dropdown,
  Divider,
  Badge
} from 'antd'
import { 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined,
  PhoneOutlined,
  UserOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  MedicineBoxOutlined,
  EyeOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { Clinic } from '../types/clinic.types'
import { useClinicSummary } from '../hooks/useClinics'

const { Text, Title } = Typography

interface ClinicCardProps {
  clinic: Clinic
  onEdit?: (clinic: Clinic) => void
  onDelete?: (id: number) => void
  onViewStocks?: (clinic: Clinic) => void
}

export const ClinicCard: React.FC<ClinicCardProps> = ({
  clinic,
  onEdit,
  onDelete,
  onViewStocks
}) => {
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const { data: clinicSummary } = useClinicSummary(clinic.id)

  const menuItems = [
    {
      key: 'view-stocks',
      label: 'Stokları Görüntüle',
      icon: <EyeOutlined />,
      onClick: () => onViewStocks?.(clinic)
    },
    {
      key: 'edit',
      label: 'Düzenle',
      icon: <EditOutlined />,
      onClick: () => onEdit?.(clinic)
    },
    {
      key: 'delete',
      label: 'Sil',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete?.(clinic.id)
    }
  ]

  const getSpecialtyColor = (code: string) => {
    switch (code.toUpperCase()) {
      case 'ORT': return 'blue'
      case 'PER': return 'green'
      case 'EST': return 'purple'
      case 'PED': return 'orange'
      default: return 'default'
    }
  }

  return (
    <>
      <Card
        hoverable
        style={{ 
          width: '100%',
          borderLeft: `4px solid ${clinic.is_active ? '#52c41a' : '#ff4d4f'}`
        }}
        actions={[
          <Tooltip title="Detayları Görüntüle">
            <Button 
              type="text" 
              icon={<InfoCircleOutlined />}
              onClick={() => setDetailModalVisible(true)}
            />
          </Tooltip>,
          <Tooltip title="Stokları Görüntüle">
            <Button 
              type="text" 
              icon={<MedicineBoxOutlined />}
              onClick={() => onViewStocks?.(clinic)}
            />
          </Tooltip>,
          <Tooltip title="Düzenle">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => onEdit?.(clinic)}
            />
          </Tooltip>,
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        ]}
      >
        <div style={{ marginBottom: 12 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Title level={5} style={{ margin: 0, flex: 1 }}>
                {clinic.name}
              </Title>
              <Space>
                <Tag color={getSpecialtyColor(clinic.code)}>
                  {clinic.code}
                </Tag>
                <Tag color={clinic.is_active ? 'green' : 'red'}>
                  {clinic.is_active ? 'Aktif' : 'Pasif'}
                </Tag>
              </Space>
            </div>

            {clinic.description && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {clinic.description}
              </Text>
            )}
          </Space>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size="small">
          {clinic.responsible_person && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserOutlined style={{ color: '#1890ff' }} />
              <Text>{clinic.responsible_person}</Text>
            </div>
          )}

          {clinic.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PhoneOutlined style={{ color: '#52c41a' }} />
              <Text>{clinic.phone}</Text>
            </div>
          )}

          {clinic.location && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <HomeOutlined style={{ color: '#722ed1' }} />
              <Text style={{ fontSize: '12px' }}>{clinic.location}</Text>
            </div>
          )}

          {/* Stok Özeti */}
          {clinicSummary && (
            <div style={{ marginTop: 12, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: '12px' }}>Toplam Stok:</Text>
                  <Badge count={clinicSummary.total_stock_items} showZero color="#108ee9" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: '12px' }}>Düşük Seviye:</Text>
                  <Badge count={clinicSummary.low_stock_items} showZero color="#faad14" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: '12px' }}>Kritik Seviye:</Text>
                  <Badge count={clinicSummary.critical_stock_items} showZero color="#ff4d4f" />
                </div>
              </Space>
            </div>
          )}
        </Space>
      </Card>

      <Modal
        title="Klinik Detayları"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>,
          <Button key="edit" type="primary" onClick={() => onEdit?.(clinic)}>
            Düzenle
          </Button>
        ]}
        width={600}
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Klinik Adı" span={2}>{clinic.name}</Descriptions.Item>
          <Descriptions.Item label="Kod">{clinic.code}</Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={clinic.is_active ? 'green' : 'red'}>
              {clinic.is_active ? 'Aktif' : 'Pasif'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Açıklama" span={2}>{clinic.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="Sorumlu Doktor">{clinic.responsible_person || '-'}</Descriptions.Item>
          <Descriptions.Item label="Telefon">{clinic.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="Lokasyon" span={2}>{clinic.location || '-'}</Descriptions.Item>
        </Descriptions>

        {clinicSummary && (
          <>
            <Divider orientation="left">Stok Özeti</Divider>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="Toplam Stok Kalemi">
                {clinicSummary.total_stock_items}
              </Descriptions.Item>
              <Descriptions.Item label="Toplam Değer">
                {clinicSummary.total_stock_value?.toFixed(2)} TL
              </Descriptions.Item>
              <Descriptions.Item label="Düşük Seviye">
                <Badge count={clinicSummary.low_stock_items} showZero color="#faad14" />
              </Descriptions.Item>
              <Descriptions.Item label="Kritik Seviye">
                <Badge count={clinicSummary.critical_stock_items} showZero color="#ff4d4f" />
              </Descriptions.Item>
            </Descriptions>
          </>
        )}

        <Divider orientation="left">Sistem Bilgileri</Divider>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Oluşturulma">
            {dayjs(clinic.created_at).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
          <Descriptions.Item label="Son Güncelleme">
            {dayjs(clinic.updated_at).format('DD/MM/YYYY HH:mm')}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </>
  )
}