import { request, DEFAULT_PAGE_SIZE } from '../client'
import type { ListResponse } from '../client'

export const productsClient = {
  getAll: (params?: { categoryId?: string; isPublished?: boolean; search?: string }) => {
    const searchParams = new URLSearchParams()
    searchParams.set('page', '1')
    searchParams.set('size', String(DEFAULT_PAGE_SIZE))
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId)
    if (params?.isPublished !== undefined) searchParams.set('isPublished', String(params.isPublished))
    if (params?.search) searchParams.set('search', params.search)
    return request<ListResponse<{
      id: string
      sku: string
      name: string
      description: string
      price: number
      costPrice: number
      categoryId: string
      category?: { id: string; name: string }
      image: string
      stockQty: number
      lowStockThreshold: number
      trackInventory: boolean
      isLowStock: boolean
      isPublished: boolean
      createdAt: string
      updatedAt: string
    }>>(`/api/products?${searchParams.toString()}`)
  },
  getById: (id: string) => request<{
    id: string
    sku: string
    name: string
    description: string
    price: number
    costPrice: number
    categoryId: string
    category?: { id: string; name: string }
    image: string
    stockQty: number
    lowStockThreshold: number
    trackInventory: boolean
    isLowStock: boolean
    isPublished: boolean
    createdAt: string
    updatedAt: string
  }>(`/api/products/${id}`),
  create: (data: {
    name: string
    description?: string
    price: number
    categoryId?: string
    image?: string
    isPublished?: boolean
  }) => request<{
    id: string
    name: string
    description: string
    price: number
    categoryId: string
    image: string
    isPublished: boolean
    createdAt: string
    updatedAt: string
  }>('/api/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: {
    name?: string
    description?: string
    price?: number
    categoryId?: string
    image?: string
    isPublished?: boolean
  }) => request<{
    id: string
    name: string
    description: string
    price: number
    categoryId: string
    image: string
    isPublished: boolean
    createdAt: string
    updatedAt: string
  }>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => request<void>(`/api/products/${id}`, { method: 'DELETE' }),
  togglePublished: (id: string) => request<{
    id: string
    name: string
    description: string
    price: number
    categoryId: string
    image: string
    isPublished: boolean
    createdAt: string
    updatedAt: string
  }>(`/api/products/${id}/toggle-published`, { method: 'PATCH' }),
}
