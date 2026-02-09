import { create } from 'zustand'
import type {
  Order,
  OrderStatusType,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderItemRequest,
  OrderStatusHistory,
} from '@/types'
import { ordersApi } from '@/api'

interface OrdersState {
  orders: Order[]
  loading: boolean
  error: string | null
  // Fetch
  fetchOrders: (search?: string, status?: OrderStatusType) => Promise<void>
  getOrderById: (id: string) => Order | undefined
  // Create
  createOrder: (request: CreateOrderRequest) => Promise<Order | null>
  createLegacyOrder: (order: {
    productId: string
    quantity: number
    customerId: string
    note?: string
  }) => Promise<Order | null>
  // Update
  updateOrder: (id: string, updates: UpdateOrderRequest) => Promise<Order | null>
  deleteOrder: (id: string) => Promise<boolean>
  // Status workflow
  updateStatus: (id: string, status: OrderStatusType, note?: string) => Promise<Order | null>
  cancelOrder: (id: string, reason: string) => Promise<Order | null>
  markPaid: (id: string) => Promise<Order | null>
  // Order items
  addItem: (orderId: string, item: OrderItemRequest) => Promise<Order | null>
  removeItem: (orderId: string, itemId: string) => Promise<Order | null>
  // Status history
  getStatusHistory: (orderId: string) => Promise<OrderStatusHistory[]>
  // Legacy actions (backward compatibility)
  toggleDelivered: (id: string) => Promise<void>
  togglePaid: (id: string) => Promise<void>
}

export const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async (search?: string, status?: OrderStatusType) => {
    set({ loading: true, error: null })
    try {
      const response = await ordersApi.getAll({ search, status })
      if (response.success) {
        set({ orders: response.data, loading: false })
      } else {
        set({ error: response.message || 'Failed to fetch orders', loading: false })
      }
    } catch {
      set({ error: 'Failed to fetch orders', loading: false })
    }
  },

  getOrderById: (id) => get().orders.find((order) => order.id === id),

  createOrder: async (request) => {
    set({ loading: true, error: null })
    try {
      const response = await ordersApi.create(request)
      if (response.success && response.data) {
        await get().fetchOrders()
        return response.data
      } else {
        set({ error: response.message || 'Failed to create order', loading: false })
        return null
      }
    } catch {
      set({ error: 'Failed to create order', loading: false })
      return null
    }
  },

  createLegacyOrder: async (order) => {
    set({ loading: true, error: null })
    try {
      const response = await ordersApi.createLegacy(order)
      if (response.success && response.data) {
        await get().fetchOrders()
        return response.data
      } else {
        set({ error: response.message || 'Failed to create order', loading: false })
        return null
      }
    } catch {
      set({ error: 'Failed to create order', loading: false })
      return null
    }
  },

  updateOrder: async (id, updates) => {
    set({ loading: true, error: null })
    try {
      const response = await ordersApi.update(id, updates)
      if (response.success && response.data) {
        await get().fetchOrders()
        return response.data
      } else {
        set({ error: response.message || 'Failed to update order', loading: false })
        return null
      }
    } catch {
      set({ error: 'Failed to update order', loading: false })
      return null
    }
  },

  deleteOrder: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await ordersApi.delete(id)
      if (response.success) {
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
          loading: false,
        }))
        return true
      } else {
        set({ error: response.message || 'Failed to delete order', loading: false })
        return false
      }
    } catch {
      set({ error: 'Failed to delete order', loading: false })
      return false
    }
  },

  updateStatus: async (id, status, note) => {
    set({ loading: true, error: null })
    try {
      const response = await ordersApi.updateStatus(id, status, note)
      if (response.success && response.data) {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? response.data! : order
          ),
          loading: false,
        }))
        return response.data
      } else {
        set({ error: response.message || 'Failed to update order status', loading: false })
        return null
      }
    } catch {
      set({ error: 'Failed to update order status', loading: false })
      return null
    }
  },

  cancelOrder: async (id, reason) => {
    set({ loading: true, error: null })
    try {
      const response = await ordersApi.cancel(id, reason)
      if (response.success && response.data) {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? response.data! : order
          ),
          loading: false,
        }))
        return response.data
      } else {
        set({ error: response.message || 'Failed to cancel order', loading: false })
        return null
      }
    } catch {
      set({ error: 'Failed to cancel order', loading: false })
      return null
    }
  },

  markPaid: async (id) => {
    set({ loading: true, error: null })
    try {
      const response = await ordersApi.markPaid(id)
      if (response.success && response.data) {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? response.data! : order
          ),
          loading: false,
        }))
        return response.data
      } else {
        set({ error: response.message || 'Failed to mark order as paid', loading: false })
        return null
      }
    } catch {
      set({ error: 'Failed to mark order as paid', loading: false })
      return null
    }
  },

  addItem: async (orderId, item) => {
    set({ loading: true, error: null })
    try {
      const response = await ordersApi.addItem(orderId, item)
      if (response.success && response.data) {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? response.data! : order
          ),
          loading: false,
        }))
        return response.data
      } else {
        set({ error: response.message || 'Failed to add item to order', loading: false })
        return null
      }
    } catch {
      set({ error: 'Failed to add item to order', loading: false })
      return null
    }
  },

  removeItem: async (orderId, itemId) => {
    set({ loading: true, error: null })
    try {
      const response = await ordersApi.removeItem(orderId, itemId)
      if (response.success && response.data) {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? response.data! : order
          ),
          loading: false,
        }))
        return response.data
      } else {
        set({ error: response.message || 'Failed to remove item from order', loading: false })
        return null
      }
    } catch {
      set({ error: 'Failed to remove item from order', loading: false })
      return null
    }
  },

  getStatusHistory: async (orderId) => {
    try {
      const response = await ordersApi.getHistory(orderId)
      if (response.success && response.data) {
        return response.data
      }
      return []
    } catch {
      return []
    }
  },

  // Legacy actions for backward compatibility
  toggleDelivered: async (id) => {
    try {
      const response = await ordersApi.toggleDelivered(id)
      if (response.success && response.data) {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? response.data! : order
          ),
        }))
      }
    } catch {
      set({ error: 'Failed to toggle delivered status' })
    }
  },

  togglePaid: async (id) => {
    try {
      const response = await ordersApi.togglePaid(id)
      if (response.success && response.data) {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === id ? response.data! : order
          ),
        }))
      }
    } catch {
      set({ error: 'Failed to toggle paid status' })
    }
  },
}))
