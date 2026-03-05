export const calculateDiscount=(price:number, percentage:number)=>{
    return price * (percentage/100)
}

import createHttpError from 'http-errors'


export function validateNumericId(id: string | string[] | undefined): number {
    if (!id || Array.isArray(id)) {
        throw createHttpError(400, 'Invalid url param.')
    }
    const parsedId = Number(id)
    if (Number.isNaN(parsedId) || !Number.isInteger(parsedId)) {
        throw createHttpError(400, 'Invalid url param.')
    }
    return parsedId
}