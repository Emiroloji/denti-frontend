// src/modules/alerts/components/AlertActions.tsx

import React, { useState } from 'react'
import { 
  Button, 
  Popconfirm, 
  Modal, 
  Form, 
  Input, 
  Space,
  Typography,
  Divider,
  Dropdown,
  MenuProps
} from 'antd'
import { 
  CheckOutlined, 
  CloseOutlined, 
  DeleteOutlined,
  MoreOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { useAlerts } from '../hooks/useAlerts'
import { Alert } from '../types/alert.types'

const { TextArea } = Input
const { Text } = Typography

interface AlertActionsProps {
  alert: Alert
  currentUser: string
  size?: 'small' | 'default'
  showDropdown?: boolean
}

export const AlertActions: React.FC<AlertActionsProps> = ({ 
  alert, 
  currentUser,
  size = 'default',
  showDropdown = false
}) => {
  const { 
    resolveAlert, 
    dismissAlert, 
    deleteAlert,
    isResolving,
    isDismissing,
    isDeleting
  } = useAlerts()

  const [resolveModalVisible, setResolveModalVisible] = useState(false)
  const [modalKey, setModalKey] = useState(0) // Modal'ı yeniden mount etmek için

  const handleResolve = async (values: { resolution_notes?: string }) => {
    try {
      await resolveAlert({
        id: alert.id,
        data: {
          resolved_by: currentUser,
          resolution_notes: values.resolution_notes
        }
      })
      setResolveModalVisible(false)
      // Modal'ı yeniden mount et (form otomatik temizlenir)
      setModalKey(prev => prev + 1)
    } catch (error) {
      console.error('Resolve error:', error)
    }
  }

  const handleDismiss = async () => {
    try {
      await dismissAlert(alert.id)
    } catch (error) {
      console.error('Dismiss error:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteAlert(alert.id)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const buttonSize = size === 'small' ? 'small' : 'middle'

  // Çözülmüş veya yok sayılmış uyarılar için sadece silme
  if (alert.is_resolved || alert.status === 'dismissed') {
    return (
      <Popconfirm
        title="Uyarıyı Sil"
        description="Bu uyarı kalıcı olarak silinecek. Emin misiniz?"
        onConfirm={handleDelete}
        okText="Evet"
        cancelText="Hayır"
        icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
      >
        <Button
          danger
          icon={<DeleteOutlined />}
          size={buttonSize}
          loading={isDeleting}
        >
          {size === 'small' ? '' : 'Sil'}
        </Button>
      </Popconfirm>
    )
  }

  // Aktif uyarılar için tüm işlemler
  if (showDropdown) {
    const menuItems: MenuProps['items'] = [
      {
        key: 'resolve',
        icon: <CheckOutlined />,
        label: 'Çözümle',
        onClick: () => setResolveModalVisible(true)
      },
      {
        key: 'dismiss',
        icon: <CloseOutlined />,
        label: 'Yok Say',
        onClick: handleDismiss
      },
      {
        type: 'divider'
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Sil',
        danger: true,
        onClick: handleDelete
      }
    ]

    return (
      <>
        <Dropdown menu={{ items: menuItems }} trigger={['click']}>
          <Button
            icon={<MoreOutlined />}
            size={buttonSize}
            loading={isResolving || isDismissing || isDeleting}
          />
        </Dropdown>

        {/* Çözümleme Modal */}
        <Modal
          key={`resolve-modal-${modalKey}`}
          title="Uyarıyı Çözümle"
          open={resolveModalVisible}
          onCancel={() => setResolveModalVisible(false)}
          footer={null}
          width={500}
        >
          <Form
            layout="vertical"
            onFinish={handleResolve}
          >
            <Text type="secondary">
              <strong>{alert.title}</strong> uyarısı çözümleniyor
            </Text>
            <Divider />
            
            <Form.Item
              label="Çözüm Notları (Opsiyonel)"
              name="resolution_notes"
            >
              <TextArea
                rows={4}
                placeholder="Bu uyarı nasıl çözüldü? Detayları yazın..."
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setResolveModalVisible(false)}>
                  İptal
                </Button>
                <Button type="primary" htmlType="submit" loading={isResolving}>
                  Çözümle
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </>
    )
  }

  // Normal butonlar
  return (
    <>
      <Space size="small">
        <Button
          type="primary"
          icon={<CheckOutlined />}
          size={buttonSize}
          onClick={() => setResolveModalVisible(true)}
          loading={isResolving}
        >
          {size === 'small' ? '' : 'Çözümle'}
        </Button>
        
        <Popconfirm
          title="Uyarıyı Yok Say"
          description="Bu uyarı yok sayılacak. Devam edilsin mi?"
          onConfirm={handleDismiss}
          okText="Evet"
          cancelText="Hayır"
        >
          <Button
            icon={<CloseOutlined />}
            size={buttonSize}
            loading={isDismissing}
          >
            {size === 'small' ? '' : 'Yok Say'}
          </Button>
        </Popconfirm>

        <Popconfirm
          title="Uyarıyı Sil"
          description="Bu uyarı kalıcı olarak silinecek. Emin misiniz?"
          onConfirm={handleDelete}
          okText="Evet"
          cancelText="Hayır"
          icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
        >
          <Button
            danger
            icon={<DeleteOutlined />}
            size={buttonSize}
            loading={isDeleting}
          >
            {size === 'small' ? '' : 'Sil'}
          </Button>
        </Popconfirm>
      </Space>

      {/* Çözümleme Modal */}
      <Modal
        key={`resolve-modal-bottom-${modalKey}`}
        title="Uyarıyı Çözümle"
        open={resolveModalVisible}
        onCancel={() => setResolveModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          layout="vertical"
          onFinish={handleResolve}
        >
          <Text type="secondary">
            <strong>{alert.title}</strong> uyarısı çözümleniyor
          </Text>
          <Divider />
          
          <Form.Item
            label="Çözüm Notları (Opsiyonel)"
            name="resolution_notes"
          >
            <TextArea
              rows={4}
              placeholder="Bu uyarı nasıl çözüldü? Detayları yazın..."
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setResolveModalVisible(false)}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={isResolving}>
                Çözümle
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}