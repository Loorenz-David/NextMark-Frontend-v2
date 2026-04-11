import type { Item } from '../../../item'
import { itemsForDownloading } from '../../../item'
import { normalizeFormStateForSave } from '../../../api/mappers/orderForm.normalize'
import type { useDownloadTemplateByEventFlow } from '@/features/templates/printDocument/flows'

import type { OrderFormSubmitResult } from './orderFormSubmit.controller'

export const mapSubmitResultToFeedback = (result: OrderFormSubmitResult) => {
  if (result.status === 'success_create') {
    return {
      status: 200,
      message: 'Order successfully created.',
      shouldClosePopup: true,
    } as const
  }

  if (result.status === 'success_edit') {
    return {
      status: 200,
      message: 'Order successfully updated.',
      shouldClosePopup: true,
    } as const
  }

  if (result.status === 'no_changes') {
    return {
      status: 400,
      message: 'No changes to save.',
      shouldClosePopup: false,
    } as const
  }

  if (result.status === 'validation_error' || result.status === 'dependency_error') {
    return {
      status: 400,
      message: result.message,
      shouldClosePopup: false,
    } as const
  }

  return {
    status: 500,
    message: result.message,
    shouldClosePopup: false,
  } as const
}

export const presentOrderFormSubmitOutcome = ({
  result,
  createdItems,
  normalizedCurrent,
  closePopup,
  showMessage,
  downloadByEvent,
}: {
  result: OrderFormSubmitResult
  createdItems: Item[]
  normalizedCurrent: ReturnType<typeof normalizeFormStateForSave>
  closePopup: () => void
  showMessage: (payload: { status: number; message: string }) => void
  downloadByEvent: ReturnType<typeof useDownloadTemplateByEventFlow>['downloadByEvent']
}) => {
  const feedback = mapSubmitResultToFeedback(result)

  if (result.status === 'success_create' && createdItems.length > 0) {
    downloadByEvent({
      channel: 'item',
      event: 'item_created',
      data: itemsForDownloading(
        createdItems,
        normalizedCurrent?.reference_number,
        normalizedCurrent?.delivery_plan_id,
      ),
      fileName: 'first test',
    })
  }

  showMessage({ status: feedback.status, message: feedback.message })
  if (feedback.shouldClosePopup) {
    closePopup()
  }
}
