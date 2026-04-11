import { EditIcon, MailIcon, MessageIcon, UserIcon } from '@/assets/icons'
import { MemberAvatar } from '@/shared/layout/MemberAvatar'
import { BasicButton } from '@/shared/buttons/BasicButton'
import { formatPhone } from '@/shared/data-validation/phoneValidation'
import { capitalize } from '@shared-utils'
import type { User } from '../types/user'

type UserProfileCardProps = {
  user: User | null
  onEdit: () => void
}

export const UserSubscriptionCard = () => (
  <div className="admin-glass-panel-strong relative overflow-hidden rounded-[28px] p-6 shadow-none">
    <div className="absolute right-0 top-0 h-28 w-44 translate-x-10 -translate-y-8 rounded-full bg-[rgb(var(--color-light-blue-r),0.14)] blur-3xl" />
    <div className="absolute bottom-0 left-0 h-24 w-32 -translate-x-6 translate-y-6 rounded-full bg-[rgba(226,197,94,0.08)] blur-3xl" />
    <div className="relative flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">
            Subscription
          </p>
          <p className="mt-2 text-xl font-semibold text-[var(--color-text)]">Starter Plan</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Active • Renews monthly
          </p>
        </div>
        <span className="rounded-full border border-[#83ccb9]/34 bg-[#83ccb9]/16 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[#a6f1dc] shadow-[0_10px_24px_rgba(131,204,185,0.14)] backdrop-blur-md">
          Current
        </span>
      </div>

      <div className="grid gap-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-[var(--color-text)]">
          Up to 3 team members
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-[var(--color-text)]">
          Basic route optimization
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-sm text-[var(--color-text)]">
          Email support
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4">
        <div>
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-muted)]">
            Next invoice
          </p>
          <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">$ / month</p>
        </div>
        <BasicButton params={{ variant: 'primary', onClick: () => {}, className: 'shrink-0' }}>
          Upgrade
        </BasicButton>
      </div>
    </div>
  </div>
)

export const UserProfileCard = ({ user, onEdit }: UserProfileCardProps) => {
  const username = user?.username ?? '—'
  const role = user?.user_role_id ?? '—'
  const email = user?.email ?? '—'
  const phone = formatPhone(user?.phone_number) ?? '—'

  return (
    <div className="admin-glass-panel-strong relative overflow-hidden rounded-[28px] p-6 shadow-none">
      <div className="pointer-events-none absolute left-0 top-0 h-36 w-52 -translate-x-12 -translate-y-10 rounded-full bg-[rgb(var(--color-light-blue-r),0.14)] blur-3xl" />
      <div className="relative flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <MemberAvatar username={username} className="text-xl ring-1 ring-white/[0.08]" />
            <div className="flex flex-col gap-1">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)]">
                Personal profile
              </p>
              <p className="text-xl font-semibold text-[var(--color-text)]">{capitalize(username)}</p>
              <p className="text-sm text-[var(--color-muted)]">Role: {role}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.05] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
              Active profile
            </span>
            <BasicButton
              params={{
                variant: 'secondary',
                onClick: onEdit,
                ariaLabel: 'Edit profile',
                className: 'shrink-0',
              }}
            >
              <EditIcon className="mr-2 h-4 w-4" />
              Edit profile
            </BasicButton>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.04] px-5 py-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))]">
                <UserIcon className="h-5 w-5" />
              </div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">
                Username
              </p>
            </div>
            <p className="text-lg font-medium text-[var(--color-text)]">{capitalize(username)}</p>
          </div>

          <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.04] px-5 py-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))]">
                <MailIcon className="h-5 w-5" />
              </div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">
                Email
              </p>
            </div>
            <p className="break-words text-lg font-medium text-[var(--color-text)]">{email}</p>
          </div>

          <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.04] px-5 py-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))]">
                <MessageIcon className="h-5 w-5" />
              </div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">
                Phone
              </p>
            </div>
            <p className="text-lg font-medium text-[var(--color-text)]">{phone}</p>
          </div>

          <div className="rounded-[24px] border border-white/[0.06] bg-white/[0.04] px-5 py-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.05] text-[rgb(var(--color-light-blue-r))]">
                <UserIcon className="h-5 w-5" />
              </div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-[var(--color-muted)]">
                Role
              </p>
            </div>
            <p className="text-lg font-medium capitalize text-[var(--color-text)]">{role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
