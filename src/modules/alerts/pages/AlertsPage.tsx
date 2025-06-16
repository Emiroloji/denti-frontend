// src/modules/alerts/pages/AlertsPage.tsx

import React from 'react'
import { AlertList } from '../components/AlertList'

interface AlertsPageProps {
  currentUser?: string
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ 
  currentUser = 'Sistem Kullanıcısı' 
}) => {
  return (
    <AlertList 
      currentUser={currentUser}
      showDashboard={true}
    />
  )
}