import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactElement } from 'react'

import { AuthPage } from '@/features/auth/pages/AuthPage'
import { Home } from '@/features/home-app/pages/HomeAppPage'
import { SettingsPage } from '@/features/settings/pages/SettingsPage'

import { useAuthSession } from '../../features/auth/login/hooks/useAuthSelectors'
import { ExternalCustomerFormPage } from '@/features/externalForm/pages/ExternalCustomerForm.page'

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
            <SettingsPage/>
          </ProtectedRoute>
        }
      />
      <Route
        path="/external-form/*"
        element={
          <ProtectedRoute>
            <ExternalCustomerFormPage/>
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    
  )
}
