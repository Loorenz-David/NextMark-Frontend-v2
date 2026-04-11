import { StoreIcon } from '@/assets/icons'

import { FacilityProvider } from '../context/FacilityProvider'
import { FacilitySectionLayout } from '../components/FacilitySectionLayout'
import { FacilityCard } from '../components/FacilityCard'
import { useFacilityController } from '../hooks/useFacilityController'

const FacilityMainContent = () => {
  const { items, setQuery, openCreate, openEdit, isLoading } = useFacilityController()

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto bg-[var(--color-page)] p-6 scroll-thin">
      <section className="admin-glass-panel-strong relative overflow-hidden rounded-[28px] px-8 py-7">
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-56 rounded-full bg-[rgb(var(--color-light-blue-r),0.12)] blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/[0.08] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))]">
            <StoreIcon className="h-9 w-9" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Infrastructure
            </p>
            <h1 className="text-[2rem] font-semibold leading-none text-[var(--color-text)]">
              Facility settings
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Manage facilities, address coverage, and operational defaults used across planning.
            </p>
          </div>
        </div>
      </section>

      <div className="flex-1">
        <FacilitySectionLayout
          title="Facilities"
          description="Manage facility locations."
          onCreate={openCreate}
          onSearch={setQuery}
        >
          {items.map((facility) => (
            <FacilityCard key={facility.client_id} facility={facility} onEdit={openEdit} />
          ))}
          {isLoading ? (
            <p className="text-sm text-[var(--color-muted)]">Loading facilities...</p>
          ) : null}
          {!isLoading && !items.length ? (
            <p className="text-sm text-[var(--color-muted)]">No facilities found.</p>
          ) : null}
        </FacilitySectionLayout>
      </div>
    </div>
  )
}

export const FacilityMainPage = () => (
  <FacilityProvider>
    <FacilityMainContent />
  </FacilityProvider>
)
