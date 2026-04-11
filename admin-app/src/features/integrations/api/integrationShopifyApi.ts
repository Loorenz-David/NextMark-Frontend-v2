import { useCallback } from 'react'

import { apiClient } from '@/lib/api/ApiClient'
import type { ApiResult } from '@/lib/api/types'

export type ShopifyIntegrationResponse ={
    auth_url:string
}

export type ShopifyIntegrationDetails = {
    id: number
    shop: string
    scopes: string
    connected_at: string | null
}

export const integrationShopifyApi = {
    connect: (shop:string): Promise<ApiResult<ShopifyIntegrationResponse>> =>
        apiClient.request<ShopifyIntegrationResponse>({
            path:'/shopify/connect',
            method:'GET',
            query:{shop}
        }),
    getDetails: (id: number): Promise<ApiResult<{ shopify: ShopifyIntegrationDetails }>> =>
        apiClient.request<{ shopify: ShopifyIntegrationDetails }>({
            path:`/shopify/${id}`,
            method:'GET'
        }),
    disconnect: (id: number): Promise<ApiResult<unknown>> =>
        apiClient.request<unknown>({
            path:`/shopify/${id}`,
            method:'DELETE'
        }),
}



export const useIntegrationShopifyApi = (shop:string) =>
    useCallback(()=> integrationShopifyApi.connect(shop), [])
