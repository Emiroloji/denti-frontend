// src/components/DebugInfo.tsx - Geçici debug component

import React from 'react'
import { Card, Typography } from 'antd'

const { Text } = Typography

export const DebugInfo: React.FC = () => {
  return (
    <Card title="Debug Info" style={{ margin: '16px 0' }}>
      <div>
        <Text strong>API URL: </Text>
        <Text code>{import.meta.env.VITE_API_URL || 'Not set'}</Text>
      </div>
      <div>
        <Text strong>Environment: </Text>
        <Text code>{import.meta.env.MODE}</Text>
      </div>
      <div>
        <Text strong>Full URL Test: </Text>
        <Text code>{(import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/stocks'}</Text>
      </div>
    </Card>
  )
}