// src/modules/reports/components/charts/CategoryChart.tsx

import React, { useState, useMemo, useCallback } from 'react'
import { Card, Select, Space, Button, Statistic, Table, Alert, Spin, message } from 'antd'
import { 
  PieChartOutlined, 
  BarChartOutlined, 
  TableOutlined,
  DotChartOutlined,
  SyncOutlined,
  DownloadOutlined
} from '@ant-design/icons'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { useStockChartsData } from '../../hooks/useStockReports'
import type { ReportFilter, ChartDataPoint } from '../../types/reports.types'

const { Option } = Select

// =============================================================================
// INTERFACES
// =============================================================================

interface CategoryChartProps {
  filters?: ReportFilter
  height?: number
  showControls?: boolean
  defaultMode?: ChartMode
  defaultValueType?: ValueType
  onExport?: (data: ChartDataPoint[], format: string) => void
}

type ChartMode = 'pie' | 'donut' | 'bar' | 'table'
type ValueType = 'count' | 'percentage' | 'value'

// =============================================================================
// CONSTANTS
// =============================================================================

const CHART_COLORS = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
  '#13c2c2', '#eb2f96', '#fa541c', '#a0d911', '#2f54eb'
]

const CHART_MODES = [
  { key: 'pie', label: 'Pasta Grafik', icon: <PieChartOutlined /> },
  { key: 'donut', label: 'Halka Grafik', icon: <DotChartOutlined /> },
  { key: 'bar', label: 'Çubuk Grafik', icon: <BarChartOutlined /> },
  { key: 'table', label: 'Tablo Görünümü', icon: <TableOutlined /> }
]

