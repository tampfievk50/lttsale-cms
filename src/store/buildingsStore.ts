import { create } from 'zustand'
import type { Building, Apartment } from '@/types'
import { buildingsApi, apartmentsApi } from '@/api'

interface BuildingsState {
  buildings: Building[]
  apartments: Apartment[]
  loading: boolean
  error: string | null
  fetchBuildings: (search?: string) => Promise<void>
  fetchApartments: (search?: string) => Promise<void>
  addBuilding: (building: Omit<Building, 'id'>) => Promise<void>
  updateBuilding: (id: string, building: Partial<Building>) => Promise<void>
  deleteBuilding: (id: string) => Promise<void>
  getBuildingById: (id: string) => Building | undefined
  addApartment: (apartment: Omit<Apartment, 'id'>) => Promise<void>
  updateApartment: (id: string, apartment: Partial<Apartment>) => Promise<void>
  deleteApartment: (id: string) => Promise<void>
  getApartmentById: (id: string) => Apartment | undefined
}

export const useBuildingsStore = create<BuildingsState>()((set, get) => ({
  buildings: [],
  apartments: [],
  loading: false,
  error: null,

  fetchBuildings: async (search?: string) => {
    set({ loading: true, error: null })
    try {
      const response = await buildingsApi.getAll({ search })
      if (response.success) {
        set({ buildings: response.data, loading: false })
      } else {
        set({ error: response.message || 'Failed to fetch buildings', loading: false })
      }
    } catch {
      set({ error: 'Failed to fetch buildings', loading: false })
    }
  },

  fetchApartments: async (search?: string) => {
    set({ loading: true, error: null })
    try {
      const response = await apartmentsApi.getAll({ search })
      if (response.success) {
        set({ apartments: response.data, loading: false })
      } else {
        set({ error: response.message || 'Failed to fetch apartments', loading: false })
      }
    } catch {
      set({ error: 'Failed to fetch apartments', loading: false })
    }
  },

  addBuilding: async (building) => {
    set({ loading: true, error: null })
    try {
      const response = await buildingsApi.create(building)
      if (response.success) {
        await get().fetchBuildings()
      } else {
        set({ error: response.message || 'Failed to add building', loading: false })
      }
    } catch {
      set({ error: 'Failed to add building', loading: false })
    }
  },

  updateBuilding: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const response = await buildingsApi.update(id, updates)
      if (response.success) {
        await get().fetchBuildings()
      } else {
        set({ error: response.message || 'Failed to update building', loading: false })
      }
    } catch {
      set({ error: 'Failed to update building', loading: false })
    }
  },

  deleteBuilding: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await buildingsApi.delete(id)
      if (response.success) {
        set((state) => ({
          buildings: state.buildings.filter((building) => building.id !== id),
          loading: false,
        }))
      } else {
        set({ error: response.message || 'Failed to delete building', loading: false })
      }
    } catch {
      set({ error: 'Failed to delete building', loading: false })
    }
  },

  getBuildingById: (id) => get().buildings.find((building) => building.id === id),

  addApartment: async (apartment) => {
    set({ loading: true, error: null })
    try {
      const response = await apartmentsApi.create(apartment)
      if (response.success) {
        await get().fetchApartments()
      } else {
        set({ error: response.message || 'Failed to add apartment', loading: false })
      }
    } catch {
      set({ error: 'Failed to add apartment', loading: false })
    }
  },

  updateApartment: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const response = await apartmentsApi.update(id, updates)
      if (response.success) {
        await get().fetchApartments()
      } else {
        set({ error: response.message || 'Failed to update apartment', loading: false })
      }
    } catch {
      set({ error: 'Failed to update apartment', loading: false })
    }
  },

  deleteApartment: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await apartmentsApi.delete(id)
      if (response.success) {
        set((state) => ({
          apartments: state.apartments.filter((apartment) => apartment.id !== id),
          loading: false,
        }))
      } else {
        set({ error: response.message || 'Failed to delete apartment', loading: false })
      }
    } catch {
      set({ error: 'Failed to delete apartment', loading: false })
    }
  },

  getApartmentById: (id) => get().apartments.find((apartment) => apartment.id === id),
}))
