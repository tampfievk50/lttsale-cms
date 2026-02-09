import { create } from 'zustand'
import type { ProductCategory } from '@/types'
import { categoriesApi } from '@/api'

interface CategoriesState {
  categories: ProductCategory[]
  loading: boolean
  error: string | null
  fetchCategories: (search?: string) => Promise<void>
  addCategory: (category: Omit<ProductCategory, 'id'>) => Promise<void>
  updateCategory: (id: string, category: Partial<ProductCategory>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  getCategoryById: (id: string) => ProductCategory | undefined
}

export const useCategoriesStore = create<CategoriesState>()((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async (search?: string) => {
    set({ loading: true, error: null })
    try {
      const response = await categoriesApi.getAll({ search })
      if (response.success) {
        set({ categories: response.data, loading: false })
      } else {
        set({ error: response.message || 'Failed to fetch categories', loading: false })
      }
    } catch {
      set({ error: 'Failed to fetch categories', loading: false })
    }
  },

  addCategory: async (category) => {
    set({ loading: true, error: null })
    try {
      const response = await categoriesApi.create(category)
      if (response.success) {
        await get().fetchCategories()
      } else {
        set({ error: response.message || 'Failed to add category', loading: false })
      }
    } catch {
      set({ error: 'Failed to add category', loading: false })
    }
  },

  updateCategory: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const response = await categoriesApi.update(id, updates)
      if (response.success) {
        await get().fetchCategories()
      } else {
        set({ error: response.message || 'Failed to update category', loading: false })
      }
    } catch {
      set({ error: 'Failed to update category', loading: false })
    }
  },

  deleteCategory: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await categoriesApi.delete(id)
      if (response.success) {
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
          loading: false,
        }))
      } else {
        set({ error: response.message || 'Failed to delete category', loading: false })
      }
    } catch {
      set({ error: 'Failed to delete category', loading: false })
    }
  },

  getCategoryById: (id) => get().categories.find((category) => category.id === id),
}))
