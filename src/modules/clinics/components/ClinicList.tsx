// src/modules/clinics/components/ClinicList.tsx

import React, { useState, useMemo } from 'react'
import { Card, Modal } from 'antd'
import { useClinics, useClinicStats } from '../hooks/useClinics'
import { Clinic, ClinicFilter } from '../types/clinic.types'
import { ClinicHeader } from './ClinicHeader'
import { ClinicFilters } from './ClinicFilters'
import { ClinicTable } from './ClinicTable'
import { ClinicForm } from './ClinicForm'
import { ClinicDetail } from './ClinicDetail'

export const ClinicList: React.FC = () => {
  // State management
  const [filters, setFilters] = useState<ClinicFilter>({})
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null)
  const [viewingClinic, setViewingClinic] = useState<Clinic | null>(null)
  const [isEditModalVisible, setIsEditModalVisible] = useState(false)
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false)
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false)

  // Hooks
  const { 
    clinics, 
    isLoading, 
    deleteClinic, 
    updateClinic,
    refetch 
  } = useClinics(filters)

  const { data: stats, isLoading: statsLoading } = useClinicStats()

  // Computed values
  const uniqueCities = useMemo(() => {
    if (!clinics) return []
    return [...new Set(clinics.map(clinic => clinic.city))].sort()
  }, [clinics])

  // Event handlers
  const handleFiltersChange = (newFilters: ClinicFilter) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({})
  }

  const handleCreateClick = () => {
    setIsCreateModalVisible(true)
  }

  const handleEdit = (clinic: Clinic) => {
    setEditingClinic(clinic)
    setIsEditModalVisible(true)
  }

  const handleView = (clinic: Clinic) => {
    setViewingClinic(clinic)
    setIsDetailModalVisible(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteClinic(id)
    } catch (error) {
      console.error('Klinik silme hatası:', error)
    }
  }

  const handleToggleStatus = async (clinic: Clinic) => {
    try {
      await updateClinic({
        id: clinic.id,
        data: { is_active: !clinic.is_active }
      })
    } catch (error) {
      console.error('Klinik durum güncellemesi başarısız:', error)
    }
  }

  const handleRefresh = () => {
    refetch()
  }

  // Modal handlers
  const handleEditCancel = () => {
    setEditingClinic(null)
    setIsEditModalVisible(false)
  }

  const handleDetailCancel = () => {
    setViewingClinic(null)
    setIsDetailModalVisible(false)
  }

  const handleCreateCancel = () => {
    setIsCreateModalVisible(false)
  }

  const handleEditSuccess = () => {
    handleEditCancel()
    refetch()
  }

  const handleCreateSuccess = () => {
    handleCreateCancel()
    refetch()
  }

  return (
    <div>
      {/* Sayfa Başlığı ve İstatistikler */}
      <ClinicHeader
        onCreateClick={handleCreateClick}
        onRefresh={handleRefresh}
        loading={isLoading}
        totalClinics={stats?.total_clinics || clinics?.length || 0}
        activeClinics={stats?.active_clinics || clinics?.filter(c => c.is_active).length || 0}
        statsLoading={statsLoading}
      />

      {/* Filtreleme */}
      <ClinicFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        cities={uniqueCities}
        loading={isLoading}
      />

      {/* Ana Tablo */}
      <Card>
        <ClinicTable
          clinics={clinics || []}
          loading={isLoading}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      </Card>

      {/* Yeni Klinik Ekleme Modal */}
      <Modal
        title="Yeni Klinik Ekle"
        open={isCreateModalVisible}
        onCancel={handleCreateCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        <ClinicForm 
          onSuccess={handleCreateSuccess}
          onCancel={handleCreateCancel}
        />
      </Modal>

      {/* Klinik Düzenleme Modal */}
      <Modal
        title="Klinik Düzenle"
        open={isEditModalVisible}
        onCancel={handleEditCancel}
        footer={null}
        width={800}
        destroyOnClose
      >
        {editingClinic && (
          <ClinicForm 
            clinic={editingClinic}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        )}
      </Modal>

      {/* Klinik Detay Modal */}
      <Modal
        title="Klinik Detayları"
        open={isDetailModalVisible}
        onCancel={handleDetailCancel}
        footer={null}
        width={1200}
        destroyOnClose
      >
        {viewingClinic && (
          <ClinicDetail 
            clinic={viewingClinic}
            onEdit={handleEdit}
          />
        )}
      </Modal>
    </div>
  )
}