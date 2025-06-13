import React, { useState } from 'react'
import { Table, Button, Tag, Space, Popconfirm, Card, Typography, Modal, Switch } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useCategories } from '../hooks/useCategories'
import { Category } from '../types/category.types'
import { CategoryForm } from './CategoryForm'

const { Title } = Typography

export const CategoryList: React.FC = () => {
  const { categories, isLoading, deleteCategory, updateCategory } = useCategories()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setIsEditModalVisible(true)
  }

  const handleEditCancel = () => {
    setEditingCategory(null)
    setIsEditModalVisible(false)
  }

  const handleToggleActive = async (category: Category) => {
    try {
      await updateCategory({
        id: category.id,
        data: { is_active: !category.is_active }
      })
    } catch (error) {
      console.error('Kategori durum güncellemesi başarısız:', error)
    }
  }

  const columns = [
    {
      title: 'Kategori Adı',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Renk',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <Tag color={color || 'blue'} style={{ minWidth: 60 }}>
          {color || '#6B7280'}
        </Tag>
      ),
    },
    {
      title: 'Todo Sayısı',
      dataIndex: 'todos_count',
      key: 'todos_count',
      render: (count: number) => count || 0,
    },
    {
      title: 'Durum',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean, record: Category) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record)}
          checkedChildren="Aktif"
          unCheckedChildren="Pasif"
        />
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          
          <Popconfirm
            title="Bu kategoriyi silmek istediğinizden emin misiniz?"
            description="Bu kategoriye ait todolar da silinecektir."
            onConfirm={() => deleteCategory(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Button type="text" icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <>
      <Card>
        <Title level={2}>Kategori Listesi</Title>
        
        <CategoryForm />
        
        <Table
          columns={columns}
          dataSource={categories}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Toplam ${total} kategori`,
          }}
          style={{ marginTop: 24 }}
        />
      </Card>

      <Modal
        title="Kategori Düzenle"
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={600}
      >
        {editingCategory && (
          <CategoryForm 
            category={editingCategory} 
            onSuccess={handleEditCancel}
          />
        )}
      </Modal>
    </>
  )
}