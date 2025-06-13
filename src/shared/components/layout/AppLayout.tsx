import React from 'react'
import { Layout, Menu, Typography } from 'antd'
import { CheckSquareOutlined, TagsOutlined } from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const { Header, Sider, Content } = Layout
const { Title } = Typography

export const AppLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/todos',
      icon: <CheckSquareOutlined />,
      label: 'Todo Listesi',
      onClick: () => navigate('/todos')
    },
    {
      key: '/categories',
      icon: <TagsOutlined />,
      label: 'Kategoriler',
      onClick: () => navigate('/categories')
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} theme="light">
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={4} style={{ margin: 0, textAlign: 'center' }}>
            Todo App
          </Title>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 0, height: '100%' }}
        />
      </Sider>

      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={3} style={{ margin: '16px 0' }}>
            {location.pathname === '/categories' ? 'Kategori Yönetimi' : 'Todo Yönetimi'}
          </Title>
        </Header>

        <Content style={{ margin: '24px', overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}