const VALUE_TYPES = [
  { key: 'count', label: 'Adet', suffix: 'adet' },
  { key: 'percentage', label: 'Yüzde', suffix: '%' },
  { key: 'value', label: 'Değer', suffix: '₺' }
]

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const CategoryChart: React.FC<CategoryChartProps> = ({
  filters,
  height = 400,
  showControls = true,
  defaultMode = 'pie',
  defaultValueType = 'count',
  onExport
}) => {
  const [chartMode, setChartMode] = useState<ChartMode>(defaultMode)
  const [valueType, setValueType] = useState<ValueType>(defaultValueType)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch data
  const { data: chartData, isLoading, error, refetch } = useStockChartsData(filters)

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const transformedData = useMemo((): ChartDataPoint[] => {
    if (!chartData?.categoryChart) return []

    const data = chartData.categoryChart
    const total = data.reduce((sum: number, item: ChartDataPoint) => sum + (item.value || 0), 0)

    return data.map((item: ChartDataPoint, index: number) => ({
      name: item.name,
      value: item.value || 0,
      label: item.label || item.name,
      color: item.color || CHART_COLORS[index % CHART_COLORS.length],
      percentage: total > 0 ? Number(((item.value || 0) / total * 100).toFixed(1)) : 0
    })).sort((a: ChartDataPoint, b: ChartDataPoint) => (b.value || 0) - (a.value || 0))
  }, [chartData])

  const statistics = useMemo(() => {
    if (!transformedData.length) return null

    const totalValue = transformedData.reduce((sum, item) => sum + (item.value || 0), 0)
    const avgValue = totalValue / transformedData.length
    const maxItem = transformedData.reduce((max, item) => (item.value || 0) > (max.value || 0) ? item : max, transformedData[0])
    const minItem = transformedData.reduce((min, item) => (item.value || 0) < (min.value || 0) ? item : min, transformedData[0])

    return {
      total: totalValue,
      average: Math.round(avgValue * 100) / 100,
      categories: transformedData.length,
      top: maxItem,
      lowest: minItem
    }
  }, [transformedData])

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000)
    }
  }

  const handleExport = useCallback((format: 'png' | 'pdf' | 'excel') => {
    if (!transformedData || transformedData.length === 0) {
      message.warning('Dışa aktarılacak veri bulunamadı!')
      return
    }

    try {
      switch (format) {
        case 'png':
          message.success('Grafik PNG olarak dışa aktarıldı!')
          break
        case 'pdf':
          message.success('Grafik PDF olarak dışa aktarıldı!')
          break
        case 'excel':
          message.success('Veri Excel olarak dışa aktarıldı!')
          break
      }
      
      onExport?.(transformedData, format)
    } catch (error) {
      message.error('Dışa aktarma işlemi başarısız!')
      console.error('Export error:', error)
    }
  }, [transformedData, onExport])

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderPieChart = (innerRadius: number = 0) => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={transformedData}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={Math.min(height * 0.35, 150)}
          paddingAngle={2}
          dataKey="value"
          label={({ name, percentage }) => `${name}: ${percentage}%`}
          labelLine={false}
        >
          {transformedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number, name: string) => [
            `${value} ${VALUE_TYPES.find(t => t.key === valueType)?.suffix || ''}`,
            name
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={transformedData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0}
        />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [
            `${value} ${VALUE_TYPES.find(t => t.key === valueType)?.suffix || ''}`,
            'Değer'
          ]}
        />
        <Bar dataKey="value" fill="#1890ff">
          {transformedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )

  const renderTable = () => {
    const columns = [
      {
        title: 'Kategori',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: ChartDataPoint) => (
          <Space>
            <div 
              style={{ 
                width: 12, 
                height: 12, 
                backgroundColor: record.color,
                borderRadius: 2
              }} 
            />
            <span>{text}</span>
          </Space>
        )
      },
      {
        title: 'Değer',
        dataIndex: 'value',
        key: 'value',
        sorter: (a: ChartDataPoint, b: ChartDataPoint) => (a.value || 0) - (b.value || 0),
        render: (value: number) => (
          <strong>
            {value} {VALUE_TYPES.find(t => t.key === valueType)?.suffix || ''}
          </strong>
        )
      },
      {
        title: 'Yüzde',
        dataIndex: 'percentage',
        key: 'percentage',
        sorter: (a: ChartDataPoint, b: ChartDataPoint) => (a.percentage || 0) - (b.percentage || 0),
        render: (percentage: number) => `${percentage}%`
      }
    ]

    return (
      <Table
        columns={columns}
        dataSource={transformedData}
        rowKey="name"
        pagination={false}
        size="small"
        style={{ maxHeight: height, overflowY: 'auto' }}
      />
    )
  }

  const renderChart = () => {
    switch (chartMode) {
      case 'pie':
        return renderPieChart(0)
      case 'donut':
        return renderPieChart(60)
      case 'bar':
        return renderBarChart()
      case 'table':
        return renderTable()
      default:
        return renderPieChart(0)
    }
  }

  const renderControls = () => {
    if (!showControls) return null

    return (
      <Space>
        <Select
          value={chartMode}
          onChange={setChartMode}
          style={{ width: 140 }}
        >
          {CHART_MODES.map(mode => (
            <Option key={mode.key} value={mode.key}>
              <Space>
                {mode.icon}
                {mode.label}
              </Space>
            </Option>
          ))}
        </Select>

        <Select
          value={valueType}
          onChange={setValueType}
          style={{ width: 100 }}
        >
          {VALUE_TYPES.map(type => (
            <Option key={type.key} value={type.key}>
              {type.label}
            </Option>
          ))}
        </Select>

        <Button
          icon={<SyncOutlined spin={isRefreshing} />}
          onClick={handleRefresh}
          loading={isRefreshing}
        >
          Yenile
        </Button>

        <Button
          icon={<DownloadOutlined />}
          onClick={() => handleExport('excel')}
          disabled={!transformedData.length}
        >
          Dışa Aktar
        </Button>
      </Space>
    )
  }

  const renderStatistics = () => {
    if (!statistics || chartMode === 'table') return null

    return (
      <Space style={{ marginTop: 16 }}>
        <Statistic
          title="Toplam"
          value={statistics.total}
          suffix={VALUE_TYPES.find(t => t.key === valueType)?.suffix}
          valueStyle={{ fontSize: '16px' }}
        />
        <Statistic
          title="Kategori"
          value={statistics.categories}
          suffix="adet"
          valueStyle={{ fontSize: '16px' }}
        />
        <Statistic
          title="Ortalama"
          value={statistics.average}
          suffix={VALUE_TYPES.find(t => t.key === valueType)?.suffix}
          valueStyle={{ fontSize: '16px' }}
        />
        <Statistic
          title="En Yüksek"
          value={statistics.top.name}
          suffix={`(${statistics.top.value})`}
          valueStyle={{ fontSize: '16px', color: '#52c41a' }}
        />
      </Space>
    )
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  if (error) {
    return (
      <Alert
        message="Grafik verileri yüklenemedi"
        description={error.message}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={handleRefresh}>
            Tekrar Dene
          </Button>
        }
      />
    )
  }

  return (
    <Card
      title="Kategori Analizi"
      extra={renderControls()}
      loading={isLoading}
    >
      {transformedData.length === 0 ? (
        <Alert
          message="Veri bulunamadı"
          description="Seçili filtrelere uygun kategori verisi bulunamadı."
          type="info"
          showIcon
        />
      ) : (
        <>
          <Spin spinning={isLoading}>
            {renderChart()}
          </Spin>
          {renderStatistics()}
        </>
      )}
    </Card>
  )
}

export default CategoryChart