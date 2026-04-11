import { Routes, Route, useParams } from 'react-router-dom'
import { ClientFormPage } from '../../features/clientForm/pages/ClientFormPage'
import { OrderTrackingPage } from '../../features/orderTracking/pages/OrderTrackingPage'
import { PublicCenteredState } from '../layout/PublicCenteredState'

const InvalidLinkIcon = () => (
  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#83ccb9]/30 bg-[#83ccb9]/15 shadow-[0_0_24px_rgba(131,204,185,0.3)]">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#83ccb9"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  </div>
)

const ClientFormRoute = () => {
  const { token } = useParams()

  if (!token) {
    return (
      <PublicCenteredState
        icon={<InvalidLinkIcon />}
        title="Invalid form link"
        description="The link you followed doesn't include a valid form token."
      />
    )
  }

  return <ClientFormPage token={token} />
}

const OrderTrackingRoute = () => {
  const { token } = useParams()

  if (!token) {
    return (
      <PublicCenteredState
        icon={<InvalidLinkIcon />}
        title="Invalid tracking link"
        description="The link you followed doesn't include a valid tracking token."
      />
    )
  }

  return <OrderTrackingPage token={token} />
}

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/form/:token" element={<ClientFormRoute />} />
      <Route path="/form" element={<ClientFormRoute />} />
      <Route path="/track/:token" element={<OrderTrackingRoute />} />
      <Route path="/track" element={<OrderTrackingRoute />} />
      <Route
        path="*"
        element={
          <PublicCenteredState
            icon={<InvalidLinkIcon />}
            title="Page not found"
            description="This public external operations link is not valid."
          />
        }
      />
    </Routes>
  )
}
