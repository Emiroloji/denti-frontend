// src/modules/stock/components/StockModals.tsx

import React from 'react'
import { Modal, Form, Input, InputNumber, Select, Alert, Button, Space } from 'antd'
import type { FormInstance } from 'antd'
import { Stock, StockAdjustmentRequest, StockUsageRequest } from '../types/stock.types'
import { StockForm } from './StockForm'

const { Option } = Select

interface StockModalsProps {
  // Form Modal
  isFormModalVisible: boolean
  editingStock: Stock | null
  onFormModalClose: () => void
  onFormSuccess: () => void

  // Adjust Modal
  isAdjustModalVisible: boolean
  selectedStock: Stock | null
  adjustForm: FormInstance
  onAdjustModalClose: () => void
  onAdjustSubmit: (values: StockAdjustmentRequest) => void
  isAdjusting: boolean

  // Use Modal
  isUseModalVisible: boolean
  useForm: FormInstance
  onUseModalClose: () => void
  onUseSubmit: (values: StockUsageRequest) => void
  isUsing: boolean
}

export const StockModals: React.FC<StockModalsProps> = ({
  // Form Modal props
  isFormModalVisible,
  editingStock,
  onFormModalClose,
  onFormSuccess,

  // Adjust Modal props
  isAdjustModalVisible,
  selectedStock,
  adjustForm,
  onAdjustModalClose,
  onAdjustSubmit,
  isAdjusting,

  // Use Modal props
  isUseModalVisible,
  useForm,
  onUseModalClose,
  onUseSubmit,
  isUsing,
}) => {
  return (
    <>
      {/* Form Modal */}
      <Modal
        title={editingStock ? 'Stok Düzenle' : 'Yeni Stok Ekle'}
        open={isFormModalVisible}
        onCancel={onFormModalClose}
        footer={null}
        width={800}
        destroyOnClose
      >
        <StockForm 
          stock={editingStock || undefined}
          onSuccess={onFormSuccess}
          onCancel={onFormModalClose}
        />
      </Modal>

      {/* Stok Ayarlama Modal */}
      <Modal
        title="Stok Miktarı Ayarla"
        open={isAdjustModalVisible}
        onCancel={onAdjustModalClose}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={adjustForm}
          layout="vertical"
          onFinish={onAdjustSubmit}
        >
          <Alert
            message={`Mevcut Miktar: ${selectedStock?.current_stock} ${selectedStock?.unit}`}
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="İşlemi Yapan"
            name="performed_by"
            rules={[{ required: true, message: 'İşlemi yapan kişi gereklidir!' }]}
          >
            <Input placeholder="İşlemi yapan kişi adı" />
          </Form.Item>

          <Form.Item
            label="İşlem Tipi"
            name="type"
            rules={[{ required: true, message: 'İşlem tipi seçimi gereklidir!' }]}
          >
            <Select placeholder="İşlem tipi seçin">
              <Option value="increase">Artır</Option>
              <Option value="decrease">Azalt</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Miktar"
            name="quantity"
            rules={[{ required: true, message: 'Miktar gereklidir!' }]}
          >
            <InputNumber 
              min={1} 
              style={{ width: '100%' }}
              placeholder="Ayarlanacak miktar"
            />
          </Form.Item>

          <Form.Item
            label="Sebep"
            name="reason"
            rules={[{ required: true, message: 'Sebep gereklidir!' }]}
          >
            <Select placeholder="Sebep seçin">
              <Option value="purchase">Satın alma</Option>
              <Option value="return">İade</Option>
              <Option value="correction">Düzeltme</Option>
              <Option value="damage">Hasar</Option>
              <Option value="loss">Kayıp</Option>
              <Option value="other">Diğer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Notlar"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Ek notlar (opsiyonel)" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={onAdjustModalClose}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={isAdjusting}>
                Uygula
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Stok Kullanım Modal */}
      <Modal
        title="Stok Kullanımı"
        open={isUseModalVisible}
        onCancel={onUseModalClose}
        footer={null}
        width={500}
        destroyOnClose
      >
        <Form
          form={useForm}
          layout="vertical"
          onFinish={onUseSubmit}
        >
          <Alert
            message={`Mevcut Miktar: ${selectedStock?.current_stock} ${selectedStock?.unit}`}
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label="İşlemi Yapan"
            name="performed_by"
            rules={[{ required: true, message: 'İşlemi yapan kişi gereklidir!' }]}
          >
            <Input placeholder="İşlemi yapan kişi adı" />
          </Form.Item>

          <Form.Item
            label="Kullanılacak Miktar"
            name="quantity"
            rules={[
              { required: true, message: 'Miktar gereklidir!' },
              { 
                validator: (_, value) => {
                  if (value && selectedStock && value > selectedStock.current_stock) {
                    return Promise.reject('Mevcut stoktan fazla miktar kullanılamaz!')
                  }
                  return Promise.resolve()
                }
              }
            ]}
          >
            <InputNumber 
              min={1} 
              max={selectedStock?.current_stock}
              style={{ width: '100%' }}
              placeholder="Kullanılacak miktar"
            />
          </Form.Item>

          <Form.Item
            label="Kullanım Sebebi"
            name="reason"
            rules={[{ required: true, message: 'Kullanım sebebi gereklidir!' }]}
          >
            <Select placeholder="Sebep seçin">
              <Option value="treatment">Tedavi</Option>
              <Option value="surgery">Cerrahi</Option>
              <Option value="cleaning">Temizlik</Option>
              <Option value="maintenance">Bakım</Option>
              <Option value="other">Diğer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Kullanan Kişi"
            name="used_by"
          >
            <Input placeholder="Kullanan kişi adı (opsiyonel)" />
          </Form.Item>

          <Form.Item
            label="Notlar"
            name="notes"
          >
            <Input.TextArea rows={3} placeholder="Ek notlar (opsiyonel)" />
          </Form.Item>

          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={onUseModalClose}>
                İptal
              </Button>
              <Button type="primary" htmlType="submit" loading={isUsing}>
                Kullan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}