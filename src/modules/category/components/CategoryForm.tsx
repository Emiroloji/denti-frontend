import React from 'react'
import { Form, Input, Button, Switch, Card, ColorPicker } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import { useCategories } from '../hooks/useCategories'
import { CreateCategoryRequest, Category } from '../types/category.types'

interface CategoryFormProps {
  category?: Category
  onSuccess?: () => void
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSuccess }) => {
  const [form] = Form.useForm()
  const { createCategory, updateCategory, isCreating, isUpdating } = useCategories()

  React.useEffect(() => {
    if (category) {
      form.setFieldsValue({
        name: category.name,
        color: category.color,
        is_active: category.is_active
      })
    }
  }, [category, form])

  const onFinish = async (values: CreateCategoryRequest & { color: any }) => {
    try {
      const data = {
        ...values,
        color: typeof values.color === 'object' ? values.color.toHexString() : values.color
      }
      
      if (category) {
        await updateCategory({ id: category.id, data })
      } else {
        await createCategory(data)
        form.resetFields()
      }
      onSuccess?.()
    } catch (error) {
      console.error('Kategori işlemi başarısız:', error)
    }
  }

  return (
    <Card 
      title={category ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'} 
      style={{ marginBottom: 24 }}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        autoComplete="off"
        initialValues={{
          color: '#6B7280',
          is_active: true
        }}
      >
        <Form.Item
          label="Kategori Adı"
          name="name"
          rules={[
            { required: true, message: 'Kategori adı gereklidir!' },
            { min: 2, message: 'Kategori adı en az 2 karakter olmalıdır!' },
            { max: 100, message: 'Kategori adı en fazla 100 karakter olabilir!' }
          ]}
        >
          <Input placeholder="Kategori adını girin" />
        </Form.Item>

        <Form.Item
          label="Renk"
          name="color"
        >
          <ColorPicker 
            showText 
            format="hex"
            presets={[
              { label: 'Mavi', colors: ['#1890ff', '#40a9ff', '#69c0ff'] },
              { label: 'Yeşil', colors: ['#52c41a', '#73d13d', '#95de64'] },
              { label: 'Kırmızı', colors: ['#ff4d4f', '#ff7875', '#ffa39e'] },
              { label: 'Mor', colors: ['#722ed1', '#9254de', '#b37feb'] },
              { label: 'Turuncu', colors: ['#fa8c16', '#ffa940', '#ffc069'] },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Durum"
          name="is_active"
          valuePropName="checked"
        >
          <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={category ? <EditOutlined /> : <PlusOutlined />}
            loading={isCreating || isUpdating}
          >
            {category ? 'Güncelle' : 'Kategori Ekle'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}