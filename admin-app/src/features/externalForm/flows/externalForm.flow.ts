import type { ExternalFormData, ExternalFormStep } from '../domain/externalForm.types'
import type { SessionSnapshot } from '@/features/auth/login/store/sessionStorage'

export const EXTERNAL_FORM_STEPS: ExternalFormStep[] = [
  'client_info',
  'contact_info',
  'delivery_address',
]

type CanProceedFn = (step: ExternalFormStep, form: ExternalFormData) => boolean

export const getExternalFormStepIndex = (step: ExternalFormStep) => {
  return EXTERNAL_FORM_STEPS.findIndex((current) => current === step)
}

export const getNextExternalFormStep = (step: ExternalFormStep): ExternalFormStep | null => {
  const currentIndex = getExternalFormStepIndex(step)
  const nextIndex = currentIndex + 1

  if (nextIndex >= EXTERNAL_FORM_STEPS.length) {
    return null
  }

  return EXTERNAL_FORM_STEPS[nextIndex]
}

export const canNavigateToStep = (
  targetStep: ExternalFormStep,
  form: ExternalFormData,
  canProceed: CanProceedFn,
) => {
  const targetIndex = getExternalFormStepIndex(targetStep)

  if (targetIndex <= 0) {
    return true
  }

  return EXTERNAL_FORM_STEPS.slice(0, targetIndex).every((step) => canProceed(step, form))
}

export const resolveExternalFormTargetUserId = ({
  pathname,
  searchParams,
  session,
}: {
  pathname: string
  searchParams: URLSearchParams
  session: SessionSnapshot | null
}) => {
  const searchUserId = searchParams.get('user_id') ?? searchParams.get('userId')
  const parsedSearch = Number(searchUserId)

  if (Number.isFinite(parsedSearch) && parsedSearch > 0) {
    return parsedSearch
  }

  const pathSegments = pathname.split('/').filter(Boolean)
  const lastSegment = pathSegments[pathSegments.length - 1] ?? ''
  const parsedPathUserId = Number(lastSegment)

  if (Number.isFinite(parsedPathUserId) && parsedPathUserId > 0) {
    return parsedPathUserId
  }

  const sessionUserId = Number(
    session?.user?.id ??
      (session as { userId?: string | number | null } | null)?.userId ??
      -1,
  )

  if (Number.isFinite(sessionUserId) && sessionUserId > 0) {
    return sessionUserId
  }

  return -1
}
