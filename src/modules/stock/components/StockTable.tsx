// src/modules/stock/components/StockTable.tsx

import React from 'react'
import { Table, Tag, Tooltip, Space, Button, Dropdown, Modal } from 'antd'
import { 
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  MinusOutlined,
  PlusOutlined,
  CalendarOutlined,
  ShopOutlined,
  BankOutlined,
  ExclamationCircleOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  StopOutlined
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
  onSoftDelete: (id: number) => void      // ✅ YENİ - Pasif yap
  onHardDelete: (id: number) => void      // ✅ YENİ - Kalıcı sil
  onReactivate: (id: number) => void      // ✅ YENİ - Aktif et
  onAdjust: (stock: Stock) => void
  onUse: (stock: Stock) => void
}

export const StockTable: React.FC<StockTableProps> = ({
  stocks,
  loading,
  onEdit,
  onSoftDelete,     // ✅ YENİ
  onHardDelete,     // ✅ YENİ  
  onReactivate,     // ✅ YENİ
  onAdjust,
  onUse,
}) => {
  // ✅ GELİŞMİŞ SILME HANDLER - Pasif/Aktif/Kalıcı Silme Seçenekleri
  const handleAdvancedDelete = (record: Stock) => {
    const isActive = record.is_active !== false // Default true
    const isDeleted = record.status === 'deleted'

    Modal.confirm({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          <span>Stok İşlemi Seçin</span>
        </div>
      ),
      content: (
        <div>
          <p><strong>Stok:</strong> {record.name}</p>
          <p><strong>Mevcut Miktar:</strong> {record.current_stock} {record.unit}</p>
          <p><strong>Mevcut Durum:</strong> {
            isDeleted ? '🗑️ Silinmiş' : 
            !isActive ? '⏸️ Pasif' : 
            '✅ Aktif'
          }</p>
          
          <div style={{ 
            background: '#f0f0f0', 
            padding: 12, 
            borderRadius: 6, 
            marginTop: 16 
          }}>
            <p style={{ margin: 0, fontSize: 13 }}>
              <strong>Seçenekleriniz:</strong><br/>
              • <strong>Pasif Yap:</strong> Stok görünür ama kullanılamaz (geri alınabilir)<br/>
              • <strong>Aktif Et:</strong> Pasif stoku tekrar aktif yapar<br/>
              • <strong>Kalıcı Sil:</strong> Stok tamamen silinir (geri alınamaz)<br/>
              <em style={{ color: '#666' }}>* İşlem kayıtları olan stoklar kalıcı silinemez</em>
            </p>
          </div>
        </div>
      ),
      footer: (
        <div style={{ textAlign: 'right' }}>
          <Button key="cancel" onClick={() => Modal.destroyAll()}>
            İptal
          </Button>
          
          {/* Pasif Yap Butonu - Sadece aktif stoklar için */}
          {isActive && !isDeleted && (
            <Button 
              key="soft" 
              type="default" 
              icon={<PauseOutlined />}
              style={{ marginLeft: 8, backgroundColor: '#faad14', borderColor: '#faad14', color: 'white' }}
              onClick={async () => {
                Modal.destroyAll()
                await onSoftDelete(record.id)
              }}
            >
              ⏸️ Pasif Yap
            </Button>
          )}
          
          {/* Aktif Et Butonu - Sadece pasif stoklar için */}
          {!isActive && !isDeleted && (
            <Button 
              key="reactivate" 
              type="primary" 
              icon={<PlayCircleOutlined />}
              style={{ marginLeft: 8, backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              onClick={async () => {
                Modal.destroyAll()
                await onReactivate(record.id)
              }}
            >
              ✅ Aktif Et
            </Button>
          )}
          
          {/* Kalıcı Sil Butonu - Silinmiş olanlar hariç */}
          {!isDeleted && (
            <Button 
              key="hard" 
              type="primary" 
              danger 
              icon={<StopOutlined />}
              style={{ marginLeft: 8 }}
              onClick={async () => {
                Modal.destroyAll()
                await onHardDelete(record.id)
              }}
            >
              🗑️ Kalıcı Sil
            </Button>
          )}
        </div>
      ),
      width: 600,
    })
  }

  // Status hesaplama - DÜZELTİLMİŞ VERSİYON
  const getStockStatus = (record: Stock) => {
    console.log('🔍 Stock Debug:', {
      name: record.name,
      status: record.status,
      is_active: record.is_active,
      type: typeof record.is_active
    })

    // Backend'den status field'ı varsa öncelik ver
    if (record.status) {
      if (record.status === 'deleted') return { type: 'deleted', text: '🗑️ Silindi', color: 'red' }
      if (record.status === 'inactive') return { type: 'inactive', text: '⏸️ Pasif', color: 'orange' }
      if (record.status === 'active') return { type: 'active', text: '✅ Aktif', color: 'green' }
    }

    // is_active field'ına göre değerlendir - STRICT CHECK
    if (record.is_active === false) {
      return { type: 'inactive', text: '⏸️ Pasif', color: 'orange' }
    }
    
    // Default olarak aktif kabul et (true, null, undefined için)
    return { type: 'active', text: '✅ Aktif', color: 'green' }
  }

  const columns: ColumnsType<Stock> = [
    {
      title: 'Ürün Bilgileri',
      key: 'product_info',
      width: 300,
      render: (_, record) => {
        const status = getStockStatus(record)
        
        return (
          <div>
            <div style={{ 
              fontWeight: 600, 
              marginBottom: 4,
              opacity: status.type === 'deleted' ? 0.5 : 1,
              textDecoration: status.type === 'deleted' ? 'line-through' : 'none',
              color: status.type === 'deleted' ? '#999' : 'inherit'
            }}>
              {record.name}
              {status.type === 'deleted' && (
                <Tag color="red" style={{ marginLeft: 8 }}>
                  🗑️ SİLİNDİ
                </Tag>
              )}
              {status.type === 'inactive' && (
                <Tag color="orange" style={{ marginLeft: 8 }}>
                  ⏸️ PASİF
                </Tag>
              )}
            </div>
            {record.brand && (
              <Tag 
                color="blue" 
                style={{ 
                  opacity: status.type === 'deleted' ? 0.5 : 1 
                }}
              >
                {record.brand}
              </Tag>
            )}
            {record.description && (
              <div style={{ 
                fontSize: 12, 
                color: status.type === 'deleted' ? '#ccc' : '#666', 
                marginTop: 4,
                textDecoration: status.type === 'deleted' ? 'line-through' : 'none'
              }}>
                {record.description}
              </div>
            )}
          </div>
        )
      },
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
      render: (_, record) => {
        const status = getStockStatus(record)
        
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontWeight: 600, 
              fontSize: 16,
              color: record.current_stock === 0 ? '#999' : 
                     status.type === 'deleted' ? '#ccc' : 'inherit',
              textDecoration: status.type === 'deleted' ? 'line-through' : 'none'
            }}>
              {record.current_stock}
            </div>
            <div style={{ 
              fontSize: 12, 
              color: status.type === 'deleted' ? '#ccc' : '#666',
              textDecoration: status.type === 'deleted' ? 'line-through' : 'none'
            }}>
              {record.unit}
            </div>
          </div>
        )
      },
    },
    {
      title: 'Durum',
      key: 'status',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const status = getStockStatus(record)
        
        return (
          <div>
            <Tag color={status.color}>
              {status.text}
            </Tag>
            {status.type === 'active' && <StockLevelBadge stock={record} />}
          </div>
        )
      },
    },
    {
      title: 'Min/Kritik',
      key: 'limits',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const status = getStockStatus(record)
        
        return (
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              fontSize: 12,
              color: status.type === 'deleted' ? '#ccc' : 'inherit',
              textDecoration: status.type === 'deleted' ? 'line-through' : 'none'
            }}>
              Min: {record.min_stock_level}
            </div>
            <div style={{ 
              fontSize: 12, 
              color: status.type === 'deleted' ? '#ccc' : '#ff4d4f',
              textDecoration: status.type === 'deleted' ? 'line-through' : 'none'
            }}>
              Kritik: {record.critical_stock_level}
            </div>
          </div>
        )
      },
    },
    {
      title: 'Fiyat',
      key: 'price',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const status = getStockStatus(record)
        
        return (
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontWeight: 600,
              color: status.type === 'deleted' ? '#ccc' : 'inherit',
              textDecoration: status.type === 'deleted' ? 'line-through' : 'none'
            }}>
              {record.purchase_price} {record.currency || 'TRY'}
            </div>
            <div style={{ 
              fontSize: 12, 
              color: status.type === 'deleted' ? '#ccc' : '#666',
              textDecoration: status.type === 'deleted' ? 'line-through' : 'none'
            }}>
              Toplam: {(record.purchase_price * record.current_stock).toLocaleString()} {record.currency || 'TRY'}
            </div>
          </div>
        )
      },
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
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const status = getStockStatus(record)
        const isDeleted = status.type === 'deleted'
        const isInactive = status.type === 'inactive'
        
        const menuItems: MenuProps['items'] = [
          {
            key: 'adjust',
            label: 'Stok Ayarla',
            icon: <PlusOutlined />,
            onClick: () => onAdjust(record),
            disabled: isDeleted || isInactive
          },
          {
            key: 'use',
            label: 'Stok Kullan',
            icon: <MinusOutlined />,
            onClick: () => onUse(record),
            disabled: isDeleted || isInactive || record.current_stock <= 0
          },
          {
            type: 'divider'
          },
          {
            key: 'edit',
            label: 'Düzenle',
            icon: <EditOutlined />,
            onClick: () => onEdit(record),
            disabled: isDeleted
          },
          {
            key: 'delete-options',
            label: 'Durum İşlemleri',
            icon: <DeleteOutlined />,
            onClick: () => handleAdvancedDelete(record)
          }
        ]

        return (
          <Space>
            <Tooltip title={isDeleted || isInactive ? 'Pasif/Silinmiş stok düzenlenemez' : 'Düzenle'}>
              <Button 
                type="text" 
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
                disabled={isDeleted}
              />
            </Tooltip>
            
            <Tooltip title="Stok İşlemleri">
              <Button 
                type="text" 
                size="small"
                icon={<MinusOutlined />}
                onClick={() => onUse(record)}
                disabled={isDeleted || isInactive || record.current_stock <= 0}
              />
            </Tooltip>

            {/* ✅ YENİ - Gelişmiş Silme/Durum Butonu */}
            <Tooltip title="Durum İşlemleri (Pasif/Aktif/Sil)">
              <Button 
                type="text" 
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleAdvancedDelete(record)}
                style={{ 
                  color: isDeleted ? '#ccc' : 
                         isInactive ? '#faad14' : 
                         '#ff4d4f' 
                }}
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
      scroll={{ x: 1600 }}
      size="middle"
      onRow={(record) => {
        const status = getStockStatus(record)
        return {
          style: {
            backgroundColor: 
              status.type === 'deleted' ? '#fff2f0' : 
              status.type === 'inactive' ? '#fffbe6' : 
              undefined,
            opacity: 
              status.type === 'deleted' ? 0.6 : 
              status.type === 'inactive' ? 0.8 : 
              1,
          }
        }
      }}
    />
  )
}