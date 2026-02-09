import { create } from 'zustand'
import type { Role, Permission, Policy } from '@/types'
import { ssoApi } from '@/api'

interface RolesManagementState {
  roles: Role[]
  permissions: Permission[]
  policies: Policy[]
  loading: boolean
  error: string | null

  fetchRoles: () => Promise<void>
  createRole: (data: { name: string; description?: string }) => Promise<void>
  updateRole: (id: number, data: { name?: string; description?: string }) => Promise<void>
  deleteRole: (id: number) => Promise<void>

  fetchPermissions: () => Promise<void>
  createPermission: (data: { name: string; description?: string; path: string; action: string }) => Promise<void>
  updatePermission: (id: number, data: { name?: string; description?: string; path?: string; action?: string }) => Promise<void>
  deletePermission: (id: number) => Promise<void>

  fetchPolicies: (roleId?: string) => Promise<void>
  fetchRolePolicies: (roleId: number) => Promise<Policy[]>
  addPolicy: (data: { roles: number[]; domain_id: number; path: string; action: string; access: string }) => Promise<void>
  removePolicy: (data: { role_id: string; domain_id: string; path: string; action: string }) => Promise<void>
}

export const useRolesManagementStore = create<RolesManagementState>()((set) => ({
  roles: [],
  permissions: [],
  policies: [],
  loading: false,
  error: null,

  fetchRoles: async () => {
    set({ loading: true, error: null })
    try {
      const roles = await ssoApi.getRoles({ limit: 1000 })
      set({ roles: Array.isArray(roles) ? roles : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createRole: async (data) => {
    set({ loading: true, error: null })
    try {
      await ssoApi.createRole(data)
      const roles = await ssoApi.getRoles({ limit: 1000 })
      set({ roles: Array.isArray(roles) ? roles : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  updateRole: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await ssoApi.updateRole(id, data)
      const roles = await ssoApi.getRoles({ limit: 1000 })
      set({ roles: Array.isArray(roles) ? roles : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  deleteRole: async (id) => {
    set({ loading: true, error: null })
    try {
      await ssoApi.deleteRole(id)
      const roles = await ssoApi.getRoles({ limit: 1000 })
      set({ roles: Array.isArray(roles) ? roles : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchPermissions: async () => {
    set({ loading: true, error: null })
    try {
      const permissions = await ssoApi.getPermissions({ limit: 1000 })
      set({ permissions: Array.isArray(permissions) ? permissions : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  createPermission: async (data) => {
    set({ loading: true, error: null })
    try {
      await ssoApi.createPermission(data)
      const permissions = await ssoApi.getPermissions({ limit: 1000 })
      set({ permissions: Array.isArray(permissions) ? permissions : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  updatePermission: async (id, data) => {
    set({ loading: true, error: null })
    try {
      await ssoApi.updatePermission(id, data)
      const permissions = await ssoApi.getPermissions({ limit: 1000 })
      set({ permissions: Array.isArray(permissions) ? permissions : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  deletePermission: async (id) => {
    set({ loading: true, error: null })
    try {
      await ssoApi.deletePermission(id)
      const permissions = await ssoApi.getPermissions({ limit: 1000 })
      set({ permissions: Array.isArray(permissions) ? permissions : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchPolicies: async (roleId) => {
    set({ loading: true, error: null })
    try {
      const policies = await ssoApi.getPolicies(roleId ? { role_id: roleId } : undefined)
      set({ policies: Array.isArray(policies) ? policies : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  fetchRolePolicies: async (roleId) => {
    try {
      const policies = await ssoApi.getRolePolicies(roleId)
      return Array.isArray(policies) ? policies : []
    } catch {
      return []
    }
  },

  addPolicy: async (data) => {
    set({ loading: true, error: null })
    try {
      await ssoApi.addPolicy(data)
      const policies = await ssoApi.getPolicies()
      set({ policies: Array.isArray(policies) ? policies : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },

  removePolicy: async (data) => {
    set({ loading: true, error: null })
    try {
      await ssoApi.removePolicy(data)
      const policies = await ssoApi.getPolicies()
      set({ policies: Array.isArray(policies) ? policies : [], loading: false })
    } catch (e) {
      set({ error: (e as Error).message, loading: false })
    }
  },
}))
