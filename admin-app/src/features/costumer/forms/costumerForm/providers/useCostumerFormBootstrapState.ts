import { useEffect, useMemo, useRef, useState } from 'react'

import { makeInitialFormCopy } from '@shared-domain'

import {
  buildCostumerFormInitialState,
  buildCostumerFormReinitKey,
  shouldReinitializeCostumerForm,
} from '../flows/costumerFormBootstrap.flow'
import type { Costumer } from '../../../dto/costumer.dto'
import type { CostumerFormMode, CostumerFormState } from '../state/CostumerForm.types'

export const useCostumerFormBootstrapState = ({
  mode,
  payloadClientId,
  costumer,
}: {
  mode: CostumerFormMode
  payloadClientId?: string | null
  costumer: Costumer | null
}) => {
  const initialFormRef = useRef<CostumerFormState | null>(null)
  const previousReinitKeyRef = useRef<string | null>(null)

  const [formState, setFormState] = useState<CostumerFormState>(() =>
    buildCostumerFormInitialState({
      mode,
      costumer,
    }),
  )

  const reinitKey = useMemo(
    () =>
      buildCostumerFormReinitKey({
        mode,
        payloadClientId,
        costumerServerId: costumer?.id ?? null,
      }),
    [costumer?.id, mode, payloadClientId],
  )

  useEffect(() => {
    if (!shouldReinitializeCostumerForm(previousReinitKeyRef.current, reinitKey)) {
      return
    }

    const nextState = buildCostumerFormInitialState({
      mode,
      costumer,
    })

    setFormState(nextState)
    makeInitialFormCopy(initialFormRef, nextState)
    previousReinitKeyRef.current = reinitKey
  }, [costumer, mode, reinitKey])

  return {
    formState,
    setFormState,
    initialFormRef,
  }
}
