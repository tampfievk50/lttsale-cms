import type { OrderStatusType } from '@/types'
import { request, DEFAULT_PAGE_SIZE } from '../client'
import type { ListResponse } from '../client'

// Order Item Response Type
export interface OrderItemResponse {
  id: string
  orderId: string
  productId: string
  productName: string
  productImage: string
  productCategory: string
  unitPrice: number
  quantity: number
  lineTotal: number
  note: string
  createdAt: string
}

// Order Response Type (enhanced)
export interface OrderResponse {
  id: string
  orderNumber: number
  customerId: string
  customer?: {
    id: string
    name: string
    address: string
    phoneNumber: string
    buildingId?: string
    image?: string
  }
  status: OrderStatusType
  paymentStatus: string
  items: OrderItemResponse[]
  itemCount: number
  subtotal: number
  discount: number
  discountReason: string
  shippingFee: number
  totalPrice: number
  note: string
  deliveryImage: string
  paidAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  cancelReason: string
  createdAt: string
  updatedAt: string
}

// Order Status History Response
export interface OrderStatusHistoryResponse {
  id: string
  orderId: string
  fromStatus: string
  toStatus: string
  changedBy: string
  note: string
  createdAt: string
}

export const ordersClient = {
  getAll: (params?: {
    dateFrom?: string
    dateTo?: string
    status?: OrderStatusType
    isPaid?: boolean
    customerId?: string
    search?: string
  }) => {
    const searchParams = new URLSearchParams()
    searchParams.set('page', '1')
    searchParams.set('size', String(DEFAULT_PAGE_SIZE))
    if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom)
    if (params?.dateTo) searchParams.set('dateTo', params.dateTo)
    if (params?.status) searchParams.set('status', params.status)
    if (params?.isPaid !== undefined) searchParams.set('isPaid', String(params.isPaid))
    if (params?.customerId) searchParams.set('customerId', params.customerId)
    if (params?.search) searchParams.set('search', params.search)
    const query = searchParams.toString()
    return request<ListResponse<OrderResponse>>(`/api/orders${query ? `?${query}` : ''}`)
  },

  getById: (id: string) => request<OrderResponse>(`/api/orders/${id}`),

  // Create order with multiple items (new format)
  create: (data: {
    customerId: string
    items: Array<{
      productId: string
      quantity: number
      unitPrice?: number
      note?: string
    }>
    discount?: number
    discountReason?: string
    shippingFee?: number
    note?: string
  }) => request<OrderResponse>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Create order with single product (legacy format)
  createLegacy: (data: {
    productId: string
    quantity: number
    customerId: string
    note?: string
    totalPrice?: number
  }) => request<OrderResponse>('/api/orders/legacy', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: string, data: {
    customerId?: string
    items?: Array<{
      productId: string
      quantity: number
      unitPrice?: number
      note?: string
    }>
    discount?: number
    discountReason?: string
    shippingFee?: number
    note?: string
    deliveryImage?: string
    totalPrice?: number
  }) => request<OrderResponse>(`/api/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  delete: (id: string) => request<void>(`/api/orders/${id}`, { method: 'DELETE' }),

  // Status workflow
  updateStatus: (id: string, data: { status: OrderStatusType; note?: string }) =>
    request<OrderResponse>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  cancel: (id: string, reason: string) =>
    request<OrderResponse>(`/api/orders/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  markPaid: (id: string, data?: { paidAt?: string; note?: string }) =>
    request<OrderResponse>(`/api/orders/${id}/paid`, {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }),

  // Order items management
  addItem: (orderId: string, data: {
    productId: string
    quantity: number
    unitPrice?: number
    note?: string
  }) => request<OrderResponse>(`/api/orders/${orderId}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  removeItem: (orderId: string, itemId: string) =>
    request<OrderResponse>(`/api/orders/${orderId}/items/${itemId}`, {
      method: 'DELETE',
    }),

  // Status history
  getHistory: (id: string) =>
    request<OrderStatusHistoryResponse[]>(`/api/orders/${id}/history`),

  // Legacy toggle methods (backward compatibility)
  toggleDelivered: (id: string) => request<OrderResponse>(`/api/orders/${id}/toggle-delivered`, { method: 'PATCH' }),
  togglePaid: (id: string) => request<OrderResponse>(`/api/orders/${id}/toggle-paid`, { method: 'PATCH' }),
}
