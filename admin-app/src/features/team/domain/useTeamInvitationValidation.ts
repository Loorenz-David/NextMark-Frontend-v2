import { validateEmail, validateString } from '@shared-domain'

export const useTeamInvitationValidation = () => ({
  validateUsername: (value: string) => validateString(value),
  validateEmail: (value: string) => validateEmail(value),
  validateRoleName: (value: string) => validateString(value),
  validateRoleId: (value: string) => validateString(value) && !Number.isNaN(Number(value)),
})
