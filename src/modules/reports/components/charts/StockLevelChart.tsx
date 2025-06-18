// src/modules/reports/components/charts/StockLevelChart.tsx

import React from 'react'
import { Card, Row, Col, Statistic, Spin, Empty, Typography, Space, Tag, Tooltip } from 'antd'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  StopOutlined
} from '@ant-design/icons'
import { useStockReports } from '../../hooks/useStockReports'
import type { ReportFilter } from '../../types/reports.types'

const { Title, Text } = Typography

// Chart renkleri
const STOCK_COLORS = {
  normal: '#52c41a',    // Yeşil - Normal stok
  low: '#faad14',       // Sarı - Düşük stok
  critical: '#ff4d4f',  // Kırmızı - Kritik stok
  outOfStock: '#8c8c8c' // Gri - Stok bitti
}

// İkon mapping
const STOCK_ICONS = {
  normal: <CheckCircleOutlined style={{ color: STOCK_COLORS.normal }} />,
  low: <WarningOutlined style={{ color: STOCK_COLORS.low }} />,
  critical: <WarningOutlined style={{ color: STOCK_COLORS.critical }} />,
  outOfStock: <StopOutlined style={{ color: STOCK_COLORS.outOfStock }} />
}

interface StockLevelChartProps {
  filters?: ReportFilter
  height?: number
  showDetailedView?: boolean
  title?: string
  className?: string
}

interface ChartDataItem {
  name: string
  value: number
  color: string
  percentage: number
}

