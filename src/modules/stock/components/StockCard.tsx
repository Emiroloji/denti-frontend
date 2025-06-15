// src/modules/stock/components/StockCard.tsx

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
  MenuProps
} from 'antd'
import { 
  EditOutlined, 
  DeleteOutlined, 
  MoreOutlined,
  PlusOutlined,
  MinusOutlined,
  CalendarOutlined,
  TagOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { Stock } from '../types/stock.types'
import { StockLevelBadge } from './StockLevelBadge'

const { Text, Title } = Typography

interface StockCardProps {
  stock: Stock
  onEdit?: (stock: Stock) => void
  onDelete?: (id: number) => void
  onAdjust?: (stock: Stock) => void
  onUse?: (stock: Stock) => void
}

export const StockCard: React.FC<StockCardProps> = ({
  stock,
  onEdit,
  onDelete,
  onAdjust,
  onUse
}) => {
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  const menuItems: MenuProps['items'] = [
    {
      key: 'adjust',
      label: 'Stok Ayarla',
      icon: <PlusOutlined />,
      onClick: () => onAdjust?.(stock)
    },
    {
      key: 'use',
      label: 'Stok Kullan',
      icon: <MinusOutlined />,
      onClick: () => onUse?.(stock)
    },
    {
      key: 'divider',
      type: 'divider'
    },
    {
      key: 'edit',
      label: 'Düzenle',
      icon: <EditOutlined />,
      onClick: () => onEdit?.(stock)
    },
    {
      key: 'delete',
      label: 'Sil',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => onDelete?.(stock.id)
    }
  ]

  const isExpiringSoon = () => {
    if (!stock.expiry_date) return false
    const expiryDate = dayjs(stock.expiry_date)
    const today = dayjs()
    return expiryDate.diff(today, 'day') <= 30
  }

  const isExpired = () => {
    if (!stock.expiry_date) return false
    return dayjs(stock.expiry_date).isBefore(dayjs())
  }

  return (
    <>
      <Card
        hoverable
        style={{ 
          width: '100%',
          borderLeft: `4px solid ${
            stock.current_stock <= stock.critical_stock_level ? '#ff4d4f' :
            stock.current_stock <= stock.min_stock_level ? '#faad14' : '#52c41a'
          }`
        }}
        actions={[
          <Tooltip title="Detayları Görüntüle">
            <Button 
              type="text" 
              icon={<TagOutlined />}
              onClick={() => setDetailModalVisible(true)}
            />
          </Tooltip>,
          <Tooltip title="Stok Kullan">
            <Button 
              type="text" 
              icon={<MinusOutlined />}
              onClick={() => onUse?.(stock)}
            />
          </Tooltip>,
          <Tooltip title="Stok Ayarla">
            <Button 
              type="text" 
              icon={<PlusOutlined />}
              onClick={() => onAdjust?.(stock)}
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
                {stock.name}
              </Title>
              {stock.brand && (
                <Tag color="blue" style={{ fontSize: '10px' }}>
                  {stock.brand}
                </Tag>
              )}
            </div>
            
            {stock.description && (
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {stock.description}
              </Text>
            )}
          </Space>
        </div>

        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>Stok Seviyesi:</Text>
            <StockLevelBadge stock={stock} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>Kategori:</Text>
            <Tag color="geekblue">{stock.category}</Tag>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>Fiyat:</Text>
            <Text strong>{stock.purchase_price} {stock.currency}</Text>
          </div>

          {stock.expiry_date && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text>Son Kullanma:</Text>
              <Tag 
                color={isExpired() ? 'red' : isExpiringSoon() ? 'orange' : 'green'}
                icon={<CalendarOutlined />}
              >
                {dayjs(stock.expiry_date).format('DD/MM/YYYY')}
              </Tag>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>Tedarikçi:</Text>
            <Text style={{ fontSize: '12px' }}>{stock.supplier?.name || 'Bilinmiyor'}</Text>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>Klinik:</Text>
            <Text style={{ fontSize: '12px' }}>{stock.clinic?.name || 'Bilinmiyor'}</Text>
          </div>
        </Space>
      </Card>

      <Modal
        title="Stok Detayları"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Kapat
          </Button>,
          <Button key="edit" type="primary" onClick={() => onEdit?.(stock)}>
            Düzenle
          </Button>
        ]}
        width={600}
      >
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="Ürün Adı" span={2}>{stock.name}</Descriptions.Item>
          <Descriptions.Item label="Açıklama" span={2}>{stock.description || '-'}</Descriptions.Item>
          <Descriptions.Item label="Marka">{stock.brand || '-'}</Descriptions.Item>
          <Descriptions.Item label="Birim">{stock.unit}</Descriptions.Item>
          <Descriptions.Item label="Kategori">{stock.category}</Descriptions.Item>
          <Descriptions.Item label="Durum">
            <Tag color={stock.is_active ? 'green' : 'red'}>
              {stock.is_active ? 'Aktif' : 'Pasif'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Mevcut Miktar">{stock.current_stock} {stock.unit}</Descriptions.Item>
          <Descriptions.Item label="Minimum Miktar">{stock.min_stock_level} {stock.unit}</Descriptions.Item>
          <Descriptions.Item label="Kritik Miktar">{stock.critical_stock_level} {stock.unit}</Descriptions.Item>
          <Descriptions.Item label="Depolama Yeri">{stock.storage_location || '-'}</Descriptions.Item>
          <Descriptions.Item label="Alış Fiyatı">{stock.purchase_price} {stock.currency}</Descriptions.Item>
          <Descriptions.Item label="Tedarikçi">{stock.supplier?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Klinik">{stock.clinic?.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="Alış Tarihi">{dayjs(stock.purchase_date).format('DD/MM/YYYY')}</Descriptions.Item>
          <Descriptions.Item label="Son Kullanma">{stock.expiry_date ? dayjs(stock.expiry_date).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
          <Descriptions.Item label="Oluşturulma">{stock.created_at ? dayjs(stock.created_at).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
          <Descriptions.Item label="Güncellenme">{stock.updated_at ? dayjs(stock.updated_at).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
        </Descriptions>
      </Modal>
    </>
  )
}