import { request, DEFAULT_PAGE_SIZE } from '../client'
import type { ListResponse } from '../client'

export const categoriesClient = {
  getAll: (params?: { search?: string }) => {
    const searchParams = new URLSearchParams()
    searchParams.set('page', '1')
    searchParams.set('size', String(DEFAULT_PAGE_SIZE))
    if (params?.search) searchParams.set('search', params.search)
    return request<ListResponse<{ id: string; name: string; createdAt: string; updatedAt: string }>>(`/api/categories?${searchParams.toString()}`)
  },
  getById: (id: string) => request<{ id: string; name: string; createdAt: string; updatedAt: string }>(`/api/categories/${id}`),
  create: (data: { name: string }) => request<{ id: string; name: string; createdAt: string; updatedAt: string }>('/api/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: { name: string }) => request<{ id: string; name: string; createdAt: string; updatedAt: string }>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => request<void>(`/api/categories/${id}`, { method: 'DELETE' }),
}
