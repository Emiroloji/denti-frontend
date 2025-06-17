// src/modules/reports/pages/ReportsPage.tsx

import React from 'react'
import { ReportsDashboard } from '../components/ReportsDashboard'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ReportsPage: React.FC = () => {
  return (
    <ReportsDashboard 
      showFilters={true}
      compactMode={false}
    />
  )
}

export default ReportsPage