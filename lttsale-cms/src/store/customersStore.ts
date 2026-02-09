import { create } from 'zustand'
import type { Customer } from '@/types'
import { customersApi } from '@/api'

interface CustomersState {
  customers: Customer[]
  loading: boolean
  error: string | null
  fetchCustomers: (search?: string) => Promise<void>
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>
  updateCustomer: (id: string, customer: Partial<Customer>) => Promise<void>
  deleteCustomer: (id: string) => Promise<void>
  getCustomerById: (id: string) => Customer | undefined
  getCustomersByBuilding: (buildingId: string) => Customer[]
}

export const useCustomersStore = create<CustomersState>()((set, get) => ({
  customers: [],
  loading: false,
  error: null,

  fetchCustomers: async (search?: string) => {
    set({ loading: true, error: null })
    try {
      const response = await customersApi.getAll({ search })
      if (response.success) {
        set({ customers: response.data, loading: false })
      } else {
        set({ error: response.message || 'Failed to fetch customers', loading: false })
      }
    } catch {
      set({ error: 'Failed to fetch customers', loading: false })
    }
  },

  addCustomer: async (customer) => {
    set({ loading: true, error: null })
    try {
      const response = await customersApi.create(customer)
      if (response.success) {
        await get().fetchCustomers()
      } else {
        set({ error: response.message || 'Failed to add customer', loading: false })
      }
    } catch {
      set({ error: 'Failed to add customer', loading: false })
    }
  },

  updateCustomer: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const response = await customersApi.update(id, updates)
      if (response.success) {
        await get().fetchCustomers()
      } else {
        set({ error: response.message || 'Failed to update customer', loading: false })
      }
    } catch {
      set({ error: 'Failed to update customer', loading: false })
    }
  },

  deleteCustomer: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await customersApi.delete(id)
      if (response.success) {
        set((state) => ({
          customers: state.customers.filter((customer) => customer.id !== id),
          loading: false,
        }))
      } else {
        set({ error: response.message || 'Failed to delete customer', loading: false })
      }
    } catch {
      set({ error: 'Failed to delete customer', loading: false })
    }
  },

  getCustomerById: (id) => get().customers.find((customer) => customer.id === id),
  getCustomersByBuilding: (buildingId) =>
    get().customers.filter((customer) => customer.building === buildingId),
}))
