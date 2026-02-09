import { SSO_API_URL, decodeJwtPayload, getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from './client'
import type { SsoUser, Role, Permission, Policy, Resource } from '@/types'

// Refresh SSO access token using refresh token
async function refreshSsoToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false
  try {
    const response = await fetch(`${SSO_API_URL}/v1/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!response.ok) return false
    const json = await response.json()
    const data = json?.data ?? json
    if (!data?.access_token) return false
    setAccessToken(data.access_token)
    setRefreshToken(data.refresh_token)
    return true
  } catch {
    return false
  }
}

// Helper for SSO authenticated requests
async function ssoRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  if (!token) throw new Error('No access token')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers as Record<string, string>),
  }

  let response = await fetch(`${SSO_API_URL}${path}`, { ...options, headers })

  // On 401, try to refresh token and retry
  if (response.status === 401) {
    const refreshed = await refreshSsoToken()
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`
      response = await fetch(`${SSO_API_URL}${path}`, { ...options, headers })
    }
  }

  if (!response.ok) {
    const err = await response.json().catch(() => null)
    throw new Error(err?.msg || err?.message || `HTTP ${response.status}`)
  }

  if (response.status === 204) return {} as T

  const json = await response.json()

  // SSO returns HTTP 200 even for errors — check code in response body
  // Codes 200 and 201 are success; anything else is an error
  if (json?.code && json.code !== 200 && json.code !== 201) {
    throw new Error(json.msg || `SSO error ${json.code}`)
  }

  return (json?.data ?? json) as T
}

