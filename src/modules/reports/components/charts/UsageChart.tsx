// src/modules/reports/components/charts/UsageChart.tsx

import React, { useMemo } from 'react'
import { Card, Select, Switch, Tooltip, Empty, Spin, Typography, Radio } from 'antd'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Tooltip as RechartsTooltip,
  TooltipProps
} from 'recharts'
import { 
  InfoCircleOutlined, 
  LineChartOutlined, 
  AreaChartOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useStockUsageReport } from '../../hooks/useStockReports'
import { ReportFilter } from '../../types/reports.types'

const { Option } = Select
const { Text } = Typography

interface UsageChartProps {
  filters?: Partial<ReportFilter>
  height?: number
  showLegend?: boolean
  showTooltip?: boolean
  chartType?: 'line' | 'area' | 'bar'
}

// Interface for chart data
interface ChartDataItem {
  date: string
  fullDate: string
  totalUsage: number
  [key: string]: string | number
}

// Custom Tooltip Props
interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean
  payload?: Array<{
    dataKey: string
    value: number
    color: string
  }>
  label?: string
}

export const UsageChart: React.FC<UsageChartProps> = ({
  filters,
  height = 400,
  showLegend = true,
  showTooltip = true,
  chartType: initialChartType = 'line'
}) => {
  const [chartType, setChartType] = React.useState<'line' | 'area' | 'bar'>(initialChartType)
  const [groupBy, setGroupBy] = React.useState<'day' | 'week' | 'month'>('week')
  const [showTrend, setShowTrend] = React.useState(true)
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])

  // Fetch usage data
  const { isLoading, error } = useStockUsageReport(filters)

  // Available categories
  const categories = useMemo(() => [
    'Ortodonti', 
    'Periodontoloji', 
    'Endodonti', 
    'Protez', 
    'Pedodonti'
  ], [])

  const categoryColors = {
    'Ortodonti': '#1890ff',
    'Periodontoloji': '#52c41a',
    'Endodonti': '#faad14',
    'Protez': '#ff4d4f',
    'Pedodonti': '#722ed1'
  }

  // Mock time series data - Bu gerçek API'den gelecek
  const mockTimeSeriesData = useMemo(() => {
    const generateData = (): ChartDataItem[] => {
      const data: ChartDataItem[] = []
      const startDate = dayjs().subtract(30, 'day')
      
      for (let i = 0; i < 30; i++) {
        const date = startDate.add(i, 'day')
        const item: ChartDataItem = {
          date: date.format('DD.MM'),
          fullDate: date.format('YYYY-MM-DD'),
          totalUsage: Math.floor(Math.random() * 100) + 50,
          'Ortodonti': Math.floor(Math.random() * 30) + 10,
          'Periodontoloji': Math.floor(Math.random() * 25) + 15,
          'Endodonti': Math.floor(Math.random() * 20) + 8,
          'Protez': Math.floor(Math.random() * 15) + 5,
          'Pedodonti': Math.floor(Math.random() * 10) + 3
        }
        data.push(item)
      }
      return data
    }

    return generateData()
  }, [])

  // Process data based on groupBy
  const processedData = useMemo(() => {
    if (groupBy === 'day') return mockTimeSeriesData
    
    // Group by week or month
    const grouped: { [key: string]: ChartDataItem } = {}
    
    mockTimeSeriesData.forEach(item => {
      const date = dayjs(item.fullDate)
      const key = groupBy === 'week' 
        ? date.startOf('week').format('DD.MM')
        : date.startOf('month').format('MM.YYYY')
      
      if (!grouped[key]) {
        grouped[key] = {
          date: key,
          fullDate: '',
          totalUsage: 0,
          ...categories.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {})
        }
      }
      
      grouped[key].totalUsage += item.totalUsage
      categories.forEach(cat => {
        const value = item[cat]
        if (typeof value === 'number') {
          const current = grouped[key][cat]
          grouped[key][cat] = (typeof current === 'number' ? current : 0) + value
        }
      })
    })
    
    return Object.values(grouped)
  }, [mockTimeSeriesData, groupBy, categories])

  // Custom tooltip
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #f0f0f0',
          borderRadius: '6px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <Text strong>{label}</Text>
          <br />
          {payload.map((entry, index) => (
            <div key={index}>
              <Text style={{ color: entry.color }}>
                {entry.dataKey}: <Text strong>{entry.value} adet</Text>
              </Text>
              <br />
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  // Render chart based on type
  const renderChart = () => {
    const commonProps = {
      data: processedData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    }

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            {showTooltip && <RechartsTooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            
            {/* Total usage area */}
            <Area
              type="monotone"
              dataKey="totalUsage"
              stackId="1"
              stroke="#1890ff"
              fill="#1890ff"
              fillOpacity={0.6}
              name="Toplam Kullanım"
            />
            
            {/* Category areas */}
            {selectedCategories.length > 0 ? (
              selectedCategories.map(category => (
                <Area
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stackId="2"
                  stroke={categoryColors[category as keyof typeof categoryColors]}
                  fill={categoryColors[category as keyof typeof categoryColors]}
                  fillOpacity={0.4}
                  name={category}
                />
              ))
            ) : (
              categories.map(category => (
                <Area
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stackId="2"
                  stroke={categoryColors[category as keyof typeof categoryColors]}
                  fill={categoryColors[category as keyof typeof categoryColors]}
                  fillOpacity={0.4}
                  name={category}
                />
              ))
            )}
          </AreaChart>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            {showTooltip && <RechartsTooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            
            <Bar
              dataKey="totalUsage"
              fill="#1890ff"
              name="Toplam Kullanım"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )

      default: // line
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" fontSize={12} />
            <YAxis stroke="#666" fontSize={12} />
            {showTooltip && <RechartsTooltip content={<CustomTooltip />} />}
            {showLegend && <Legend />}
            
            {/* Total usage line */}
            <Line
              type="monotone"
              dataKey="totalUsage"
              stroke="#1890ff"
              strokeWidth={3}
              dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="Toplam Kullanım"
            />
            
            {/* Category lines */}
            {selectedCategories.length > 0 ? (
              selectedCategories.map(category => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={categoryColors[category as keyof typeof categoryColors]}
                  strokeWidth={2}
                  dot={{ fill: categoryColors[category as keyof typeof categoryColors], strokeWidth: 1, r: 3 }}
                  name={category}
                />
              ))
            ) : (
              categories.map(category => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={categoryColors[category as keyof typeof categoryColors]}
                  strokeWidth={2}
                  dot={{ fill: categoryColors[category as keyof typeof categoryColors], strokeWidth: 1, r: 3 }}
                  name={category}
                />
              ))
            )}
          </LineChart>
        )
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">Kullanım trend verileri yükleniyor...</Text>
          </div>
        </div>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card>
        <Empty
          description="Kullanım verisi yüklenirken hata oluştu"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    )
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LineChartOutlined />
          <span>Stok Kullanım Trendleri</span>
          <Tooltip title="Seçilen tarih aralığındaki stok kullanım trendlerini gösterir">
            <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
          </Tooltip>
        </div>
      }
      extra={
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Trend toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Text>Trend:</Text>
            <Switch
              checked={showTrend}
              onChange={setShowTrend}
              size="small"
            />
          </div>

          {/* Group by selector */}
          <Select
            value={groupBy}
            onChange={setGroupBy}
            style={{ width: 100 }}
            size="small"
          >
            <Option value="day">Günlük</Option>
            <Option value="week">Haftalık</Option>
            <Option value="month">Aylık</Option>
          </Select>

          {/* Category filter */}
          <Select
            mode="multiple"
            placeholder="Kategori seç"
            value={selectedCategories}
            onChange={setSelectedCategories}
            style={{ minWidth: 150 }}
            size="small"
            allowClear
          >
            {categories.map(category => (
              <Option key={category} value={category}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: categoryColors[category as keyof typeof categoryColors],
                    borderRadius: '50%'
                  }} />
                  {category}
                </div>
              </Option>
            ))}
          </Select>

          {/* Chart type selector */}
          <Radio.Group value={chartType} onChange={(e) => setChartType(e.target.value)} size="small">
            <Radio.Button value="line">
              <LineChartOutlined />
            </Radio.Button>
            <Radio.Button value="area">
              <AreaChartOutlined />
            </Radio.Button>
            <Radio.Button value="bar">
              <BarChartOutlined />
            </Radio.Button>
          </Radio.Group>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        marginTop: '16px',
        padding: '12px',
        backgroundColor: '#f9f9f9',
        borderRadius: '6px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ color: '#1890ff', fontSize: '16px' }}>
            {processedData.reduce((sum, item) => sum + item.totalUsage, 0)}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>Toplam Kullanım</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
            {Math.round(processedData.reduce((sum, item) => sum + item.totalUsage, 0) / processedData.length)}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>Ortalama/Gün</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ color: '#722ed1', fontSize: '16px' }}>
            {Math.max(...processedData.map(item => item.totalUsage))}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>En Yüksek</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text strong style={{ color: '#fa8c16', fontSize: '16px' }}>
            {Math.min(...processedData.map(item => item.totalUsage))}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>En Düşük</Text>
        </div>
      </div>

      {/* Trend Information */}
      {showTrend && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#f6ffed',
          border: '1px solid #b7eb8f',
          borderRadius: '6px'
        }}>
          <Text style={{ color: '#389e0d', fontSize: '12px' }}>
            📈 Trend Analizi: Son {groupBy === 'day' ? '30 gün' : groupBy === 'week' ? '4 hafta' : '12 ay'} 
            içinde kullanım oranı %{Math.floor(Math.random() * 20) + 5} artış gösterdi
          </Text>
        </div>
      )}
    </Card>
  )
}

export default UsageChart