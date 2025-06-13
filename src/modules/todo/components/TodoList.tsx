import React, { useState } from 'react'
import { Table, Button, Tag, Space, Popconfirm, Card, Typography, Modal } from 'antd'
import { EditOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useTodos } from '../hooks/useTodos'
import { Todo } from '../types/todo.types'
import { TodoForm } from './TodoForm'

const { Title } = Typography

export const TodoList: React.FC = () => {
  const { todos, isLoading, deleteTodo, toggleTodo } = useTodos()
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setIsEditModalVisible(true)
  }

  const handleEditCancel = () => {
    setEditingTodo(null)
    setIsEditModalVisible(false)
  }

  const columns = [
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Todo) => (
        <span style={{ textDecoration: record.completed ? 'line-through' : 'none' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string) => text || '-'
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      render: (category: any) => (
        category ? (
          <Tag color={category.color || 'blue'}>
            {category.name}
          </Tag>
        ) : '-'
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'completed',
      key: 'completed',
      render: (completed: boolean) => (
        <Tag color={completed ? 'green' : 'orange'}>
          {completed ? 'Tamamlandı' : 'Bekliyor'}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      render: (_: any, record: Todo) => (
        <Space size="middle">
          <Button
            type="text"
            icon={record.completed ? <CloseOutlined /> : <CheckOutlined />}
            onClick={() => toggleTodo(record.id)}
            style={{ color: record.completed ? '#ff4d4f' : '#52c41a' }}
          >
            {record.completed ? 'Geri Al' : 'Tamamla'}
          </Button>
          
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          
          <Popconfirm
            title="Bu todo'yu silmek istediğinizden emin misiniz?"
            onConfirm={() => deleteTodo(record.id)}
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
        <Title level={2}>Todo Listesi</Title>
        
        <TodoForm />
        
        <Table
          columns={columns}
          dataSource={todos}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Toplam ${total} todo`,
          }}
          style={{ marginTop: 24 }}
        />
      </Card>

      <Modal
        title="Todo Düzenle"
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={600}
      >
        {editingTodo && (
          <TodoForm 
            todo={editingTodo} 
            onSuccess={handleEditCancel}
          />
        )}
      </Modal>
    </>
  )
}