import { LockIconLocked } from '@/assets/icons'

import { TrustedDeviceSectionLayout } from '../components/TrustedDeviceSectionLayout'
import { TrustedDeviceCard } from '../components/TrustedDeviceCard'
import { useTrustedDeviceController } from '../hooks/useTrustedDeviceController'
import { useDeviceCredential } from '../hooks/useDeviceCredential'

export const TrustedDeviceMainPage = () => {
  const {
    items,
    setQuery,
    isLoading,
    permissionDenied,
    isAdmin,
    openEnroll,
    openReprovision,
    deleteDevice,
    rotateSecret,
  } = useTrustedDeviceController()
  const credential = useDeviceCredential()

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto bg-[var(--color-page)] p-6 scroll-thin">
      <section className="admin-glass-panel-strong relative overflow-hidden rounded-[28px] px-8 py-7">
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-56 rounded-full bg-[rgb(var(--color-light-blue-r),0.12)] blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/[0.08] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))]">
            <LockIconLocked className="h-9 w-9" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Configuration
            </p>
            <h1 className="text-[2rem] font-semibold leading-none text-[var(--color-text)]">
              Trusted devices
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Let a shared machine host multiple operators. Enrolling stores a device
              secret on this browser so assigned users can switch without an admin present.
            </p>
          </div>
        </div>
      </section>

      <div className="flex-1">
        <TrustedDeviceSectionLayout
          title="Trusted devices"
          description="Devices allowed to host multi-user sessions for this team."
          canEnroll={isAdmin}
          onEnroll={openEnroll}
          onReprovision={openReprovision}
          onSearch={setQuery}
        >
          {items.map((device) => (
            <TrustedDeviceCard
              key={device.client_id}
              device={device}
              isThisBrowser={credential?.client_id === device.client_id}
              canManage={isAdmin}
              onRotate={rotateSecret}
              onDelete={deleteDevice}
            />
          ))}

          {isLoading ? (
            <p className="text-sm text-[var(--color-muted)]">Loading trusted devices…</p>
          ) : null}

          {!isLoading && permissionDenied ? (
            <p className="text-sm text-[var(--color-muted)]">
              You need admin permissions to manage trusted devices.
            </p>
          ) : null}

          {!isLoading && !permissionDenied && !items.length ? (
            <p className="text-sm text-[var(--color-muted)]">
              No trusted devices yet.
              {isAdmin ? ' Use “Add this device” to enroll this browser.' : ''}
            </p>
          ) : null}
        </TrustedDeviceSectionLayout>
      </div>
    </div>
  )
}
