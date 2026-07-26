import { useMemo, useState } from 'react'

import { useSendClientFormLink } from '@/features/order/api/clientFormLink.api'
import { useClientFormRecipientFieldsController } from '@/features/order/controllers/useClientFormRecipientFields.controller'
import { useMessageHandler } from '@shared-message-handler'

import type {
  SendClientFormLinkPopupPayload,
} from '../state/sendClientFormLink.types'

export const useSendClientFormLinkFormController = ({
  payload,
  onSuccess,
}: {
  payload: SendClientFormLinkPopupPayload
  onSuccess?: () => void
}) => {
  const sendClientFormLink = useSendClientFormLink()
  const { showMessage } = useMessageHandler()
  const recipientsController = useClientFormRecipientFieldsController({
    initialEmail: payload.initialEmail,
    initialPhone: payload.initialPhone,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canSubmit =
    payload.hasGeneratedLink &&
    recipientsController.canSubmit &&
    !isSubmitting

  const disabledReason = useMemo(() => {
    if (!payload.hasGeneratedLink) {
      return 'Generate a client form link before sending it.'
    }
    return recipientsController.disabledReason
  }, [payload.hasGeneratedLink, recipientsController.disabledReason])

  const handleSubmit = async () => {
    if (!canSubmit) {
      if (disabledReason) {
        showMessage({ status: 400, message: disabledReason })
      }
      return
    }

    setIsSubmitting(true)
    try {
      await sendClientFormLink(payload.orderId, recipientsController.recipients)
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
    formState: {
      email: recipientsController.email,
      phone: recipientsController.phone,
    },
    isSubmitting,
    canSubmit,
    disabledReason,
    handleEmailChange: recipientsController.setEmail,
    handlePhoneChange: recipientsController.setPhone,
    handleSubmit,
  }
}
