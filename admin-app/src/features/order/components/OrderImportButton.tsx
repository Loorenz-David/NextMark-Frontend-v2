import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useRef } from 'react'

import { useMessageHandler } from '@shared-message-handler'

import { useOrderImport } from '../controllers/orderImport.controller'

export type OrderImportControls = {
  triggerFileInput: () => void
  loading: boolean
  disabled: boolean
}

type OrderImportButtonProps = {
  planId?: number | null
  onReady?: (controls: OrderImportControls) => void
  maxFileSizeMb?: number
}

const DEFAULT_MAX_FILE_SIZE_MB = 10

export const OrderImportButton = ({
  planId,
  onReady,
  maxFileSizeMb = DEFAULT_MAX_FILE_SIZE_MB,
}: OrderImportButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { showMessage } = useMessageHandler()
  const { uploadCsv, loading } = useOrderImport(planId)
  const disabled = loading || typeof planId !== 'number'

  const triggerFileInput = useCallback(() => {
    if (disabled) return
    fileInputRef.current?.click()
  }, [disabled])

  useEffect(() => {
    if (!onReady) return
    onReady({ triggerFileInput, loading, disabled })
  }, [disabled, loading, onReady, triggerFileInput])

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''

      if (!file) {
        showMessage({ status: 400, message: 'Please select a CSV file.' })
        return
      }

      const isCsv = file.name.toLowerCase().endsWith('.csv')
      if (!isCsv) {
        showMessage({ status: 400, message: 'Only CSV files are allowed.' })
        return
      }

      const maxBytes = maxFileSizeMb * 1024 * 1024
      if (file.size > maxBytes) {
        showMessage({ status: 400, message: `CSV file must be ${maxFileSizeMb}MB or smaller.` })
        return
      }

      await uploadCsv(file)
    },
    [maxFileSizeMb, showMessage, uploadCsv],
  )

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept=".csv"
      className="hidden"
      onChange={(event) => {
        void handleFileChange(event)
      }}
    />
  )
}
