export function requestError(e: any): string {
 const errors=e.response?.data?.errors
 return errors ? Object.values(errors).flat().join('\n') : e.response?.data?.message || 'Could not complete the request. Please retry.'
}
export const money=(value: unknown)=>'AED '+Number(value||0).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2})
