const SSO_API_URL = import.meta.env.VITE_SSO_API_URL || 'http://localhost:9091'
const CMS_API_URL = import.meta.env.VITE_CMS_API_URL || 'http://localhost:8002'

// Token storage
const TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY)
export const setAccessToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)
export const setRefreshToken = (token: string) => localStorage.setItem(REFRESH_TOKEN_KEY, token)
export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

// Generic API response type
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// Backend list response wrapper
export interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}

// JWT payload decode helper
export function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return {}
    // base64url → base64 → decode
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return {}
  }
}

// Default pagination size to fetch all data
export const DEFAULT_PAGE_SIZE = 1000

// Exported SSO URL for sso.ts
export { SSO_API_URL }

// HTTP client helper
export async function request<T>(
  url: string,
  options: RequestInit = {},
  baseUrl: string = CMS_API_URL
): Promise<T> {
  const token = getAccessToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    // Try to refresh token
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      // Retry with new token
      headers['Authorization'] = `Bearer ${getAccessToken()}`
      const retryResponse = await fetch(`${baseUrl}${url}`, {
        ...options,
        headers,
      })
      if (!retryResponse.ok) {
        const error = await retryResponse.json().catch(() => ({ message: 'Request failed' }))
        throw new Error(error.message || `HTTP ${retryResponse.status}`)
      }
      const retryJson = await retryResponse.json()
      // Unwrap response envelope if present
      if (retryJson && typeof retryJson === 'object' && 'code' in retryJson && 'data' in retryJson) {
        if (Array.isArray(retryJson.data) && 'total' in retryJson && 'page' in retryJson && 'size' in retryJson) {
          return {
            items: retryJson.data,
            total: retryJson.total,
            page: retryJson.page,
            size: retryJson.size,
          } as T
        }
        return retryJson.data as T
      }
      return retryJson as T
    }
    // Redirect to login
    clearTokens()
    window.location.href = '/auth/login'
    throw new Error('Unauthorized')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  // Handle empty response (204 No Content)
  if (response.status === 204) {
    return {} as T
  }

  const json = await response.json()
  // Unwrap response envelope if present
  if (json && typeof json === 'object' && 'code' in json && 'data' in json) {
    if (Array.isArray(json.data) && 'total' in json && 'page' in json && 'size' in json) {
      return {
        items: json.data,
        total: json.total,
        page: json.page,
        size: json.size,
      } as T
    }
    return json.data as T
  }
  return json as T
}

async function refreshAccessToken(): Promise<boolean> {
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
    // SSO returns HTTP 200 even for errors — check code
    if (json?.code && json.code !== 200) return false
    // SSO envelope: {code, msg, data: {access_token, refresh_token}}
    const data = json.data ?? json
    if (!data?.access_token) return false
    setAccessToken(data.access_token)
    setRefreshToken(data.refresh_token)
    return true
  } catch {
    return false
  }
}
