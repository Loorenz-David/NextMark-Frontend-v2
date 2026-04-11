import type { address } from '@/types/address'

export const validateAddress = (value: address | null) =>{
    const result =  Boolean(value?.street_address && value.street_address.trim().length > 0)

    return result
}