import { request, DEFAULT_PAGE_SIZE } from '../client'
import type { ListResponse } from '../client'

export const apartmentsClient = {
  getAll: (params?: { search?: string }) => {
    const searchParams = new URLSearchParams()
    searchParams.set('page', '1')
    searchParams.set('size', String(DEFAULT_PAGE_SIZE))
    if (params?.search) searchParams.set('search', params.search)
    return request<ListResponse<{ id: string; name: string; createdAt: string; updatedAt: string }>>(`/api/apartments?${searchParams.toString()}`)
  },
  getById: (id: string) => request<{ id: string; name: string; createdAt: string; updatedAt: string }>(`/api/apartments/${id}`),
  create: (data: { name: string }) => request<{ id: string; name: string; createdAt: string; updatedAt: string }>('/api/apartments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: { name: string }) => request<{ id: string; name: string; createdAt: string; updatedAt: string }>(`/api/apartments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => request<void>(`/api/apartments/${id}`, { method: 'DELETE' }),
}
