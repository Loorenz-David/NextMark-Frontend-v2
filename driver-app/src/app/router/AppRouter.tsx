import { Navigate, Route, Routes } from 'react-router-dom'
import { DriverAppShell } from '@/app/shell'
import { LoginPage } from '@/features/auth'
import { ProtectedRoute } from './ProtectedRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <DriverAppShell />
          </ProtectedRoute>
        )}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
