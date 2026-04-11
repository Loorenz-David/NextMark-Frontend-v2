import { apiClient } from '@/lib/api/ApiClient'
import type { PrintTemplate, PrintTemplateMap } from '../types'
import type { ApiResult } from '@/lib/api/types'



export type PrintTemplateResponse = {
  label_templates: PrintTemplateMap
}

export type SavePrintTemplateResponse = {
    label_templates: Record<string,Partial<PrintTemplate>>
}

export type UpdatePrintOrder = Partial<PrintTemplate>


export const listPrintTemplates = (): Promise<ApiResult<PrintTemplateResponse>> =>
    apiClient.request<PrintTemplateResponse>({
        path:'/label_templates/',
        method: 'GET',
        query:{}
    })

export const createPrintTemplate = (data:PrintTemplate): Promise<ApiResult<SavePrintTemplateResponse>> =>
    apiClient.request<SavePrintTemplateResponse>({
        path:'/label_templates/',
        method: 'PUT',
        data
    })

export const updateStatePrintTemplate = (
  template_id:number,
  data:UpdatePrintOrder,
): Promise<ApiResult<Record<string, never>>> =>
    apiClient.request<Record<string, never>>({
        path:'/label_templates/',
        method: 'PATCH',
        data: {
            target: {
                target_id: template_id,
                fields: data
            }
        }
    })


