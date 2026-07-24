import { useCallback, useMemo, useState } from 'react'

import { arrayMove } from '@dnd-kit/sortable'

import { useClientFormConfigActions } from '../actions/clientFormConfigPopups.action'
import { useReorderClientFormRulesAction } from '../actions/reorderClientFormRules.action'
import { useSaveClientFormRuleAction } from '../actions/saveClientFormRule.action'
import { filterRules, sortRulesByPosition } from '../domain/clientFormConfig.rules'
import { useClientFormRules } from '../store/clientFormConfig.selector'
import type { ClientFormRule } from '../types/clientFormRule'

export const useClientFormRulesController = () => {
  const rules = useClientFormRules()
  const actions = useClientFormConfigActions()
  const reorderRules = useReorderClientFormRulesAction()
  const { updateRule, deleteRule } = useSaveClientFormRuleAction()
  const [query, setQuery] = useState('')

  const ordered = useMemo(() => sortRulesByPosition(rules), [rules])
  const visible = useMemo(() => filterRules(ordered, query), [ordered, query])

  /**
   * The reorder endpoint rewrites the whole team list, so the move is applied to
   * `ordered` — never to the filtered view, which would drop the hidden rows.
   */
  const handleReorder = useCallback(
    (activeClientId: string, overClientId: string) => {
      if (activeClientId === overClientId) {
        return
      }

      const oldIndex = ordered.findIndex((rule) => rule.client_id === activeClientId)
      const newIndex = ordered.findIndex((rule) => rule.client_id === overClientId)
      if (oldIndex < 0 || newIndex < 0) {
        return
      }

      void reorderRules(arrayMove(ordered, oldIndex, newIndex))
    },
    [ordered, reorderRules],
  )

  const toggleEnabled = useCallback(
    (rule: ClientFormRule, enabled: boolean) => {
      void updateRule(rule, { enabled })
    },
    [updateRule],
  )

  const removeRule = useCallback(
    (rule: ClientFormRule) => {
      void deleteRule(rule)
    },
    [deleteRule],
  )

  return {
    rules: visible,
    // Dragging is meaningless while a search narrows the list.
    isReorderEnabled: query.trim().length === 0,
    query,
    setQuery,
    openCreate: () => actions.openRuleForm('create'),
    openEdit: (clientId: string) => actions.openRuleForm('edit', clientId),
    handleReorder,
    toggleEnabled,
    removeRule,
  }
}
