import { useMemo, useState } from 'react'

import { DEFAULT_PREFIX } from '@/constants/dropDownOptions'
import { useSendClientFormLink } from '@/features/order/api/clientFormLink.api'
import { useOrderValidation } from '@/features/order/domain/useOrderValidation'
import { useMessageHandler } from '@shared-message-handler'

import type {
  SendClientFormLinkFormState,
  SendClientFormLinkPopupPayload,
} from '../state/sendClientFormLink.types'

const normalizeEmail = (value: string) => {
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const normalizePhone = (state: SendClientFormLinkFormState['phone']) => {
  const number = state.number.trim()
  if (!number) {
    return null
  }

  return {
    prefix: state.prefix || DEFAULT_PREFIX,
    number,
  }
}

export const useSendClientFormLinkFormController = ({
  payload,
  onSuccess,
}: {
  payload: SendClientFormLinkPopupPayload
  onSuccess?: () => void
}) => {
  const sendClientFormLink = useSendClientFormLink()
  const { validateCustomerEmail, validatePhone } = useOrderValidation()
  const { showMessage } = useMessageHandler()

  const [formState, setFormState] = useState<SendClientFormLinkFormState>({
    email: payload.initialEmail ?? '',
    phone: payload.initialPhone ?? { prefix: DEFAULT_PREFIX, number: '' },
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const normalizedEmail = normalizeEmail(formState.email)
  const normalizedPhone = normalizePhone(formState.phone)
  const isEmailValid = normalizedEmail == null || validateCustomerEmail(normalizedEmail)
  const isPhoneValid = normalizedPhone == null || validatePhone(normalizedPhone)
  const hasReachableTarget = normalizedEmail != null || normalizedPhone != null
  const canSubmit =
    payload.hasGeneratedLink &&
    hasReachableTarget &&
    isEmailValid &&
    isPhoneValid &&
    !isSubmitting

  const disabledReason = useMemo(() => {
    if (!payload.hasGeneratedLink) {
      return 'Generate a client form link before sending it.'
    }
    if (!hasReachableTarget) {
      return 'Add an email or phone number to send the link.'
    }
    if (!isEmailValid || !isPhoneValid) {
      return 'Fix the contact fields before sending.'
    }
    return null
  }, [hasReachableTarget, isEmailValid, isPhoneValid, payload.hasGeneratedLink])

  const handleEmailChange = (value: string) => {
    setFormState((prev) => ({ ...prev, email: value }))
  }

  const handlePhoneChange = (phone: SendClientFormLinkFormState['phone']) => {
    setFormState((prev) => ({ ...prev, phone }))
  }

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (disabledReason) {
        showMessage({ status: 400, message: disabledReason })
      }
      return
    }

    setIsSubmitting(true)
    try {
      await sendClientFormLink(payload.orderId, {
        email: normalizedEmail,
        phone: normalizedPhone,
      })
      showMessage({ status: 200, message: 'Client form link sent.' })
      onSuccess?.()
    } catch (error) {
      showMessage({
        status: 500,
        message: error instanceof Error ? error.message : 'Unable to send client form link.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formState,
    isSubmitting,
    canSubmit,
    disabledReason,
    handleEmailChange,
    handlePhoneChange,
    handleSubmit,
  }
}
