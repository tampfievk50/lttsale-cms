import { create } from 'zustand'
import type { SsoUser, Role } from '@/types'
import { ssoApi } from '@/api'

interface UsersManagementState {
  users: SsoUser[]
  roles: Role[]
  loading: boolean
  error: string | null

  fetchUsers: (search?: string) => Promise<void>
  fetchRoles: () => Promise<void>
  createUser: (data: {
    username: string
    email: string
    password: string
    first_name?: string
    last_name?: string
    gender?: number
    is_active?: boolean
    is_supper?: boolean
  }) => Promise<void>
  updateUser: (id: number, data: {
    first_name?: string
    last_name?: string
    gender?: number
    is_active?: boolean
  }) => Promise<void>
  deleteUser: (id: number) => Promise<void>
  getUserRoles: (id: number) => Promise<Role[]>
  assignRoles: (userId: number, roleIds: number[], domainId: number) => Promise<void>
  removeRole: (userId: number, roleId: number, domainId: number) => Promise<void>
}

export const useUsersManagementStore = create<UsersManagementState>()((set) => ({
  users: [],
  roles: [],
  loading: false,
  error: null,

  fetchUsers: async (search?: string) => {
    set({ loading: true, error: null })
    try {
      const users = await ssoApi.getUsers({ search, limit: 1000 })
      set({ users: Array.isArray(users) ? users : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchRoles: async () => {
    try {
      const roles = await ssoApi.getRoles({ limit: 1000 })
      set({ roles: Array.isArray(roles) ? roles : [] })
    } catch {
      // silent
    }
  },

  createUser: async (data) => {
    set({ loading: true, error: null })
    try {
      await ssoApi.createUser(data)
      // Refresh list
      const users = await ssoApi.getUsers({ limit: 1000 })
      set({ users: Array.isArray(users) ? users : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  updateUser: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await ssoApi.updateUser(id, data)
      const users = await ssoApi.getUsers({ limit: 1000 })
      set({ users: Array.isArray(users) ? users : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null })
    try {
      await ssoApi.deleteUser(id)
      const users = await ssoApi.getUsers({ limit: 1000 })
      set({ users: Array.isArray(users) ? users : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  getUserRoles: async (id) => {
    try {
      const roles = await ssoApi.getUserRoles(id)
      return Array.isArray(roles) ? roles : []
    } catch {
      return []
    }
  },

  assignRoles: async (userId, roleIds, domainId) => {
    set({ loading: true, error: null })
    try {
      await ssoApi.assignRoles(userId, { roles: roleIds, domain_id: domainId })
      set({ loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  removeRole: async (userId, roleId, domainId) => {
    set({ loading: true, error: null })
    try {
      await ssoApi.removeRole(userId, { role_id: roleId, domain_id: domainId })
      set({ loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },
}))
