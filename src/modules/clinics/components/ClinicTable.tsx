// src/modules/clinics/components/ClinicTable.tsx

import React from 'react'
import { Table, Avatar, Switch, Space, Button, Tooltip, Popconfirm } from 'antd'
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  UserOutlined,
  ShopOutlined
} from '@ant-design/icons'
import { Clinic } from '../types/clinic.types'

interface ClinicTableProps {
  clinics: Clinic[]
  loading: boolean
  onEdit: (clinic: Clinic) => void
  onView: (clinic: Clinic) => void
  onDelete: (id: number) => void
  onToggleStatus: (clinic: Clinic) => void
}

export const ClinicTable: React.FC<ClinicTableProps> = ({
  clinics,
  loading,
  onEdit,
  onView,
  onDelete,
  onToggleStatus
}) => {
  const columns = [
    {
      title: 'Logo',
      dataIndex: 'logo_url',
      key: 'logo',
      width: 80,
      render: (logoUrl: string) => (
        <Avatar 
          src={logoUrl} 
          icon={<ShopOutlined />}
          size="large"
        />
      ),
    },
    {
      title: 'Klinik Bilgileri',
      key: 'clinic_info',
      render: (record: Clinic) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {record.name}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            Kod: {record.code}
          </div>
          <div style={{ color: '#666', fontSize: '12px' }}>
            <EnvironmentOutlined /> {record.city}, {record.district}
          </div>
        </div>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      render: (record: Clinic) => (
        <div>
          <div style={{ fontSize: '12px', marginBottom: '4px' }}>
            <PhoneOutlined /> {record.phone}
          </div>
          {record.email && (
            <div style={{ fontSize: '12px', marginBottom: '4px' }}>
              <MailOutlined /> {record.email}
            </div>
          )}
          {record.manager_name && (
            <div style={{ fontSize: '12px' }}>
              <UserOutlined /> {record.manager_name}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Adres',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      render: (address: string) => (
        <Tooltip title={address}>
          <span>{address}</span>
        </Tooltip>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 120,
      render: (isActive: boolean, record: Clinic) => (
        <Switch
          checked={isActive}
          onChange={() => onToggleStatus(record)}
          checkedChildren="Aktif"
          unCheckedChildren="Pasif"
          size="small"
        />
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: Clinic) => (
        <Space size="small">
          <Tooltip title="Detayları Görüntüle">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(record)}
              size="small"
            />
          </Tooltip>
          
          <Tooltip title="Düzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
              size="small"
            />
          </Tooltip>
          
          <Popconfirm
            title="Bu kliniği silmek istediğinizden emin misiniz?"
            description="Bu işlem geri alınamaz ve tüm ilişkili veriler silinecektir."
            onConfirm={() => onDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
            placement="left"
          >
            <Tooltip title="Sil">
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                danger 
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={clinics}
      loading={loading}
      rowKey="id"
      scroll={{ x: 1200 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => 
          `${range[0]}-${range[1]} arası, toplam ${total} klinik`,
        pageSizeOptions: ['10', '20', '50', '100']
      }}
      size="middle"
    />
  )
}