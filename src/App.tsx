// src/App.tsx

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ConfigProvider } from 'antd'
import trTR from 'antd/locale/tr_TR'
import { Router } from './router'

// React Query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 dakika
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider 
        locale={trTR}
        theme={{
          token: {
            colorPrimary: '#1890ff',
            borderRadius: 6,
            colorSuccess: '#52c41a',
            colorWarning: '#faad14', 
            colorError: '#ff4d4f',
          },
        }}
      >
        <Router />
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App