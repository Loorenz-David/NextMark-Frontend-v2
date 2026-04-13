import { lazy, Suspense, type ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import { Home } from '@/features/home-app/pages/HomeAppPage'

import { useAuthSession } from '../../features/auth/login/hooks/useAuthSelectors'
import { AppRouterSkeleton } from './AppRouterSkeleton'

const AuthPage = lazy(() =>
  import('@/features/auth/pages/AuthPage').then((module) => ({ default: module.AuthPage })),
)
const SettingsPage = lazy(() =>
  import('@/features/settings/pages/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
)
const ExternalCustomerFormPage = lazy(() =>
  import('@/features/externalForm/pages/ExternalCustomerForm.page').then((module) => ({
    default: module.ExternalCustomerFormPage,
  })),
)

function ProtectedRoute({ children }: { children: ReactElement }) {
  const session = useAuthSession()
  const isAuthenticated = Boolean(session)
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }
  return children
}

export function AppRouter() {
  return (
    <Suspense fallback={<AppRouterSkeleton />}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/*" element={<AuthPage />} />
        <Route
          path="/settings/*"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/external-form/*"
          element={
            <ProtectedRoute>
              <ExternalCustomerFormPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
