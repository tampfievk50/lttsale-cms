import { create } from 'zustand'
import { ssoApi, setAccessToken, setRefreshToken, clearTokens, getAccessToken, decodeJwtPayload } from '@/api'
import type { Permission } from '@/types'

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  userPermissions: string[] // "METHOD /path" strings

  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  fetchCurrentUser: () => Promise<void>
  fetchUserPermissions: () => Promise<void>
  updateProfile: (data: { name?: string; phone?: string }) => Promise<boolean>
  checkAuth: () => boolean
  hasPermission: (method: string, path: string) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  userPermissions: [],

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null })
    try {
      const response = await ssoApi.login(email, password)
      setAccessToken(response.accessToken)
      setRefreshToken(response.refreshToken)
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      })
      return true
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
        isAuthenticated: false,
      })
      return false
    }
  },

  logout: () => {
    clearTokens()
    set({
      user: null,
      isAuthenticated: false,
      error: null,
      userPermissions: [],
    })
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true })
    try {
      const token = getAccessToken()
      if (!token) throw new Error('No access token')

      const claims = decodeJwtPayload(token)
      const uid = String(claims.uid ?? '')
      if (!uid) throw new Error('Invalid token: missing uid')

      // Check token expiration
      const exp = Number(claims.exp)
      if (exp && exp * 1000 < Date.now()) {
        throw new Error('Token expired')
      }

      const user: User = {
        id: uid,
        name: String(claims.username ?? ''),
        email: '', // not in JWT, will be set from login
        phone: '',
        role: (claims.isSuper === true) ? 'super_admin' : 'user',
        isActive: true,
      }

      // Preserve email from previous login if available
      const currentUser = get().user
      if (currentUser?.email) {
        user.email = currentUser.email
      }

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      clearTokens()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        userPermissions: [],
      })
      throw error
    }
  },

  fetchUserPermissions: async () => {
    const token = getAccessToken()
    if (!token) return

    const claims = decodeJwtPayload(token)
    const uid = Number(claims.uid)
    if (!uid) return

    try {
      const permissions: Permission[] = await ssoApi.getUserPermissions(uid)
      const permStrings = Array.isArray(permissions)
        ? permissions.map((p) => `${p.action} ${p.path}`)
        : []
      set({ userPermissions: permStrings })
    } catch {
      // Non-critical: user just won't see admin items
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const user = await ssoApi.updateMe(data)
      set({
        user,
        isLoading: false,
      })
      return true
    } catch (error) {
      set({
        error: (error as Error).message,
        isLoading: false,
      })
      return false
    }
  },

  checkAuth: () => {
    const token = getAccessToken()
    if (token) {
      get().fetchCurrentUser()
      return true
    }
    return false
  },

  hasPermission: (method: string, path: string) => {
    const { user, userPermissions } = get()
    // Super admin has all permissions
    if (user?.role === 'super_admin') return true
    // Check for exact match or wildcard method
    return userPermissions.some(
      (p) => p === `${method} ${path}` || p === `* ${path}`
    )
  },
}))
