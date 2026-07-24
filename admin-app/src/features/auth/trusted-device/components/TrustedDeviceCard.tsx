import { useState } from 'react'

import { MemberAvatar } from '@/features/team/members/components/MemberAvatar'

import { trustedDeviceApi } from '../api/trustedDeviceApi'
import type { AssignedUser, TrustedDevice } from '../types/trustedDevice'

const formatDate = (value?: string | null): string => {
  if (!value) {
    return '—'
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()
}

type TrustedDeviceCardProps = {
  device: TrustedDevice
  isThisBrowser: boolean
  canManage: boolean
  onRotate: (clientId: string) => void
  onDelete: (clientId: string) => void
}

export const TrustedDeviceCard = ({
  device,
  isThisBrowser,
  canManage,
  onRotate,
  onDelete,
}: TrustedDeviceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [users, setUsers] = useState<AssignedUser[] | null>(null)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  const toggleExpanded = () => {
    const next = !isExpanded
    setIsExpanded(next)
    if (next && users === null && !isLoadingUsers) {
      setIsLoadingUsers(true)
      trustedDeviceApi
        .getById(device.client_id)
        .then((response) => setUsers(response.data.users))
        .catch(() => setUsers([]))
        .finally(() => setIsLoadingUsers(false))
    }
  }

  const isRevoked = Boolean(device.revoked_at) || !device.is_active

  return (
    <div className="rounded-3xl border border-border bg-surface-raised px-5 py-4 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          onClick={toggleExpanded}
          className="flex min-w-0 flex-1 flex-col text-left"
        >
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">
              {device.name}
            </p>
            {isThisBrowser ? (
              <span className="rounded-full bg-[rgba(96,165,250,0.18)] px-2 py-0.5 text-[11px] font-semibold text-[rgba(147,197,253,0.95)]">
                This device
              </span>
            ) : null}
            {isRevoked ? (
              <span className="rounded-full bg-danger-bg px-2 py-0.5 text-[11px] font-semibold text-danger">
                {device.revoked_at ? 'Revoked' : 'Inactive'}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-[var(--color-muted)]">
            {device.active_user_count ?? 0} user
            {device.active_user_count === 1 ? '' : 's'} · added {formatDate(device.created_at)}
          </p>
        </button>

        {canManage ? (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => onRotate(device.client_id)}
              className="rounded-full border border-border bg-surface-raised px-3 py-1 text-xs text-[var(--color-muted)] hover:text-[var(--color-text)]"
            >
              Rotate secret
            </button>
            <button
              type="button"
              onClick={() => onDelete(device.client_id)}
              className="rounded-full border border-danger-border bg-danger-bg px-3 py-1 text-xs text-danger hover:text-danger"
            >
              {isThisBrowser ? 'Un-trust this browser' : 'Remove'}
            </button>
          </div>
        ) : null}
      </div>

      {isExpanded ? (
        <div className="mt-4 grid gap-2 border-t border-border-subtle pt-4 text-xs text-[var(--color-muted)]">
          <div>Device id: {device.client_id}</div>
          <div>Last used: {formatDate(device.last_used_at)}</div>
          <div>Status: {isRevoked ? (device.revoked_at ? 'Revoked' : 'Inactive') : 'Active'}</div>
          <div className="mt-1">
            <span>Assigned operators:</span>
            {isLoadingUsers ? (
              <p className="mt-1 text-[var(--color-muted)]">Loading…</p>
            ) : null}
            {!isLoadingUsers && users && users.length ? (
              <div className="mt-2 flex flex-col gap-2">
                {users.map((user) => (
                  <div key={user.client_id} className="flex items-center gap-2">
                    <MemberAvatar username={user.username} className="h-6 w-6 text-xs" />
                    <span className="text-[var(--color-text)]">{user.username}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {!isLoadingUsers && users && !users.length ? (
              <p className="mt-1">No operators assigned.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
