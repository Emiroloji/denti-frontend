// src/modules/reports/components/filters/ClinicFilter.tsx

import React, { useState, useMemo } from 'react'
import { Card, Select, Space, Button, Tag, Tooltip, Alert, Statistic, Badge } from 'antd'
import { 
  BuildOutlined, 
  FilterOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { useClinics } from '@/modules/clinic/hooks/useClinics'
import type { Clinic } from '@/modules/clinic/types/clinic.types'
import type { ReportFilter } from '../../types/reports.types'

const { Option } = Select

// =============================================================================
// INTERFACES
// =============================================================================

interface ClinicFilterProps {
  value?: Partial<ReportFilter>
  onChange?: (filters: Partial<ReportFilter>) => void
  disabled?: boolean
  showStatistics?: boolean
  allowMultiple?: boolean
  groupBySpecialty?: boolean
}

interface SpecialtyGroup {
  code: string
  name: string
  clinics: Clinic[]
  color: string
}

// =============================================================================
// SPECIALTY CONFIGURATIONS
// =============================================================================

const specialtyConfigs: Record<string, { name: string; color: string }> = {
  'ORT': { name: 'Ortodonti', color: 'blue' },
  'PER': { name: 'Periodontoloji', color: 'green' },
  'END': { name: 'Endodonti', color: 'red' },
  'PRO': { name: 'Protez', color: 'purple' },
  'PED': { name: 'Pedodonti', color: 'orange' },
  'OMF': { name: 'Oral Maksillofasiyal', color: 'cyan' },
  'EST': { name: 'Estetik', color: 'magenta' }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ClinicFilter: React.FC<ClinicFilterProps> = ({
  value,
  onChange,
  disabled = false,
  showStatistics = true,
  allowMultiple = true,
  groupBySpecialty = true
}) => {
  const { clinics, isLoading, error } = useClinics()
  const [selectedClinics, setSelectedClinics] = useState<number[]>(value?.clinicIds || [])
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const specialtyGroups = useMemo((): SpecialtyGroup[] => {
    if (!clinics) return []

    const groups: Record<string, SpecialtyGroup> = {}

    clinics.forEach((clinic: Clinic) => {
      const specialtyCode = clinic.specialty_code || 'OTHER'
      const config = specialtyConfigs[specialtyCode] || { name: 'Diğer', color: 'default' }

      if (!groups[specialtyCode]) {
        groups[specialtyCode] = {
          code: specialtyCode,
          name: config.name,
          clinics: [],
          color: config.color
        }
      }

      groups[specialtyCode].clinics.push(clinic)
    })

    return Object.values(groups).sort((a, b) => a.name.localeCompare(b.name))
  }, [clinics])

  const availableClinics = useMemo(() => {
    return clinics?.filter(clinic => clinic.is_active) || []
  }, [clinics])

  const filterStatistics = useMemo(() => {
    if (!clinics) return null

    const activeClinics = clinics.filter(clinic => clinic.is_active)
    const inactiveClinics = clinics.filter(clinic => !clinic.is_active)
    const specialtyCount = new Set(clinics.map(clinic => clinic.specialty_code)).size

    return {
      total: clinics.length,
      active: activeClinics.length,
      inactive: inactiveClinics.length,
      specialties: specialtyCount,
      selected: selectedClinics.length
    }
  }, [clinics, selectedClinics])

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleClinicChange = (clinicIds: number | number[]) => {
    let newSelection: number[]

    if (allowMultiple) {
      newSelection = Array.isArray(clinicIds) ? clinicIds : [clinicIds]
    } else {
      newSelection = Array.isArray(clinicIds) ? clinicIds.slice(0, 1) : [clinicIds]
    }

    setSelectedClinics(newSelection)

    // Emit change
    const filters: Partial<ReportFilter> = {
      ...value,
      clinicIds: newSelection.length > 0 ? newSelection : undefined,
      clinicId: !allowMultiple && newSelection.length > 0 ? newSelection[0] : undefined
    }

    onChange?.(filters)
  }

  const handleSpecialtyFilter = (specialtyCodes: string[]) => {
    setSelectedSpecialties(specialtyCodes)

    if (specialtyCodes.length === 0) {
      // Clear specialty filter, show all clinics
      return
    }

    // Filter clinics by selected specialties
    const filteredClinics = availableClinics.filter(clinic => 
      specialtyCodes.includes(clinic.specialty_code || '')
    )

    const filteredClinicIds = filteredClinics.map(clinic => clinic.id)
    
    // Update clinic selection to only include clinics from selected specialties
    const newSelection = selectedClinics.filter(id => filteredClinicIds.includes(id))
    setSelectedClinics(newSelection)

    const filters: Partial<ReportFilter> = {
      ...value,
      clinicIds: newSelection.length > 0 ? newSelection : undefined,
      clinicId: !allowMultiple && newSelection.length > 0 ? newSelection[0] : undefined
    }

    onChange?.(filters)
  }

  const handleSelectAll = () => {
    const availableIds = getFilteredClinics().map(clinic => clinic.id)
    handleClinicChange(availableIds)
  }

  const handleClearAll = () => {
    setSelectedClinics([])
    setSelectedSpecialties([])
    onChange?.({})
  }

  const getFilteredClinics = (): Clinic[] => {
    let filtered = availableClinics

    if (selectedSpecialties.length > 0) {
      filtered = filtered.filter(clinic => 
        selectedSpecialties.includes(clinic.specialty_code || '')
      )
    }

    return filtered
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderClinicOption = (clinic: Clinic) => {
    const specialtyConfig = specialtyConfigs[clinic.specialty_code || ''] || 
      { name: 'Diğer', color: 'default' }

    return (
      <Space>
        <BuildOutlined />
        <span>{clinic.name}</span>
        <Tag color={specialtyConfig.color} style={{ margin: 0 }}>
          {specialtyConfig.name}
        </Tag>
        {!clinic.is_active && (
          <Tag color="red">Pasif</Tag>
        )}
      </Space>
    )
  }

  const renderGroupedOptions = () => {
    if (!groupBySpecialty) {
      return getFilteredClinics().map(clinic => (
        <Option key={clinic.id} value={clinic.id}>
          {renderClinicOption(clinic)}
        </Option>
      ))
    }

    return specialtyGroups.map(group => {
      const groupClinics = group.clinics.filter(() => 
        selectedSpecialties.length === 0 || selectedSpecialties.includes(group.code)
      )

      if (groupClinics.length === 0) return null

      return (
        <Select.OptGroup 
          key={group.code} 
          label={
            <Space>
              <Tag color={group.color}>{group.name}</Tag>
              <Badge count={groupClinics.length} size="small" />
            </Space>
          }
        >
          {groupClinics.map(clinic => (
            <Option key={clinic.id} value={clinic.id}>
              <Space>
                <BuildOutlined />
                <span>{clinic.name}</span>
                {!clinic.is_active && <Tag color="red">Pasif</Tag>}
              </Space>
            </Option>
          ))}
        </Select.OptGroup>
      )
    }).filter(Boolean)
  }

  const renderSelectedClinics = () => {
    if (selectedClinics.length === 0) return null

    const selectedClinicData = availableClinics.filter(clinic => 
      selectedClinics.includes(clinic.id)
    )

    return (
      <div style={{ marginTop: 8 }}>
        <Space wrap>
          {selectedClinicData.map(clinic => {
            const specialtyConfig = specialtyConfigs[clinic.specialty_code || ''] || 
              { name: 'Diğer', color: 'default' }

            return (
              <Tag
                key={clinic.id}
                color={specialtyConfig.color}
                closable
                onClose={() => {
                  const newSelection = selectedClinics.filter(id => id !== clinic.id)
                  handleClinicChange(newSelection)
                }}
              >
                <Space size={4}>
                  <BuildOutlined />
                  <span>{clinic.name}</span>
                </Space>
              </Tag>
            )
          })}
        </Space>
      </div>
    )
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  if (error) {
    return (
      <Alert
        message="Klinik verileri yüklenemedi"
        type="error"
        showIcon
      />
    )
  }

  return (
    <Card
      title="Klinik Filtresi"
      size="small"
      loading={isLoading}
      extra={
        <Tooltip title="Rapor için klinik seçin">
          <FilterOutlined />
        </Tooltip>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* Specialty Filter */}
        {groupBySpecialty && specialtyGroups.length > 0 && (
          <Select
            mode="multiple"
            placeholder="Uzmanlık alanına göre filtrele"
            value={selectedSpecialties}
            onChange={handleSpecialtyFilter}
            disabled={disabled}
            style={{ width: '100%' }}
            allowClear
          >
            {specialtyGroups.map(group => (
              <Option key={group.code} value={group.code}>
                <Space>
                  <Tag color={group.color}>{group.name}</Tag>
                  <span>({group.clinics.length})</span>
                </Space>
              </Option>
            ))}
          </Select>
        )}

        {/* Clinic Selection */}
        <Select
          mode={allowMultiple ? "multiple" : undefined}
          placeholder="Klinik seçin"
          value={selectedClinics}
          onChange={handleClinicChange}
          disabled={disabled}
          style={{ width: '100%' }}
          allowClear
          showSearch
        >
          {renderGroupedOptions()}
        </Select>

        {/* Quick Actions */}
        <Space>
          <Button 
            size="small" 
            icon={<CheckCircleOutlined />}
            onClick={handleSelectAll}
            disabled={disabled || getFilteredClinics().length === 0}
          >
            Tümünü Seç
          </Button>
          <Button 
            size="small" 
            icon={<ExclamationCircleOutlined />}
            onClick={handleClearAll}
            disabled={disabled || selectedClinics.length === 0}
          >
            Temizle
          </Button>
        </Space>

        {/* Selected Clinics Display */}
        {renderSelectedClinics()}

        {/* Statistics */}
        {showStatistics && filterStatistics && (
          <div style={{ marginTop: 8 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Statistic 
                  title="Toplam" 
                  value={filterStatistics.total} 
                  prefix={<TeamOutlined />}
                  valueStyle={{ fontSize: '14px' }}
                />
                <Statistic 
                  title="Aktif" 
                  value={filterStatistics.active} 
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ fontSize: '14px', color: '#52c41a' }}
                />
                <Statistic 
                  title="Seçili" 
                  value={filterStatistics.selected} 
                  prefix={<FilterOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ fontSize: '14px', color: '#1890ff' }}
                />
              </Space>
              
              {filterStatistics.inactive > 0 && (
                <Alert
                  message={`${filterStatistics.inactive} pasif klinik var`}
                  type="warning"
                  showIcon
                  style={{ fontSize: '12px' }}
                />
              )}
            </Space>
          </div>
        )}
      </Space>
    </Card>
  )
}

export default ClinicFilter