export const StockLevelChart: React.FC<StockLevelChartProps> = ({
  filters,
  height = 400,
  showDetailedView = true,
  title = "Stok Seviye Analizi",
  className
}) => {
  // Düzeltilmiş hook kullanımı
  const { data, isLoading, isError, error } = useStockReports(filters)

  // Chart data hazırlama - API interface'e göre summary altındaki veriler
  const chartData = React.useMemo((): ChartDataItem[] => {
    if (!data?.summary) return []

    // API interface'e göre summary altındaki property'leri kullanıyoruz
    const { summary } = data
    const total = summary.total || (summary.normal + summary.low + summary.critical + summary.outOfStock)

    return [
      {
        name: 'Normal',
        value: summary.normal || 0,
        color: STOCK_COLORS.normal,
        percentage: total > 0 ? Math.round(((summary.normal || 0) / total) * 100) : 0
      },
      {
        name: 'Düşük',
        value: summary.low || 0,
        color: STOCK_COLORS.low,
        percentage: total > 0 ? Math.round(((summary.low || 0) / total) * 100) : 0
      },
      {
        name: 'Kritik',
        value: summary.critical || 0,
        color: STOCK_COLORS.critical,
        percentage: total > 0 ? Math.round(((summary.critical || 0) / total) * 100) : 0
      },
      {
        name: 'Bitti',
        value: summary.outOfStock || 0,
        color: STOCK_COLORS.outOfStock,
        percentage: total > 0 ? Math.round(((summary.outOfStock || 0) / total) * 100) : 0
      }
    ]
  }, [data])

  // Pie chart data (kritik durumlar için)
  const pieChartData = React.useMemo(() => {
    if (!data?.summary) return []

    const { summary } = data

    const criticalData = [
      {
        name: 'Normal Stok',
        value: summary.normal || 0,
        color: STOCK_COLORS.normal
      },
      {
        name: 'Dikkat Gerekli',
        value: (summary.low || 0) + (summary.critical || 0) + (summary.outOfStock || 0),
        color: '#ff7875'
      }
    ]

    return criticalData.filter(item => item.value > 0)
  }, [data])

  // Sağlık skoru hesaplama
  const healthScore = React.useMemo(() => {
    if (!data?.summary) return 0

    const { summary } = data
    const total = summary.total || chartData.reduce((sum, item) => sum + item.value, 0)
    
    if (total === 0) return 0

    const score = Math.round(((summary.normal || 0) / total) * 100)
    return Math.max(0, Math.min(100, score))
  }, [data, chartData])

  // Sağlık durumu
  const healthStatus = React.useMemo(() => {
    if (healthScore >= 80) return { status: 'excellent', color: '#52c41a', text: 'Mükemmel' }
    if (healthScore >= 60) return { status: 'good', color: '#1890ff', text: 'İyi' }
    if (healthScore >= 40) return { status: 'warning', color: '#faad14', text: 'Dikkat' }
    return { status: 'critical', color: '#ff4d4f', text: 'Kritik' }
  }, [healthScore])

  // Total items calculation
  const totalItems = React.useMemo(() => {
    return data?.summary?.total || chartData.reduce((sum, item) => sum + item.value, 0)
  }, [data, chartData])

  // Critical stock values
  const criticalStockValues = React.useMemo(() => {
    if (!data?.summary) return { critical: 0, outOfStock: 0 }

    const { summary } = data
    return {
      critical: summary.critical || 0,
      outOfStock: summary.outOfStock || 0
    }
  }, [data])

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ChartDataItem }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`${data.name} Stok`}</p>
          <p className="text-blue-600">
            {`Miktar: ${data.value} ürün`}
          </p>
          <p className="text-gray-600">
            {`Oran: %${data.percentage}`}
          </p>
        </div>
      )
    }
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <Card className={className} title={title}>
        <div className="flex justify-center items-center" style={{ height }}>
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  // Error state
  if (isError) {
    return (
      <Card className={className} title={title}>
        <Empty
          description={
            <span>
              Veri yüklenirken hata oluştu: {error?.message}
            </span>
          }
        />
      </Card>
    )
  }

  // No data state
  if (!data || totalItems === 0) {
    return (
      <Card className={className} title={title}>
        <Empty description="Stok verisi bulunamadı" />
      </Card>
    )
  }

  return (
    <Card className={className} title={title}>
      <Row gutter={[16, 16]}>
        {/* Özet İstatistikler */}
        <Col xs={24} lg={showDetailedView ? 8 : 24}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Toplam Stok */}
            <Card size="small" className="text-center">
              <Statistic
                title="Toplam Stok Kalemi"
                value={totalItems}
                prefix={<InfoCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>

            {/* Sağlık Skoru */}
            <Card size="small" className="text-center">
              <Statistic
                title="Stok Sağlık Skoru"
                value={healthScore}
                suffix="%"
                valueStyle={{ color: healthStatus.color }}
                prefix={
                  healthScore >= 80 ? <ArrowUpOutlined /> : <ArrowDownOutlined />
                }
              />
              <Tag color={healthStatus.color} style={{ marginTop: 8 }}>
                {healthStatus.text}
              </Tag>
            </Card>

            {/* Durumlar */}
            <Space direction="vertical" style={{ width: '100%' }}>
              {chartData.map((item) => (
                <div key={item.name} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <Space>
                    {STOCK_ICONS[item.name.toLowerCase() as keyof typeof STOCK_ICONS] || STOCK_ICONS.normal}
                    <Text>{item.name}</Text>
                  </Space>
                  <Space>
                    <Text strong>{item.value}</Text>
                    <Text type="secondary">(%{item.percentage})</Text>
                  </Space>
                </div>
              ))}
            </Space>
          </Space>
        </Col>

        {/* Bar Chart */}
        {showDetailedView && (
          <Col xs={24} lg={16}>
            <Row gutter={[16, 16]}>
              {/* Bar Chart */}
              <Col xs={24} xl={14}>
                <div style={{ height: height - 100 }}>
                  <Title level={5}>Stok Seviye Dağılımı</Title>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis tick={{ fontSize: 12 }} />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="value" 
                        radius={[4, 4, 0, 0]}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Col>

              {/* Pie Chart */}
              <Col xs={24} xl={10}>
                <div style={{ height: height - 100 }}>
                  <Title level={5}>Stok Sağlık Durumu</Title>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        dataKey="value"
                        label={({ value, name }: { value: number; name: string }) => `${name}: %${((value / totalItems) * 100).toFixed(0)}`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Col>
            </Row>
          </Col>
        )}
      </Row>

      {/* Kritik Uyarılar */}
      {(criticalStockValues.critical > 0 || criticalStockValues.outOfStock > 0) && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card 
              size="small" 
              style={{ 
                borderColor: '#ff4d4f',
                backgroundColor: '#fff2f0'
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  <WarningOutlined style={{ color: '#ff4d4f' }} />
                  <Text strong style={{ color: '#ff4d4f' }}>Acil Dikkat Gereken Durumlar</Text>
                </Space>
                <Row gutter={16}>
                  {criticalStockValues.critical > 0 && (
                    <Col span={12}>
                      <Tooltip title="Bu ürünler kritik stok seviyesinde, acil temin edilmeli">
                        <Tag color="error">
                          {criticalStockValues.critical} ürün kritik seviyede
                        </Tag>
                      </Tooltip>
                    </Col>
                  )}
                  {criticalStockValues.outOfStock > 0 && (
                    <Col span={12}>
                      <Tooltip title="Bu ürünlerin stoğu tamamen bitmiş">
                        <Tag color="default">
                          {criticalStockValues.outOfStock} ürün stokta yok
                        </Tag>
                      </Tooltip>
                    </Col>
                  )}
                </Row>
              </Space>
            </Card>
          </Col>
        </Row>
      )}
    </Card>
  )
}

export default StockLevelChart