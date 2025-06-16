// src/router/index.tsx

import React from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { AppLayout } from '../shared/components/layout/AppLayout'
import { StocksPage } from '../modules/stock/pages/StocksPage'
import { SuppliersPage } from '../modules/supplier/pages/SuppliersPage'
import { ClinicsPage } from '../modules/clinic/pages/ClinicsPage'
import { StockRequestsPage } from '@/modules/stockRequest/pages/StockRequestsPage'
import { AlertsPage } from '@/modules/alerts/pages/AlertsPage'



const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/stocks" replace />
      },
      {
        path: 'stocks',
        element: <StocksPage />
      },
      {
        path: 'suppliers',
        element: <SuppliersPage />
      },
      {
        path: 'clinics',
        element: <ClinicsPage />
      },
      {
        path: 'stock-requests',
        element: <StockRequestsPage />
      },
      {
        path: 'alerts',
        element: <AlertsPage />
      },
      // {
      //   path: 'reports',
      //   element: <ReportsPage />
      // }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/stocks" replace />
  }
])

// Router Component'i export et
export const Router: React.FC = () => {
  return <RouterProvider router={router} />
}