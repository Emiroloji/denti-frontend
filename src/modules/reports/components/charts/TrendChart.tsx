// src/modules/reports/components/charts/TrendChart.tsx

import React, { useState, useMemo } from 'react'
import { 
  Card, 
  Select, 
  Space, 
  Button, 
  Statistic, 
  Alert, 
  Spin, 
  Switch, 
  Tooltip
} from 'antd'
import { 
  LineChartOutlined, 
  AreaChartOutlined, 
  RiseOutlined,
  FallOutlined,
  SyncOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import {
  LineChart,
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import { useStockTrendAnalysis } from '../../hooks/useStockReports'
import type { ReportFilter } from '../../types/reports.types'

const { Option } = Select

// =============================================================================
// INTERFACES
// =============================================================================

interface TrendChartProps {
  filters?: ReportFilter
  height?: number
  showControls?: boolean
  showForecast?: boolean
  showKPIs?: boolean
}

type ChartType = 'line' | 'area' | 'combined'
type TimeRange = 'daily' | 'weekly' | 'monthly' | 'quarterly'

// =============================================================================
// CONSTANTS
// =============================================================================

const CHART_TYPES = [
  { key: 'line', label: 'Çizgi Grafik', icon: <LineChartOutlined /> },
  { key: 'area', label: 'Alan Grafik', icon: <AreaChartOutlined /> },
  { key: 'combined', label: 'Karma Grafik', icon: <LineChartOutlined /> }
]

const TIME_RANGES = [
  { key: 'daily', label: 'Günlük', description: 'Günlük trend analizi' },
  { key: 'weekly', label: 'Haftalık', description: 'Haftalık ortalamalar' },
  { key: 'monthly', label: 'Aylık', description: 'Aylık toplam değerler' },
  { key: 'quarterly', label: 'Çeyreklik', description: 'Çeyrek yıllık analiz' }
]

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const TrendChart: React.FC<TrendChartProps> = ({
  filters,
  height = 400,
  showControls = true,
  showForecast = true,
  showKPIs = true
}) => {
  const [chartType, setChartType] = useState<ChartType>('line')
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly')
  const [showForecastData, setShowForecastData] = useState(showForecast)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch data
  const { data: trendData, isLoading, error, refetch } = useStockTrendAnalysis(filters)

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const chartData = useMemo(() => {
    if (!trendData) return []

    const combinedData = trendData.trends.map((trend, index) => {
      const forecast = trendData.forecasts[index]
      return {
        ...trend,
        actualValue: trend.value,
        forecastValue: forecast?.value || null,
        isForecast: false
      }
    })

    if (showForecastData) {
      const forecastData = trendData.forecasts.map(forecast => ({
        ...forecast,
        actualValue: null,
        forecastValue: forecast.value,
        isForecast: true
      }))
      
      return [...combinedData, ...forecastData]
    }

    return combinedData
  }, [trendData, showForecastData])

  const trendIndicators = useMemo(() => {
    if (!trendData?.indicators) return null

    const { direction, percentage, recommendation } = trendData.indicators

    return {
      direction,
      percentage: Math.abs(percentage),
      isPositive: direction === 'up',
      isNegative: direction === 'down',
      isStable: direction === 'stable',
      recommendation,
      color: direction === 'up' ? '#52c41a' : direction === 'down' ? '#f5222d' : '#faad14'
    }
  }, [trendData])

  // Düzeltilmiş KPI hesaplaması
  const kpiMetrics = useMemo(() => {
    if (!chartData.length) return null

    const actualData = chartData.filter(item => !item.isForecast && item.actualValue !== null)
    const values = actualData.map(item => item.actualValue).filter((val): val is number => val !== null)
    
    if (values.length === 0) return null

    const total = values.reduce((sum, val) => sum + val, 0)
    const average = total / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    const latest = values[values.length - 1] || 0
    const previous = values[values.length - 2] || latest
    const change = latest - previous
    const changePercent = previous > 0 ? (change / previous) * 100 : 0

    return {
      total: Math.round(total),
      average: Math.round(average * 10) / 10,
      min,
      max,
      latest,
      change: Math.round(change * 10) / 10,
      changePercent: Math.round(changePercent * 10) / 10,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    }
  }, [chartData])

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

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <RechartsTooltip 
          formatter={(value: number, name: string) => [
            `${value} adet`,
            name === 'actualValue' ? 'Gerçek Değer' : 'Tahmin'
          ]}
          labelFormatter={(label) => `Tarih: ${label}`}
        />
        <Legend />
        
        {/* Actual data line */}
        <Line
          type="monotone"
          dataKey="actualValue"
          stroke="#1890ff"
          strokeWidth={2}
          dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
          name="Gerçek Değer"
          connectNulls={false}
        />
        
        {/* Forecast line */}
        {showForecastData && (
          <Line
            type="monotone"
            dataKey="forecastValue"
            stroke="#faad14"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#faad14', strokeWidth: 2, r: 4 }}
            name="Tahmin"
            connectNulls={false}
          />
        )}
        
        {/* Trend line */}
        {kpiMetrics && (
          <ReferenceLine 
            y={kpiMetrics.average} 
            stroke="#52c41a" 
            strokeDasharray="3 3"
            label="Ortalama"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="label" />
        <YAxis />
        <RechartsTooltip 
          formatter={(value: number, name: string) => [
            `${value} adet`,
            name === 'actualValue' ? 'Gerçek Değer' : 'Tahmin'
          ]}
        />
        <Legend />
        
        <Area
          type="monotone"
          dataKey="actualValue"
          stroke="#1890ff"
          fill="#1890ff"
          fillOpacity={0.3}
          name="Gerçek Değer"
        />
        
        {showForecastData && (
          <Area
            type="monotone"
            dataKey="forecastValue"
            stroke="#faad14"
            fill="#faad14"
            fillOpacity={0.2}
            strokeDasharray="5 5"
            name="Tahmin"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return renderLineChart()
      case 'area':
        return renderAreaChart()
      case 'combined':
        return renderLineChart() // Combined will be line with areas
      default:
        return renderLineChart()
    }
  }

  const renderTrendOverview = () => {
    if (!trendIndicators || !showKPIs) return null

    return (
      <div style={{ marginBottom: 16 }}>
        <Space size="large">
          <Statistic
            title="Trend Yönü"
            value={trendIndicators.percentage}
            suffix="%"
            prefix={
              trendIndicators.isPositive ? (
                <RiseOutlined style={{ color: '#52c41a' }} />
              ) : trendIndicators.isNegative ? (
                <FallOutlined style={{ color: '#f5222d' }} />
              ) : (
                <InfoCircleOutlined style={{ color: '#faad14' }} />
              )
            }
            valueStyle={{ color: trendIndicators.color }}
          />
          
          {kpiMetrics && (
            <>
              <Statistic
                title="Son Değer"
                value={kpiMetrics.latest || 0}
                suffix="adet"
                valueStyle={{ fontSize: '18px' }}
              />
              
              <Statistic
                title="Değişim"
                value={kpiMetrics.change}
                suffix={kpiMetrics.changePercent > 0 ? `(+${kpiMetrics.changePercent}%)` : `(${kpiMetrics.changePercent}%)`}
                prefix={
                  kpiMetrics.trend === 'up' ? (
                    <RiseOutlined style={{ color: '#52c41a' }} />
                  ) : kpiMetrics.trend === 'down' ? (
                    <FallOutlined style={{ color: '#f5222d' }} />
                  ) : null
                }
                valueStyle={{ 
                  color: kpiMetrics.trend === 'up' ? '#52c41a' : 
                         kpiMetrics.trend === 'down' ? '#f5222d' : 'inherit'
                }}
              />
              
              <Statistic
                title="Ortalama"
                value={kpiMetrics.average}
                suffix="adet"
              />
            </>
          )}
        </Space>
        
        {trendIndicators.recommendation && (
          <Alert
            message="Trend Önerisi"
            description={trendIndicators.recommendation}
            type="info"
            showIcon
            style={{ marginTop: 12 }}
          />
        )}
      </div>
    )
  }

  const renderControls = () => {
    if (!showControls) return null

    return (
      <Space>
        <Select
          value={chartType}
          onChange={setChartType}
          style={{ width: 120 }}
        >
          {CHART_TYPES.map(type => (
            <Option key={type.key} value={type.key}>
              <Space size="small">
                {type.icon}
                {type.label}
              </Space>
            </Option>
          ))}
        </Select>

        <Select
          value={timeRange}
          onChange={setTimeRange}
          style={{ width: 100 }}
        >
          {TIME_RANGES.map(range => (
            <Option key={range.key} value={range.key}>
              {range.label}
            </Option>
          ))}
        </Select>

        <Tooltip title="Tahmin verilerini göster/gizle">
          <Space>
            <span>Tahmin:</span>
            <Switch
              checked={showForecastData}
              onChange={setShowForecastData}
              size="small"
            />
          </Space>
        </Tooltip>

        <Button
          icon={<SyncOutlined spin={isRefreshing} />}
          onClick={handleRefresh}
          loading={isRefreshing}
        >
          Yenile
        </Button>
      </Space>
    )
  }

  // =============================================================================
  // RENDER
  // =============================================================================

  if (error) {
    return (
      <Alert
        message="Trend verileri yüklenemedi"
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
      title="Trend Analizi"
      extra={renderControls()}
      loading={isLoading}
    >
      {chartData.length === 0 ? (
        <Alert
          message="Trend verisi bulunamadı"
          description="Seçili filtrelere uygun trend verisi bulunamadı."
          type="info"
          showIcon
        />
      ) : (
        <>
          {renderTrendOverview()}
          <Spin spinning={isLoading}>
            {renderChart()}
          </Spin>
        </>
      )}
    </Card>
  )
}

export default TrendChart