// src/modules/reports/components/filters/DateRangeFilter.tsx

import React, { useState, useEffect } from 'react'
import { Card, Select, DatePicker, Space, Button, Tag, Tooltip, Alert } from 'antd'
import { CalendarOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import type { ReportFilter } from '../../types/reports.types'

// Extend dayjs with quarter plugin
dayjs.extend(quarterOfYear)

const { RangePicker } = DatePicker
const { Option } = Select

// =============================================================================
// INTERFACES
// =============================================================================

interface DateRangeFilterProps {
  value?: Partial<ReportFilter>
  onChange?: (filters: Partial<ReportFilter>) => void
  disabled?: boolean
  showPresets?: boolean
  showRelativeDescription?: boolean
  maxDays?: number
}

interface DatePreset {
  label: string
  value: string
  startDate: Dayjs
  endDate: Dayjs
  description: string
  color: string
}

// =============================================================================
// PRESET CONFIGURATIONS
// =============================================================================

const getDatePresets = (): DatePreset[] => {
  const now = dayjs()
  
  return [
    {
      label: 'Bugün',
      value: 'today',
      startDate: now.startOf('day'),
      endDate: now.endOf('day'),
      description: 'Bugünün verileri',
      color: 'blue'
    },
    {
      label: 'Dün',
      value: 'yesterday',
      startDate: now.subtract(1, 'day').startOf('day'),
      endDate: now.subtract(1, 'day').endOf('day'),
      description: 'Dünün verileri',
      color: 'cyan'
    },
    {
      label: 'Bu Hafta',
      value: 'this-week',
      startDate: now.startOf('week'),
      endDate: now.endOf('week'),
      description: 'Pazartesi - Pazar',
      color: 'green'
    },
    {
      label: 'Geçen Hafta',
      value: 'last-week',
      startDate: now.subtract(1, 'week').startOf('week'),
      endDate: now.subtract(1, 'week').endOf('week'),
      description: 'Önceki hafta',
      color: 'lime'
    },
    {
      label: 'Bu Ay',
      value: 'this-month',
      startDate: now.startOf('month'),
      endDate: now.endOf('month'),
      description: 'Ayın ilk gününden bugüne',
      color: 'orange'
    },
    {
      label: 'Geçen Ay',
      value: 'last-month',
      startDate: now.subtract(1, 'month').startOf('month'),
      endDate: now.subtract(1, 'month').endOf('month'),
      description: 'Önceki ayın tamamı',
      color: 'gold'
    },
    {
      label: 'Son 7 Gün',
      value: 'last-7-days',
      startDate: now.subtract(7, 'day').startOf('day'),
      endDate: now.endOf('day'),
      description: '7 gün öncesinden bugüne',
      color: 'purple'
    },
    {
      label: 'Son 30 Gün',
      value: 'last-30-days',
      startDate: now.subtract(30, 'day').startOf('day'),
      endDate: now.endOf('day'),
      description: '30 gün öncesinden bugüne',
      color: 'magenta'
    },
    {
      label: 'Son 90 Gün',
      value: 'last-90-days',
      startDate: now.subtract(90, 'day').startOf('day'),
      endDate: now.endOf('day'),
      description: '3 ay öncesinden bugüne',
      color: 'red'
    },
    {
      label: 'Bu Çeyrek',
      value: 'this-quarter',
      startDate: now.startOf('quarter' as any),
      endDate: now.endOf('quarter' as any),
      description: 'Çeyrek yıl başından bugüne',
      color: 'volcano'
    },
    {
      label: 'Bu Yıl',
      value: 'this-year',
      startDate: now.startOf('year'),
      endDate: now.endOf('year'),
      description: 'Yıl başından bugüne',
      color: 'geekblue'
    }
  ]
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  disabled = false,
  showPresets = true,
  showRelativeDescription = true,
  maxDays = 365
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('')
  const [customRange, setCustomRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [validationError, setValidationError] = useState<string>('')

  const datePresets = getDatePresets()

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    // Initialize from existing value
    if (value?.startDate && value?.endDate) {
      const startDate = dayjs(value.startDate)
      const endDate = dayjs(value.endDate)
      
      // Check if matches any preset
      const matchingPreset = datePresets.find(preset => 
        preset.startDate.isSame(startDate, 'day') && 
        preset.endDate.isSame(endDate, 'day')
      )
      
      if (matchingPreset) {
        setSelectedPreset(matchingPreset.value)
        setShowCustomPicker(false)
      } else {
        setCustomRange([startDate, endDate])
        setShowCustomPicker(true)
        setSelectedPreset('custom')
      }
    }
  }, [value?.startDate, value?.endDate])

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handlePresetChange = (presetValue: string) => {
    setValidationError('')
    
    if (presetValue === 'custom') {
      setShowCustomPicker(true)
      setSelectedPreset('custom')
      return
    }

    const preset = datePresets.find(p => p.value === presetValue)
    if (!preset) return

    // Validate date range
    const dayDiff = preset.endDate.diff(preset.startDate, 'day')
    if (dayDiff > maxDays) {
      setValidationError(`Maksimum ${maxDays} günlük aralık seçilebilir`)
      return
    }

    setSelectedPreset(presetValue)
    setShowCustomPicker(false)
    setCustomRange(null)

    // Emit change
    const filters: Partial<ReportFilter> = {
      startDate: preset.startDate.format('YYYY-MM-DD'),
      endDate: preset.endDate.format('YYYY-MM-DD'),
      dateRange: {
        startDate: preset.startDate.format('YYYY-MM-DD'),
        endDate: preset.endDate.format('YYYY-MM-DD')
      }
    }

    onChange?.(filters)
  }

  const handleCustomRangeChange = (
    dates: [Dayjs | null, Dayjs | null] | null,
    dateStrings: [string, string]
  ) => {
    setValidationError('')
    
    if (!dates || !dates[0] || !dates[1]) {
      setCustomRange(null)
      return
    }

    const [startDate, endDate] = dates as [Dayjs, Dayjs]

    // Validate date range
    const dayDiff = endDate.diff(startDate, 'day')
    if (dayDiff > maxDays) {
      setValidationError(`Maksimum ${maxDays} günlük aralık seçilebilir`)
      return
    }

    if (startDate.isAfter(dayjs())) {
      setValidationError('Başlangıç tarihi gelecekte olamaz')
      return
    }

    setCustomRange([startDate, endDate])

    // Emit change
    const filters: Partial<ReportFilter> = {
      startDate: startDate.format('YYYY-MM-DD'),
      endDate: endDate.format('YYYY-MM-DD'),
      dateRange: {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD')
      }
    }

    onChange?.(filters)
  }

  const handleClearSelection = () => {
    setSelectedPreset('')
    setCustomRange(null)
    setShowCustomPicker(false)
    setValidationError('')
    onChange?.({})
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderPresetOptions = () => {
    return datePresets.map(preset => (
      <Option key={preset.value} value={preset.value}>
        <Space>
          <Tag color={preset.color} style={{ margin: 0 }}>
            {preset.label}
          </Tag>
          {showRelativeDescription && (
            <span style={{ color: '#666', fontSize: '12px' }}>
              {preset.description}
            </span>
          )}
        </Space>
      </Option>
    ))
  }

  const renderCurrentSelection = () => {
    if (!selectedPreset && !customRange) return null

    let displayText = ''
    let color = 'default'
    let icon = <CalendarOutlined />

    if (selectedPreset && selectedPreset !== 'custom') {
      const preset = datePresets.find(p => p.value === selectedPreset)
      if (preset) {
        displayText = `${preset.label} (${preset.description})`
        color = preset.color
      }
    } else if (customRange) {
      const [start, end] = customRange
      displayText = `${start.format('DD.MM.YYYY')} - ${end.format('DD.MM.YYYY')}`
      color = 'blue'
      icon = <ClockCircleOutlined />
      
      const dayDiff = end.diff(start, 'day') + 1
      displayText += ` (${dayDiff} gün)`
    }

    return (
      <div style={{ marginTop: 8 }}>
        <Tag 
          icon={icon}
          color={color}
          closable
          onClose={handleClearSelection}
          style={{ fontSize: '13px', padding: '4px 8px' }}
        >
          {displayText}
        </Tag>
      </div>
    )
  }

  const renderPerformanceWarning = () => {
    let warningMessage = ''
    let warningType: 'warning' | 'error' = 'warning'

    if (selectedPreset === 'this-year' || selectedPreset === 'last-90-days') {
      warningMessage = 'Büyük tarih aralığı seçildi. Raporların yüklenmesi uzun sürebilir.'
    } else if (customRange) {
      const dayDiff = customRange[1].diff(customRange[0], 'day') + 1
      if (dayDiff > 90) {
        warningMessage = `${dayDiff} günlük aralık seçildi. Performans etkilenebilir.`
        warningType = 'error'
      } else if (dayDiff > 30) {
        warningMessage = `${dayDiff} günlük aralık seçildi. Yükleme süresi artabilir.`
      }
    }

    if (!warningMessage) return null

    return (
      <Alert
        message={warningMessage}
        type={warningType}
        icon={<WarningOutlined />}
        showIcon
        style={{ marginTop: 8, fontSize: '12px' }}
        action={
          warningType === 'error' ? (
            <Button size="small" onClick={handleClearSelection}>
              Temizle
            </Button>
          ) : undefined
        }
      />
    )
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <Card
      title="Tarih Aralığı"
      size="small"
      extra={
        <Tooltip title="Rapor tarih aralığını seçin">
          <CalendarOutlined />
        </Tooltip>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {/* Preset Selection */}
        {showPresets && (
          <Select
            placeholder="Hızlı tarih seçimi"
            value={selectedPreset || undefined}
            onChange={handlePresetChange}
            disabled={disabled}
            style={{ width: '100%' }}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {renderPresetOptions()}
            <Option value="custom">
              <Space>
                <Tag color="default">Özel Aralık</Tag>
                <span style={{ color: '#666', fontSize: '12px' }}>
                  Kendiniz belirleyin
                </span>
              </Space>
            </Option>
          </Select>
        )}

        {/* Custom Date Range Picker */}
        {showCustomPicker && (
          <RangePicker
            value={customRange}
            onChange={handleCustomRangeChange}
            disabled={disabled}
            style={{ width: '100%' }}
            format="DD.MM.YYYY"
            placeholder={['Başlangıç', 'Bitiş']}
            allowClear
            disabledDate={(current) => {
              // Gelecek tarihleri devre dışı bırak
              return current && current.isAfter(dayjs().endOf('day'))
            }}
          />
        )}

        {/* Validation Error */}
        {validationError && (
          <Alert
            message={validationError}
            type="error"
            showIcon
            style={{ fontSize: '12px' }}
          />
        )}

        {/* Current Selection Display */}
        {renderCurrentSelection()}

        {/* Performance Warning */}
        {renderPerformanceWarning()}

        {/* Quick Actions */}
        <Space>
          <Button 
            size="small" 
            onClick={() => handlePresetChange('last-7-days')}
            disabled={disabled}
          >
            Son 7 Gün
          </Button>
          <Button 
            size="small" 
            onClick={() => handlePresetChange('this-month')}
            disabled={disabled}
          >
            Bu Ay
          </Button>
          {(selectedPreset || customRange) && (
            <Button 
              size="small" 
              onClick={handleClearSelection}
              disabled={disabled}
            >
              Temizle
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  )
}

export default DateRangeFilter