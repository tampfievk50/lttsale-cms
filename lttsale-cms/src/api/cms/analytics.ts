import { request } from '../client'

export const analyticsClient = {
  getOrders: (params?: { dateFrom?: string; dateTo?: string; customerId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom)
    if (params?.dateTo) searchParams.set('dateTo', params.dateTo)
    if (params?.customerId) searchParams.set('customerId', params.customerId)
    const query = searchParams.toString()
    return request<{
      totalOrders: number
      totalRevenue: number
      totalProfit: number
      averageOrderValue: number
      pendingOrders: number
      confirmedOrders: number
      preparingOrders: number
      shippedOrders: number
      deliveredOrders: number
      cancelledOrders: number
      paidOrders: number
      unpaidOrders: number
      paidAmount: number
      unpaidAmount: number
    }>(`/api/analytics${query ? `?${query}` : ''}`)
  },
}
