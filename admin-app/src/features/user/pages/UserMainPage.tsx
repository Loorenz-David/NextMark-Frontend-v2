import { useEffect } from 'react'

import type { StackComponentProps } from '@/shared/stack-manager/types'
import { UserIcon } from '@/assets/icons'

import { UserProvider } from '../context/UserProvider'
import { useUserContext } from '../context/UserContext'
import { useUserActions } from '../hooks/useUserActions'
import { useUserFlow } from '../hooks/useUserFlow'
import { UserProfileCard, UserSubscriptionCard } from '../components/UserProfileCard'


const UserMainContent = () => {
  const { user } = useUserContext()
  const { openEditProfile } = useUserActions()
  const { loadProfile } = useUserFlow()
  

  useEffect(() => {
    void loadProfile()
  }, [])

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto bg-[var(--color-page)] p-6 scroll-thin">
      <section className="admin-glass-panel-strong relative overflow-hidden rounded-[28px] px-8 py-7">
        <div className="pointer-events-none absolute left-0 top-0 h-40 w-52 rounded-full bg-[rgb(var(--color-light-blue-r),0.12)] blur-3xl" />
        <div className="relative flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-white/[0.08] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))]">
            <UserIcon className="h-9 w-9" />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Profile Settings
            </p>
            <h1 className="text-[2rem] font-semibold leading-none text-[var(--color-text)]">
              Account profile
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              Manage your personal details, contact information, and workspace access profile.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)] xl:items-start">
        <UserProfileCard user={user} onEdit={openEditProfile} />
        <UserSubscriptionCard />
      </div>
    </div>
  )
}

export const UserMainPage = (_: StackComponentProps<undefined>) => (
  <UserProvider>
    <UserMainContent />
  </UserProvider>
)
