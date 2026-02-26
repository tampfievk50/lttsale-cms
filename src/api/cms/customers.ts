import { request, DEFAULT_PAGE_SIZE } from '../client'
import type { ListResponse } from '../client'

export const customersClient = {
  getAll: (params?: { buildingId?: string; search?: string }) => {
    const searchParams = new URLSearchParams()
    searchParams.set('page', '1')
    searchParams.set('size', String(DEFAULT_PAGE_SIZE))
    if (params?.buildingId) searchParams.set('buildingId', params.buildingId)
    if (params?.search) searchParams.set('search', params.search)
    return request<ListResponse<{
      id: string
      name: string
      address: string
      buildingId: string
      building?: { id: string; name: string }
      phoneNumber: string
      image: string
      createdAt: string
      updatedAt: string
    }>>(`/v1/customers?${searchParams.toString()}`)
  },
  getById: (id: string) => request<{
    id: string
    name: string
    address: string
    buildingId: string
    building?: { id: string; name: string }
    phoneNumber: string
    image: string
    createdAt: string
    updatedAt: string
  }>(`/v1/customers/${id}`),
  getByBuilding: (buildingId: string) => request<ListResponse<{
    id: string
    name: string
    address: string
    buildingId: string
    phoneNumber: string
    image: string
    createdAt: string
    updatedAt: string
  }>>(`/v1/customers/building/${buildingId}`),
  create: (data: {
    name: string
    address: string
    buildingId?: string
    phoneNumber?: string
    image?: string
  }) => request<{
    id: string
    name: string
    address: string
    buildingId: string
    phoneNumber: string
    image: string
    createdAt: string
    updatedAt: string
  }>('/api/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: {
    name?: string
    address?: string
    buildingId?: string
    phoneNumber?: string
    image?: string
  }) => request<{
    id: string
    name: string
    address: string
    buildingId: string
    phoneNumber: string
    image: string
    createdAt: string
    updatedAt: string
  }>(`/v1/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => request<void>(`/v1/customers/${id}`, { method: 'DELETE' }),
}
