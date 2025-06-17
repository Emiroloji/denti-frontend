// src/modules/reports/components/ReportsDashboard.tsx

import React, { useState, useCallback, useMemo } from 'react'
import { 
  Row, 
  Col, 
  Card, 
  Tabs, 
  Statistic, 
  Space, 
  Button, 
  Alert,
  Badge,
  Tooltip,
  Divider
} from 'antd'
import { 
  BarChartOutlined,
  PieChartOutlined,
  LineChartOutlined,
  DashboardOutlined,
  ReloadOutlined,
  DownloadOutlined,
  SettingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

// Import components
import DateRangeFilter from './filters/DateRangeFilter'
import ClinicFilter from './filters/ClinicFilter'
import CategoryChart from './charts/CategoryChart'
import TrendChart from './charts/TrendChart'

// Import hooks
import { useAllStockReports, useStockStatusSummary } from '../hooks/useStockReports'
import { useSupplierSummaryStats } from '../hooks/useSupplierReports'
import { useClinicSummaryStats } from '../hooks/useClinicReports'

// Import types
import type { ReportFilter } from '../types/reports.types'

// =============================================================================
// INTERFACES
// =============================================================================

interface ReportsDashboardProps {
  defaultFilters?: Partial<ReportFilter>
  showFilters?: boolean
  compactMode?: boolean
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  defaultFilters,
  showFilters = true,
  compactMode = false
}) => {
  const [filters, setFilters] = useState<Partial<ReportFilter>>(() => ({
    startDate: dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    ...defaultFilters
  }))
  
  const [activeTab, setActiveTab] = useState('overview')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // =============================================================================
  // DATA HOOKS
  // =============================================================================

  const { 
    data: stockReports, 
    isLoading, 
    error: stockError,
    refetch: refetchStock 
  } = useAllStockReports(filters)

  const { 
    data: stockSummary 
  } = useStockStatusSummary(filters)

  const { 
    data: supplierStats, 
    isLoading: supplierLoading 
  } = useSupplierSummaryStats(filters)

  const { 
    data: clinicStats, 
    isLoading: clinicLoading 
  } = useClinicSummaryStats(filters)

  // =============================================================================
  // COMPUTED VALUES
  // =============================================================================

  const dashboardStats = useMemo(() => {
    if (!stockSummary) return {
      totalStocks: 0,
      normalStocks: 0,
      lowStocks: 0,
      criticalStocks: 0,
      outOfStock: 0,
      healthPercentage: 0
    }

    return {
      totalStocks: stockSummary.total || 0,
      normalStocks: stockSummary.normal || 0,
      lowStocks: stockSummary.low || 0,
      criticalStocks: stockSummary.critical || 0,
      outOfStock: stockSummary.outOfStock || 0,
      healthPercentage: stockSummary.total > 0 
        ? Math.round((stockSummary.normal / stockSummary.total) * 100) 
        : 0
    }
  }, [stockSummary])

  const filterSummary = useMemo(() => {
    const startDate = filters.startDate ? dayjs(filters.startDate).format('DD.MM.YYYY') : ''
    const endDate = filters.endDate ? dayjs(filters.endDate).format('DD.MM.YYYY') : ''
    const dateRange = startDate && endDate ? `${startDate} - ${endDate}` : 'Tüm zamanlar'
    
    const clinicCount = filters.clinicIds?.length || 0
    const clinicText = clinicCount === 0 ? 'Tüm klinikler' : 
                     clinicCount === 1 ? '1 klinik' : 
                     `${clinicCount} klinik`

    return { dateRange, clinicText, clinicCount }
  }, [filters])

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleFilterChange = useCallback((newFilters: Partial<ReportFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([
        refetchStock()
      ])
    } finally {
      setTimeout(() => setIsRefreshing(false), 1500)
    }
  }

  const handleExport = () => {
    // Export functionality will be implemented
    console.log('Export dashboard data')
  }

  // =============================================================================
  // RENDER HELPERS
  // =============================================================================

  const renderQuickStats = () => {
    const stats = [
      {
        title: 'Toplam Stok',
        value: dashboardStats.totalStocks,
        suffix: 'kalem',
        color: '#1890ff',
        icon: <BarChartOutlined />
      },
      {
        title: 'Normal Seviye',
        value: dashboardStats.normalStocks,
        suffix: 'kalem',
        color: '#52c41a',
        icon: <Badge status="success" />
      },
      {
        title: 'Düşük Seviye',
        value: dashboardStats.lowStocks,
        suffix: 'kalem',
        color: '#faad14',
        icon: <Badge status="warning" />
      },
      {
        title: 'Kritik Seviye',
        value: dashboardStats.criticalStocks,
        suffix: 'kalem',
        color: '#f5222d',
        icon: <Badge status="error" />
      }
    ]

    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={12} sm={6} key={index}>
            <Card size="small">
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                prefix={stat.icon}
                valueStyle={{ color: stat.color, fontSize: compactMode ? '20px' : '24px' }}
              />
            </Card>
          </Col>
        ))}
      </Row>
    )
  }

  const renderFilterSection = () => {
    if (!showFilters) return null

    return (
      <Card 
        title="Filtreler" 
        size="small" 
        style={{ marginBottom: 24 }}
        extra={
          <Space>
            <Tooltip title="Tüm verileri yenile">
              <Button
                icon={<ReloadOutlined spin={isRefreshing} />}
                onClick={handleRefreshAll}
                loading={isRefreshing}
                size="small"
              >
                Yenile
              </Button>
            </Tooltip>
            <Tooltip title="Raporu dışa aktar">
              <Button
                icon={<DownloadOutlined />}
                onClick={handleExport}
                size="small"
              >
                Dışa Aktar
              </Button>
            </Tooltip>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <DateRangeFilter
              value={filters}
              onChange={handleFilterChange}
              showPresets={true}
              maxDays={365}
            />
          </Col>
          <Col xs={24} lg={12}>
            <ClinicFilter
              value={filters}
              onChange={handleFilterChange}
              allowMultiple={true}
              groupBySpecialty={true}
              showStatistics={true}
            />
          </Col>
        </Row>

        {/* Filter Summary */}
        <Divider style={{ margin: '16px 0 8px 0' }} />
        <Space split={<Divider type="vertical" />}>
          <span>
            <InfoCircleOutlined style={{ marginRight: 4 }} />
            <strong>Tarih:</strong> {filterSummary.dateRange}
          </span>
          <span>
            <strong>Klinik:</strong> {filterSummary.clinicText}
          </span>
          <span>
            <strong>Sağlık Oranı:</strong>{' '}
            <span style={{ 
              color: dashboardStats.healthPercentage > 80 ? '#52c41a' : 
                     dashboardStats.healthPercentage > 60 ? '#faad14' : '#f5222d' 
            }}>
              %{dashboardStats.healthPercentage}
            </span>
          </span>
        </Space>
      </Card>
    )
  }

  const renderOverviewTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={12}>
        <CategoryChart
          filters={filters}
          height={compactMode ? 300 : 400}
          showControls={true}
          defaultMode="pie"
        />
      </Col>
      <Col xs={24} lg={12}>
        <TrendChart
          filters={filters}
          height={compactMode ? 300 : 400}
          showControls={true}
          showForecast={true}
          showKPIs={true}
        />
      </Col>
    </Row>
  )

  const renderStockTab = () => (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <CategoryChart
          filters={filters}
          height={compactMode ? 350 : 450}
          showControls={true}
          defaultMode="bar"
          defaultValueType="count"
        />
      </Col>
      <Col span={24}>
        <Card title="Stok Seviye Analizi" size="small">
          {stockReports ? (
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Normal Seviye"
                  value={stockReports.levels?.normalLevel || 0}
                  suffix="kalem"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Düşük Seviye"
                  value={stockReports.levels?.lowLevel || 0}
                  suffix="kalem"
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Kritik Seviye"
                  value={stockReports.levels?.criticalLevel || 0}
                  suffix="kalem"
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Toplam Değer"
                  value={stockReports.movements?.totalMovements || 0}
                  suffix="hareket"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
            </Row>
          ) : (
            <Alert message="Stok verileri yükleniyor..." type="info" />
          )}
        </Card>
      </Col>
    </Row>
  )

  const renderCategoryTab = () => (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <CategoryChart
          filters={filters}
          height={compactMode ? 400 : 500}
          showControls={true}
          defaultMode="donut"
          defaultValueType="percentage"
        />
      </Col>
      <Col span={24}>
        <CategoryChart
          filters={filters}
          height={compactMode ? 300 : 350}
          showControls={false}
          defaultMode="table"
          defaultValueType="count"
        />
      </Col>
    </Row>
  )

  const renderTrendTab = () => (
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <TrendChart
          filters={filters}
          height={compactMode ? 450 : 550}
          showControls={true}
          showForecast={true}
          showKPIs={true}
        />
      </Col>
      <Col xs={24} lg={12}>
        <Card title="Tedarikçi Özeti" size="small" loading={supplierLoading}>
          {supplierStats && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="Toplam Tedarikçi"
                value={supplierStats.totalSuppliers || 0}
                suffix="firma"
              />
              <Statistic
                title="Ortalama Kalite"
                value={supplierStats.avgQualityRating || 0}
                suffix="/5"
                precision={1}
              />
              <Statistic
                title="Ortalama Teslimat"
                value={supplierStats.avgDeliveryTime || 0}
                suffix="gün"
                precision={1}
              />
            </Space>
          )}
        </Card>
      </Col>
      <Col xs={24} lg={12}>
        <Card title="Klinik Özeti" size="small" loading={clinicLoading}>
          {clinicStats && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="Toplam Klinik"
                value={clinicStats.totalClinics || 0}
                suffix="klinik"
              />
              <Statistic
                title="Toplam Tüketim"
                value={clinicStats.totalConsumption || 0}
                suffix="adet"
              />
              <Statistic
                title="Ortalama Verimlilik"
                value={clinicStats.avgEfficiency || 0}
                suffix="%"
                precision={1}
              />
            </Space>
          )}
        </Card>
      </Col>
    </Row>
  )

  // =============================================================================
  // RENDER
  // =============================================================================

  if (stockError) {
    return (
      <Alert
        message="Dashboard verileri yüklenemedi"
        description={stockError.message}
        type="error"
        showIcon
        action={
          <Button onClick={handleRefreshAll}>
            Tekrar Dene
          </Button>
        }
      />
    )
  }

  return (
    <div style={{ padding: compactMode ? 16 : 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <DashboardOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <span style={{ fontSize: 20, fontWeight: 'bold' }}>
              Raporlar Dashboard
            </span>
          </Space>
          <Space>
            <Button
              icon={<SettingOutlined />}
              onClick={() => console.log('Settings')}
            >
              Ayarlar
            </Button>
          </Space>
        </Space>
      </div>

      {/* Quick Stats */}
      {renderQuickStats()}

      {/* Filters */}
      {renderFilterSection()}

      {/* Main Content */}
      <Card bodyStyle={{ padding: compactMode ? 16 : 24 }}>
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
          size={compactMode ? 'small' : 'default'}
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <DashboardOutlined />
                  Genel Bakış
                </span>
              ),
              children: renderOverviewTab()
            },
            {
              key: 'stock',
              label: (
                <span>
                  <BarChartOutlined />
                  Stok Analizi
                </span>
              ),
              children: renderStockTab()
            },
            {
              key: 'category',
              label: (
                <span>
                  <PieChartOutlined />
                  Kategori Analizi
                </span>
              ),
              children: renderCategoryTab()
            },
            {
              key: 'trend',
              label: (
                <span>
                  <LineChartOutlined />
                  Trend Analizi
                </span>
              ),
              children: renderTrendTab()
            }
          ]}
        />
      </Card>
    </div>
  )
}

export default ReportsDashboard