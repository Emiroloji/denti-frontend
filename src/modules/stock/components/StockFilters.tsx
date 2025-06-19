// src/modules/stock/components/StockFilters.tsx

import React from 'react'
import { Card, Row, Col, Input, Select, Button, Space } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { StockFilter } from '../types/stock.types'

const { Search } = Input
const { Option } = Select

interface StockFiltersProps {
  onSearch: (value: string) => void
  onFilterChange: (field: keyof StockFilter, value: string | number | undefined) => void
  onAdd: () => void
  onRefresh: () => void
}

export const StockFilters: React.FC<StockFiltersProps> = ({
  onSearch,
  onFilterChange,
  onAdd,
  onRefresh,
}) => {
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

  return (
    <Card style={{ marginBottom: 24 }}>
      <Row gutter={16} align="middle">
        <Col span={8}>
          <Search
            placeholder="Stok adı ile ara..."
            onSearch={onSearch}
            style={{ width: '100%' }}
            allowClear
          />
        </Col>
        
        <Col span={4}>
          <Select
            placeholder="Kategori"
            style={{ width: '100%' }}
            allowClear
            onChange={(value) => onFilterChange('category', value)}
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
            onChange={(value) => onFilterChange('level', value)}
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
            onChange={(value) => onFilterChange('status', value)}
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
              onClick={onAdd}
            >
              Yeni Stok
            </Button>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={onRefresh}
            >
              Yenile
            </Button>
          </Space>
        </Col>
      </Row>
    </Card>
  )
}