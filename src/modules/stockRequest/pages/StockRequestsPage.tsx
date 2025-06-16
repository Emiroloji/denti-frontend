// src/modules/stockRequest/pages/StockRequestsPage.tsx

import React from 'react'
import { StockRequestList } from '../components/StockRequestList'

interface StockRequestsPageProps {
  currentUser?: string
}

export const StockRequestsPage: React.FC<StockRequestsPageProps> = ({ 
  currentUser = 'Sistem Kullanıcısı' 
}) => {
  return (
    <StockRequestList 
      currentUser={currentUser}
      showCreateForm={true}
    />
  )
}