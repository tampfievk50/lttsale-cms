import { create } from 'zustand'
import type { Product } from '@/types'
import { productsApi } from '@/api'

interface ProductsState {
  products: Product[]
  loading: boolean
  error: string | null
  fetchProducts: (search?: string) => Promise<void>
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
  togglePublished: (id: string) => Promise<void>
  getProductById: (id: string) => Product | undefined
  getProductsByCategory: (categoryId: string) => Product[]
}

export const useProductsStore = create<ProductsState>()((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async (search?: string) => {
    set({ loading: true, error: null })
    try {
      const response = await productsApi.getAll({ search })
      if (response.success) {
        set({ products: response.data, loading: false })
      } else {
        set({ error: response.message || 'Failed to fetch products', loading: false })
      }
    } catch {
      set({ error: 'Failed to fetch products', loading: false })
    }
  },

  addProduct: async (product) => {
    set({ loading: true, error: null })
    try {
      const response = await productsApi.create(product)
      if (response.success) {
        await get().fetchProducts()
      } else {
        set({ error: response.message || 'Failed to add product', loading: false })
      }
    } catch {
      set({ error: 'Failed to add product', loading: false })
    }
  },

  updateProduct: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const response = await productsApi.update(id, updates)
      if (response.success) {
        await get().fetchProducts()
      } else {
        set({ error: response.message || 'Failed to update product', loading: false })
      }
    } catch {
      set({ error: 'Failed to update product', loading: false })
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await productsApi.delete(id)
      if (response.success) {
        set((state) => ({
          products: state.products.filter((product) => product.id !== id),
          loading: false,
        }))
      } else {
        set({ error: response.message || 'Failed to delete product', loading: false })
      }
    } catch {
      set({ error: 'Failed to delete product', loading: false })
    }
  },

  togglePublished: async (id) => {
    try {
      const response = await productsApi.togglePublished(id)
      if (response.success && response.data) {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id ? response.data! : product
          ),
        }))
      }
    } catch {
      set({ error: 'Failed to toggle published status' })
    }
  },

  getProductById: (id) => get().products.find((product) => product.id === id),
  getProductsByCategory: (categoryId) =>
    get().products.filter((product) => product.category === categoryId),
}))
