// src/modules/stock/components/StockTable.tsx

import React from 'react'
import { Table, Tag, Tooltip, Space, Button, Dropdown, Modal, message } from 'antd'
import { 
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  MinusOutlined,
  PlusOutlined,
  CalendarOutlined,
  ShopOutlined,
  BankOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { Stock } from '../types/stock.types'
import { StockLevelBadge } from './StockLevelBadge'

interface StockTableProps {
  stocks: Stock[]
  loading: boolean
  onEdit: (stock: Stock) => void
  onDelete: (id: number) => void
  onAdjust: (stock: Stock) => void
  onUse: (stock: Stock) => void
}

export const StockTable: React.FC<StockTableProps> = ({
  stocks,
  loading,
  onEdit,
  onDelete,
  onAdjust,
  onUse,
}) => {
  // Geliştirilmiş delete handler
  const handleDelete = (record: Stock) => {
    Modal.confirm({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          <span>Stok Silme Onayı</span>
        </div>
      ),
      content: (
        <div>
          <p><strong>Silinecek Stok:</strong> {record.name}</p>
          <p><strong>Mevcut Miktar:</strong> {record.current_stock} {record.unit}</p>
          
          <div style={{ 
            background: '#f6ffed', 
            border: '1px solid #b7eb8f', 
            borderRadius: 6, 
            padding: 12, 
            marginTop: 16 
          }}>
            <p style={{ margin: 0, fontSize: 12, color: '#52c41a' }}>
              ✅ <strong>Güvenli Silme:</strong> Bu stok için işlem kayıtları varsa kalıcı olarak silinmez, 
              sadece "pasif" duruma getirilir ve stok miktarı sıfırlanır.
            </p>
          </div>
        </div>
      ),
      okText: 'Evet, Sil',
      cancelText: 'İptal',
      okType: 'danger',
      width: 500,
      onOk: async () => {
        try {
          await onDelete(record.id)
          
          // Başarı mesajı - soft delete mi hard delete mi olduğunu anlayalım
          message.success({
            content: (
              <div>
                <div><strong>Stok başarıyla silindi!</strong></div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                  {record.current_stock > 0 || (record.internal_usage_count && record.internal_usage_count > 0)
                    ? '📝 İşlem kayıtları nedeniyle stok pasif duruma getirildi'
                    : '🗑️ Stok kalıcı olarak silindi'
                  }
                </div>
              </div>
            ),
            duration: 4
          })
        } catch (error: unknown) {
          console.error('Silme hatası:', error)
          const errorMessage = error && typeof error === 'object' && 'response' in error 
            ? (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Bilinmeyen hata'
            : 'Bilinmeyen hata'
          message.error('Stok silinirken hata oluştu: ' + errorMessage)
        }
      }
    })
  }

  // Tablo kolonları
  const columns: ColumnsType<Stock> = [
    {
      title: 'Ürün Bilgileri',
      key: 'product_info',
      width: 300,
      render: (_, record) => (
        <div>
          <div style={{ 
            fontWeight: 600, 
            marginBottom: 4,
            opacity: (record.status === 'deleted' || !record.is_active) ? 0.5 : 1,
            textDecoration: record.status === 'deleted' ? 'line-through' : 'none',
            color: record.status === 'deleted' ? '#999' : 'inherit'
          }}>
            {record.name}
            {record.status === 'deleted' && (
              <Tag color="red" style={{ marginLeft: 8 }}>
                🗑️ SİLİNDİ
              </Tag>
            )}
            {!record.is_active && record.status !== 'deleted' && (
              <Tag color="orange" style={{ marginLeft: 8 }}>
                ⏸️ PASİF
              </Tag>
            )}
          </div>
          {record.brand && (
            <Tag 
              color="blue" 
              style={{ 
                opacity: record.status === 'deleted' ? 0.5 : 1 
              }}
            >
              {record.brand}
            </Tag>
          )}
          {record.description && (
            <div style={{ 
              fontSize: 12, 
              color: record.status === 'deleted' ? '#ccc' : '#666', 
              marginTop: 4,
              textDecoration: record.status === 'deleted' ? 'line-through' : 'none'
            }}>
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
          <div style={{ 
            fontWeight: 600, 
            fontSize: 16,
            color: record.current_stock === 0 ? '#999' : 
                   record.status === 'deleted' ? '#ccc' : 'inherit',
            textDecoration: record.status === 'deleted' ? 'line-through' : 'none'
          }}>
            {record.current_stock}
          </div>
          <div style={{ 
            fontSize: 12, 
            color: record.status === 'deleted' ? '#ccc' : '#666',
            textDecoration: record.status === 'deleted' ? 'line-through' : 'none'
          }}>
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
      render: (_, record) => {
        // ✅ FALLBACK: Backend'den status gelmezse is_active'e göre hesapla
        const actualStatus = record.status || (record.is_active !== false ? 'active' : 'inactive')
        const isActive = record.is_active !== false // Default true
        
        if (actualStatus === 'deleted') {
          return (
            <Tag 
              color="red" 
              style={{ 
                textDecoration: 'line-through',
                opacity: 0.7 
              }}
            >
              🗑️ Silindi
            </Tag>
          )
        }
        if (!isActive) {
          return (
            <Tag 
              color="orange"
              style={{ opacity: 0.8 }}
            >
              ⏸️ Pasif
            </Tag>
          )
        }
        return <StockLevelBadge stock={record} />
      },
    },
    {
      title: 'Min/Kritik',
      key: 'limits',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: 12,
            color: record.status === 'deleted' ? '#ccc' : 'inherit',
            textDecoration: record.status === 'deleted' ? 'line-through' : 'none'
          }}>
            Min: {record.min_stock_level}
          </div>
          <div style={{ 
            fontSize: 12, 
            color: record.status === 'deleted' ? '#ccc' : '#ff4d4f',
            textDecoration: record.status === 'deleted' ? 'line-through' : 'none'
          }}>
            Kritik: {record.critical_stock_level}
          </div>
        </div>
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ 
            fontWeight: 600,
            color: record.status === 'deleted' ? '#ccc' : 'inherit',
            textDecoration: record.status === 'deleted' ? 'line-through' : 'none'
          }}>
            {record.purchase_price} {record.currency}
          </div>
          <div style={{ 
            fontSize: 12, 
            color: record.status === 'deleted' ? '#ccc' : '#666',
            textDecoration: record.status === 'deleted' ? 'line-through' : 'none'
          }}>
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
        const isDeleted = record.status === 'deleted'
        
        const menuItems: MenuProps['items'] = [
          {
            key: 'adjust',
            label: 'Stok Ayarla',
            icon: <PlusOutlined />,
            onClick: () => onAdjust(record),
            disabled: isDeleted
          },
          {
            key: 'use',
            label: 'Stok Kullan',
            icon: <MinusOutlined />,
            onClick: () => onUse(record),
            disabled: isDeleted || record.current_stock <= 0
          },
          {
            type: 'divider'
          },
          {
            key: 'edit',
            label: 'Düzenle',
            icon: <EditOutlined />,
            onClick: () => onEdit(record)
          },
          {
            key: 'delete',
            label: isDeleted ? 'Zaten Silindi' : 'Sil',
            icon: <DeleteOutlined />,
            danger: !isDeleted,
            disabled: isDeleted,
            onClick: () => !isDeleted && handleDelete(record)
          }
        ]

        return (
          <Space>
            <Tooltip title={isDeleted ? 'Silinen stok düzenlenemez' : 'Düzenle'}>
              <Button 
                type="text" 
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
                disabled={isDeleted}
              />
            </Tooltip>
            <Tooltip title={isDeleted ? 'Silinen stok kullanılamaz' : 'Stok Kullan'}>
              <Button 
                type="text" 
                size="small"
                icon={<MinusOutlined />}
                onClick={() => onUse(record)}
                disabled={isDeleted || record.current_stock <= 0}
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

  return (
    <Table
      columns={columns}
      dataSource={stocks}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 20,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} / ${total} ürün`,
      }}
      scroll={{ x: 1400 }}
      size="middle"
      rowClassName={(record) => {
        // Ant Design'ın built-in class'larını kullan
        if (record.status === 'deleted') return 'ant-table-row-selected'
        return ''
      }}
      onRow={(record) => ({
        style: {
          backgroundColor: record.status === 'deleted' 
            ? '#fff2f0' 
            : !record.is_active 
            ? '#fffbe6' 
            : undefined,
          opacity: record.status === 'deleted' 
            ? 0.6 
            : !record.is_active 
            ? 0.8 
            : 1,
        }
      })}
    />
  )
}