import type { EntityTable } from "@shared-store"
import { createEntityStore } from "@shared-store"
import { selectAll, selectByClientId, selectByServerId } from "@shared-store"

import type { PrintTemplate, PrintTemplateMap } from '../types'
import { useShallow } from 'zustand/react/shallow'

export const usePrintTemplateStore = createEntityStore<PrintTemplate>()

export const selectAllPrintTemplates = (state: EntityTable<PrintTemplate>) =>
  selectAll<PrintTemplate>()(state)

export const selectPrintTemplateByClientId = (clientId: string | null | undefined) =>
  (state: EntityTable<PrintTemplate>) =>
    selectByClientId<PrintTemplate>(clientId)(state)

export const selectPrintTemplateByServerId = (id: number | null | undefined) =>
  (state: EntityTable<PrintTemplate>) =>
    selectByServerId<PrintTemplate>(id)(state)

export const selectTemplateByEventAndChannel = (
  event: PrintTemplate['event'],
  channel: PrintTemplate['channel'],
  templates: PrintTemplate[],
) => templates.find((template) => template.event === event && template.channel === channel)

export const insertPrintTemplate = (document: PrintTemplate) =>
  usePrintTemplateStore.getState().insert(document)

export const insertPrintTemplates = (table: { byClientId: Record<string, PrintTemplate>; allIds: string[] }) =>
  usePrintTemplateStore.getState().insertMany(table)

export const upsertPrintTemplate = (document: PrintTemplate) => {
  const state = usePrintTemplateStore.getState()
  if (state.byClientId[document.client_id]) {
    state.update(document.client_id, (existing) => ({ ...existing, ...document }))
    return
  }
  state.insert(document)
}


export const upsertPrintTemplates = (table: PrintTemplateMap) => {
  table.allIds.forEach((clientId) => {
    const document = table.byClientId[clientId]
    if (document) {
      upsertPrintTemplate(document)
    }
  })
}


export const usePrintTemplates = ()=> usePrintTemplateStore( useShallow(selectAllPrintTemplates) )
    

export const updatePrintTemplate = (clientId: string, updater: (document: PrintTemplate) => PrintTemplate) =>
  usePrintTemplateStore.getState().update(clientId, updater)



export const removePrintTemplate = (clientId: string) =>
  usePrintTemplateStore.getState().remove(clientId)

export const clearPrintTemplates = () =>
  usePrintTemplateStore.getState().clear()
