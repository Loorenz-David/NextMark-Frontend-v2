import { useEffect, useMemo } from 'react'

import type { PopoverSelectOption } from '@/shared/inputs/OptionPopoverSelect'
import { useUserRoleQueries } from '@/features/role/userRole/hooks/useUserRoleQueries'
import { useUserRoles } from '@/features/role/userRole/hooks/useUserRoleSelectors'
import type { UserRole } from '@/features/role/userRole/types/userRole'

export const useInviteMemberRoleOptions = () => {
  const { fetchUserRoles } = useUserRoleQueries()
  const roles = useUserRoles()

  useEffect(() => {
    void fetchUserRoles()
  }, [fetchUserRoles])

  const roleOptions = useMemo<Array<PopoverSelectOption<number>>>(
    () =>
      roles
        .filter((role): role is UserRole & { id: number } => typeof role.id === 'number')
        .map((role) => ({ label: role.role_name, value: role.id })),
    [roles],
  )

  const findRoleById = (roleId: number | null) =>
    roleId === null ? null : roles.find((role) => role.id === roleId) ?? null

  return { roleOptions, findRoleById }
}
