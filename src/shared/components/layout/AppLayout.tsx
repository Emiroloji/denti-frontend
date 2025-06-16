// src/shared/components/layout/AppLayout.tsx

import React, { useState } from 'react'
import { Layout, Menu, Button, Typography, Space, Avatar, Dropdown, Badge } from 'antd'
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  BankOutlined,
  SwapOutlined,
  BellOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { usePendingAlertCount } from '@/modules/alerts/hooks/useAlerts'
import type { MenuProps } from 'antd'

const { Header, Sider, Content } = Layout
const { Title } = Typography

// Pending alert badge component'i
const PendingAlertBadge: React.FC = () => {
  const { data: pendingCount } = usePendingAlertCount()
  
  if (!pendingCount || pendingCount === 0) return null
  
  return (
    <Badge 
      count={pendingCount} 
      size="small" 
      style={{ backgroundColor: '#ff4d4f' }}
    />
  )
}

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems: MenuProps['items'] = [
    {
      key: '/stocks',
      icon: <ShoppingCartOutlined />,
      label: 'Stok Yönetimi',
      onClick: () => navigate('/stocks')
    },
    {
      key: '/suppliers',
      icon: <TeamOutlined />,
      label: 'Tedarikçiler',
      onClick: () => navigate('/suppliers')
    },
    {
      key: '/clinics',
      icon: <BankOutlined />,
      label: 'Klinikler', 
      onClick: () => navigate('/clinics')
    },
    {
      key: '/stock-requests',
      icon: <SwapOutlined />,
      label: 'Stok Talepleri',
      onClick: () => navigate('/stock-requests')
    },
    {
      key: '/alerts',
      icon: <BellOutlined />,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span>Uyarılar</span>
          {!collapsed && <PendingAlertBadge />}
        </div>
      ),
      onClick: () => navigate('/alerts')
    },
    {
      key: '/reports',
      icon: <BarChartOutlined />,
      label: 'Raporlar',
      onClick: () => navigate('/reports')
    }
  ]

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Ayarlar'
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap'
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        style={{
          background: '#fff',
          boxShadow: '2px 0 8px 0 rgba(29, 35, 41, 0.05)'
        }}
      >
        <div style={{ 
          height: 64, 
          padding: '16px', 
          display: 'flex', 
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          {!collapsed && (
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              🦷 Denti Management
            </Title>
          )}
          {collapsed && (
            <div style={{ fontSize: '24px' }}>🦷</div>
          )}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ border: 'none' }}
          items={menuItems}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <Space>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>Admin User</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <Content style={{ 
          margin: '24px',
          padding: '24px',
          background: '#f5f5f5',
          minHeight: 'calc(100vh - 112px)',
          overflow: 'auto'
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}