// SSO API methods
export const ssoApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${SSO_API_URL}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => null)
      throw new Error(err?.msg || err?.message || `Login failed`)
    }

    const json = await response.json()

    // SSO always returns HTTP 200 — check code in response body
    if (json?.code && json.code !== 200) {
      throw new Error(json.msg || 'Login failed')
    }

    // SSO envelope: {code, msg, data: {access_token, refresh_token}}
    const data = json?.data ?? json

    if (!data?.access_token) {
      throw new Error('Login failed: invalid credentials')
    }

    const accessToken: string = data.access_token
    const refreshToken: string = data.refresh_token

    // Decode JWT to build user object
    const claims = decodeJwtPayload(accessToken)
    const user = {
      id: String(claims.uid ?? ''),
      name: String(claims.username ?? ''),
      email: email,
      phone: '',
      role: (claims.isSuper === true) ? 'super_admin' : 'user',
      isActive: true,
    }

    return { accessToken, refreshToken, user }
  },

  logout: async () => {
    // Client-side only — just clear tokens
    clearTokens()
  },

  me: async () => {
    const token = getAccessToken()
    if (!token) throw new Error('No access token')

    const claims = decodeJwtPayload(token)
    const uid = String(claims.uid ?? '')
    if (!uid) throw new Error('Invalid token: missing uid')

    const data = await ssoRequest<Record<string, unknown>>(`/v1/account/${uid}`)

    // Re-read claims after potential token refresh
    const freshClaims = decodeJwtPayload(getAccessToken()!)

    return {
      id: String(data.id ?? data.uid ?? uid),
      name: (data.username ?? data.name ?? '') as string,
      email: (data.email ?? '') as string,
      phone: (data.phone ?? data.mobile ?? '') as string,
      role: (freshClaims.isSuper === true) ? 'super_admin' : 'user',
      isActive: data.status !== 0,
    }
  },

  updateMe: async (updateData: { name?: string; phone?: string }) => {
    const token = getAccessToken()
    if (!token) throw new Error('No access token')

    const claims = decodeJwtPayload(token)
    const uid = String(claims.uid ?? '')
    if (!uid) throw new Error('Invalid token: missing uid')

    const data = await ssoRequest<Record<string, unknown>>(`/v1/account/${uid}`, {
      method: 'PUT',
      body: JSON.stringify({
        username: updateData.name,
        phone: updateData.phone,
      }),
    })

    const freshClaims = decodeJwtPayload(getAccessToken()!)

    return {
      id: String(data.id ?? data.uid ?? uid),
      name: (data.username ?? data.name ?? '') as string,
      email: (data.email ?? '') as string,
      phone: (data.phone ?? data.mobile ?? '') as string,
      role: (freshClaims.isSuper === true) ? 'super_admin' : 'user',
      isActive: data.status !== 0,
    }
  },

  // --- Admin: Users ---
  getUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('pageSize', String(params.limit))
    if (params?.search) searchParams.set('search', params.search)
    const query = searchParams.toString()
    return ssoRequest<SsoUser[]>(`/v1/account${query ? `?${query}` : ''}`)
  },

  getUser: (id: number) => ssoRequest<SsoUser>(`/v1/account/${id}`),

  createUser: (data: {
    username: string
    email: string
    password: string
    first_name?: string
    last_name?: string
    gender?: number
    is_active?: boolean
    is_supper?: boolean
  }) => ssoRequest<SsoUser>('/v1/account', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  updateUser: (id: number, data: {
    first_name?: string
    last_name?: string
    gender?: number
    is_active?: boolean
  }) => ssoRequest<SsoUser>(`/v1/account/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  deleteUser: (id: number) => ssoRequest<void>(`/v1/account/${id}`, { method: 'DELETE' }),

  getUserRoles: (id: number) => ssoRequest<Role[]>(`/v1/account/${id}/roles`),

  assignRoles: (id: number, data: { roles: number[]; domain_id: number }) =>
    ssoRequest<void>(`/v1/account/${id}/roles`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeRole: (id: number, data: { role_id: number; domain_id: number }) =>
    ssoRequest<void>(`/v1/account/${id}/roles`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    }),

  getUserPermissions: (id: number) =>
    ssoRequest<Permission[]>(`/v1/account/${id}/permissions`),

  // --- Admin: Roles ---
  getRoles: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('pageSize', String(params.limit))
    if (params?.search) searchParams.set('search', params.search)
    const query = searchParams.toString()
    return ssoRequest<Role[]>(`/v1/role${query ? `?${query}` : ''}`)
  },

  getRole: (id: number) => ssoRequest<Role>(`/v1/role/${id}`),

  createRole: (data: { name: string; description?: string }) =>
    ssoRequest<Role>('/v1/role', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRole: (id: number, data: { name?: string; description?: string }) =>
    ssoRequest<Role>(`/v1/role/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteRole: (id: number) => ssoRequest<void>(`/v1/role/${id}`, { method: 'DELETE' }),

  getRolePolicies: (id: number) => ssoRequest<Policy[]>(`/v1/role/${id}/policies`),

  // --- Admin: Permissions ---
  getPermissions: (params?: { page?: number; limit?: number; search?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('pageSize', String(params.limit))
    if (params?.search) searchParams.set('search', params.search)
    const query = searchParams.toString()
    return ssoRequest<Permission[]>(`/v1/permission${query ? `?${query}` : ''}`)
  },

  createPermission: (data: { name: string; description?: string; path: string; action: string }) =>
    ssoRequest<Permission>('/v1/permission', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updatePermission: (id: number, data: { name?: string; description?: string; path?: string; action?: string }) =>
    ssoRequest<Permission>(`/v1/permission/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deletePermission: (id: number) => ssoRequest<void>(`/v1/permission/${id}`, { method: 'DELETE' }),

  // --- Admin: Resources/Domains ---
  getResources: () => ssoRequest<Resource[]>('/v1/resource'),

  createResource: (data: { name: string; description: string }) =>
    ssoRequest<Resource>('/v1/resource', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateResource: (id: number, data: { name?: string; description?: string }) =>
    ssoRequest<Resource>(`/v1/resource/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteResource: (id: number) => ssoRequest<void>(`/v1/resource/${id}`, { method: 'DELETE' }),

  // --- Admin: Policies ---
  getPolicies: (params?: { role_id?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.role_id) searchParams.set('role_id', params.role_id)
    const query = searchParams.toString()
    return ssoRequest<Policy[]>(`/v1/policy${query ? `?${query}` : ''}`)
  },

  addPolicy: (data: { roles: number[]; domain_id: number; path: string; action: string; access: string }) =>
    ssoRequest<void>('/v1/policy', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removePolicy: (data: { role_id: string; domain_id: string; path: string; action: string }) =>
    ssoRequest<void>('/v1/policy', {
      method: 'DELETE',
      body: JSON.stringify(data),
    }),
}
