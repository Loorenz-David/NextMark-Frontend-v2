import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'

import { SettingsSectionSkeleton } from '../components/SettingsSectionSkeleton'

export const SettingsMobileView = () => (
  <Suspense fallback={<SettingsSectionSkeleton />}>
    <Outlet />
  </Suspense>
)
