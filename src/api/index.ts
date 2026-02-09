import type {
  Order,
  OrderItem,
  OrderStatusHistory,
  Product,
  Customer,
  ProductCategory,
  Building,
  Apartment,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderStatusType,
} from '@/types'
import { cmsApi } from './cms'

// Generic API response type
interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// Helper to convert API order response to Order type
const mapOrderResponse = (item: any): Order => ({
  id: item.id,
  orderNumber: item.orderNumber || 0,
  customerId: item.customerId,
  customer: item.customer ? {
    id: item.customer.id,
    name: item.customer.name,
    address: item.customer.address,
    building: item.customer.buildingId || '',
    phoneNumber: item.customer.phoneNumber || undefined,
    image: item.customer.image || undefined,
  } : undefined,
  status: item.status || 'pending',
  paymentStatus: item.paymentStatus || 'unpaid',
  items: (item.items || []).map((i: any): OrderItem => ({
    id: i.id,
    orderId: i.orderId,
    productId: i.productId,
    productName: i.productName,
    productImage: i.productImage || undefined,
    productCategory: i.productCategory || undefined,
    unitPrice: i.unitPrice,
    quantity: i.quantity,
    lineTotal: i.lineTotal,
    note: i.note || undefined,
    createdAt: new Date(i.createdAt),
  })),
  itemCount: item.itemCount || (item.items?.length ?? 1),
  subtotal: item.subtotal || item.totalPrice || 0,
  discount: item.discount || 0,
  discountReason: item.discountReason || undefined,
  shippingFee: item.shippingFee || 0,
  totalPrice: item.totalPrice,
  note: item.note || undefined,
  deliveryImage: item.deliveryImage || undefined,
  paidAt: item.paidAt ? new Date(item.paidAt) : undefined,
  deliveredAt: item.deliveredAt ? new Date(item.deliveredAt) : undefined,
  cancelledAt: item.cancelledAt ? new Date(item.cancelledAt) : undefined,
  cancelReason: item.cancelReason || undefined,
  createdAt: new Date(item.createdAt),
  updatedAt: new Date(item.updatedAt),
})

// ============ Orders API ============
export const ordersApi = {
  getAll: async (params?: { search?: string; status?: OrderStatusType }): Promise<ApiResponse<Order[]>> => {
    try {
      const response = await cmsApi.orders.getAll({ search: params?.search, status: params?.status })
      const orders: Order[] = response.items.map(mapOrderResponse)
      return { data: orders, success: true }
    } catch (error) {
      return { data: [], success: false, message: (error as Error).message }
    }
  },

  getById: async (id: string): Promise<ApiResponse<Order | null>> => {
    try {
      const item = await cmsApi.orders.getById(id)
      const order = mapOrderResponse(item)
      return { data: order, success: true }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  // Create order with multiple items (new format)
  create: async (order: CreateOrderRequest): Promise<ApiResponse<Order>> => {
    try {
      const item = await cmsApi.orders.create({
        customerId: order.customerId,
        items: order.items,
        discount: order.discount,
        discountReason: order.discountReason,
        shippingFee: order.shippingFee,
        note: order.note,
      })
      const newOrder = mapOrderResponse(item)
      return { data: newOrder, success: true, message: 'Order created successfully' }
    } catch (error) {
      return { data: {} as Order, success: false, message: (error as Error).message }
    }
  },

  // Create order with single product (legacy format)
  createLegacy: async (order: {
    productId: string
    quantity: number
    customerId: string
    note?: string
    totalPrice?: number
  }): Promise<ApiResponse<Order>> => {
    try {
      const item = await cmsApi.orders.createLegacy(order)
      const newOrder = mapOrderResponse(item)
      return { data: newOrder, success: true, message: 'Order created successfully' }
    } catch (error) {
      return { data: {} as Order, success: false, message: (error as Error).message }
    }
  },

  update: async (id: string, updates: UpdateOrderRequest): Promise<ApiResponse<Order | null>> => {
    try {
      const item = await cmsApi.orders.update(id, updates)
      const updatedOrder = mapOrderResponse(item)
      return { data: updatedOrder, success: true, message: 'Order updated successfully' }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      await cmsApi.orders.delete(id)
      return { data: true, success: true, message: 'Order deleted successfully' }
    } catch (error) {
      return { data: false, success: false, message: (error as Error).message }
    }
  },

  // Status workflow
  updateStatus: async (id: string, status: OrderStatusType, note?: string): Promise<ApiResponse<Order | null>> => {
    try {
      const item = await cmsApi.orders.updateStatus(id, { status, note })
      const order = mapOrderResponse(item)
      return { data: order, success: true, message: 'Status updated successfully' }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  cancel: async (id: string, reason: string): Promise<ApiResponse<Order | null>> => {
    try {
      const item = await cmsApi.orders.cancel(id, reason)
      const order = mapOrderResponse(item)
      return { data: order, success: true, message: 'Order cancelled' }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  markPaid: async (id: string): Promise<ApiResponse<Order | null>> => {
    try {
      const item = await cmsApi.orders.markPaid(id)
      const order = mapOrderResponse(item)
      return { data: order, success: true, message: 'Order marked as paid' }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  // Order items management
  addItem: async (orderId: string, item: {
    productId: string
    quantity: number
    unitPrice?: number
    note?: string
  }): Promise<ApiResponse<Order | null>> => {
    try {
      const response = await cmsApi.orders.addItem(orderId, item)
      const order = mapOrderResponse(response)
      return { data: order, success: true, message: 'Item added' }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  removeItem: async (orderId: string, itemId: string): Promise<ApiResponse<Order | null>> => {
    try {
      const response = await cmsApi.orders.removeItem(orderId, itemId)
      const order = mapOrderResponse(response)
      return { data: order, success: true, message: 'Item removed' }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  // Status history
  getHistory: async (id: string): Promise<ApiResponse<OrderStatusHistory[]>> => {
    try {
      const items = await cmsApi.orders.getHistory(id)
      const history: OrderStatusHistory[] = items.map((h) => ({
        id: h.id,
        orderId: h.orderId,
        fromStatus: h.fromStatus || undefined,
        toStatus: h.toStatus,
        changedBy: h.changedBy || undefined,
        note: h.note || undefined,
        createdAt: new Date(h.createdAt),
      }))
      return { data: history, success: true }
    } catch (error) {
      return { data: [], success: false, message: (error as Error).message }
    }
  },

  // Legacy toggle methods
  toggleDelivered: async (id: string): Promise<ApiResponse<Order | null>> => {
    try {
      const item = await cmsApi.orders.toggleDelivered(id)
      const order = mapOrderResponse(item)
      return { data: order, success: true }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  togglePaid: async (id: string): Promise<ApiResponse<Order | null>> => {
    try {
      const item = await cmsApi.orders.togglePaid(id)
      const order = mapOrderResponse(item)
      return { data: order, success: true }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },
}

// ============ Products API ============
export const productsApi = {
  getAll: async (params?: { search?: string }): Promise<ApiResponse<Product[]>> => {
    try {
      const response = await cmsApi.products.getAll({ search: params?.search })
      const products: Product[] = response.items.map((item) => ({
        id: item.id,
        sku: item.sku || undefined,
        name: item.name,
        description: item.description,
        price: item.price,
        costPrice: item.costPrice || undefined,
        category: item.categoryId,
        categoryName: item.category?.name,
        image: item.image || undefined,
        stockQty: item.stockQty,
        lowStockThreshold: item.lowStockThreshold,
        trackInventory: item.trackInventory,
        isLowStock: item.isLowStock,
        isPublished: item.isPublished,
      }))
      return { data: products, success: true }
    } catch (error) {
      return { data: [], success: false, message: (error as Error).message }
    }
  },

  getById: async (id: string): Promise<ApiResponse<Product | null>> => {
    try {
      const item = await cmsApi.products.getById(id)
      const product: Product = {
        id: item.id,
        sku: item.sku || undefined,
        name: item.name,
        description: item.description,
        price: item.price,
        costPrice: item.costPrice || undefined,
        category: item.categoryId,
        categoryName: item.category?.name,
        image: item.image || undefined,
        stockQty: item.stockQty,
        lowStockThreshold: item.lowStockThreshold,
        trackInventory: item.trackInventory,
        isLowStock: item.isLowStock,
        isPublished: item.isPublished,
      }
      return { data: product, success: true }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  create: async (product: Omit<Product, 'id'>): Promise<ApiResponse<Product>> => {
    try {
      const item = await cmsApi.products.create({
        name: product.name,
        description: product.description,
        price: product.price,
        categoryId: product.category,
        image: product.image,
        isPublished: product.isPublished,
      })
      const newProduct: Product = {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.categoryId,
        image: item.image || undefined,
        isPublished: item.isPublished,
      }
      return { data: newProduct, success: true, message: 'Product created successfully' }
    } catch (error) {
      return { data: {} as Product, success: false, message: (error as Error).message }
    }
  },

  update: async (id: string, updates: Partial<Product>): Promise<ApiResponse<Product | null>> => {
    try {
      const item = await cmsApi.products.update(id, {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        categoryId: updates.category,
        image: updates.image,
        isPublished: updates.isPublished,
      })
      const updatedProduct: Product = {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.categoryId,
        image: item.image || undefined,
        isPublished: item.isPublished,
      }
      return { data: updatedProduct, success: true, message: 'Product updated successfully' }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      await cmsApi.products.delete(id)
      return { data: true, success: true, message: 'Product deleted successfully' }
    } catch (error) {
      return { data: false, success: false, message: (error as Error).message }
    }
  },

  togglePublished: async (id: string): Promise<ApiResponse<Product | null>> => {
    try {
      const item = await cmsApi.products.togglePublished(id)
      const product: Product = {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.categoryId,
        image: item.image || undefined,
        isPublished: item.isPublished,
      }
      return { data: product, success: true }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },
}

// ============ Customers API ============
export const customersApi = {
  getAll: async (params?: { search?: string }): Promise<ApiResponse<Customer[]>> => {
    try {
      const response = await cmsApi.customers.getAll({ search: params?.search })
      const customers: Customer[] = response.items.map((item) => ({
        id: item.id,
        name: item.name,
        address: item.address,
        building: item.buildingId,
        buildingName: item.building?.name,
        phoneNumber: item.phoneNumber || undefined,
        image: item.image || undefined,
      }))
      return { data: customers, success: true }
    } catch (error) {
      return { data: [], success: false, message: (error as Error).message }
    }
  },

  getById: async (id: string): Promise<ApiResponse<Customer | null>> => {
    try {
      const item = await cmsApi.customers.getById(id)
      const customer: Customer = {
        id: item.id,
        name: item.name,
        address: item.address,
        building: item.buildingId,
        buildingName: item.building?.name,
        phoneNumber: item.phoneNumber || undefined,
        image: item.image || undefined,
      }
      return { data: customer, success: true }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  create: async (customer: Omit<Customer, 'id'>): Promise<ApiResponse<Customer>> => {
    try {
      const item = await cmsApi.customers.create({
        name: customer.name,
        address: customer.address,
        buildingId: customer.building,
        phoneNumber: customer.phoneNumber,
        image: customer.image,
      })
      const newCustomer: Customer = {
        id: item.id,
        name: item.name,
        address: item.address,
        building: item.buildingId,
        phoneNumber: item.phoneNumber || undefined,
        image: item.image || undefined,
      }
      return { data: newCustomer, success: true, message: 'Customer created successfully' }
    } catch (error) {
      return { data: {} as Customer, success: false, message: (error as Error).message }
    }
  },

  update: async (id: string, updates: Partial<Customer>): Promise<ApiResponse<Customer | null>> => {
    try {
      const item = await cmsApi.customers.update(id, {
        name: updates.name,
        address: updates.address,
        buildingId: updates.building,
        phoneNumber: updates.phoneNumber,
        image: updates.image,
      })
      const updatedCustomer: Customer = {
        id: item.id,
        name: item.name,
        address: item.address,
        building: item.buildingId,
        phoneNumber: item.phoneNumber || undefined,
        image: item.image || undefined,
      }
      return { data: updatedCustomer, success: true, message: 'Customer updated successfully' }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      await cmsApi.customers.delete(id)
      return { data: true, success: true, message: 'Customer deleted successfully' }
    } catch (error) {
      return { data: false, success: false, message: (error as Error).message }
    }
  },
}

// ============ Categories API ============
export const categoriesApi = {
  getAll: async (params?: { search?: string }): Promise<ApiResponse<ProductCategory[]>> => {
    try {
      const response = await cmsApi.categories.getAll({ search: params?.search })
      const categories: ProductCategory[] = response.items.map((item) => ({
        id: item.id,
        name: item.name,
      }))
      return { data: categories, success: true }
    } catch (error) {
      return { data: [], success: false, message: (error as Error).message }
    }
  },

  getById: async (id: string): Promise<ApiResponse<ProductCategory | null>> => {
    try {
      const item = await cmsApi.categories.getById(id)
      const category: ProductCategory = {
        id: item.id,
        name: item.name,
      }
      return { data: category, success: true }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  create: async (category: Omit<ProductCategory, 'id'>): Promise<ApiResponse<ProductCategory>> => {
    try {
      const item = await cmsApi.categories.create({ name: category.name })
      const newCategory: ProductCategory = {
        id: item.id,
        name: item.name,
      }
      return { data: newCategory, success: true, message: 'Category created successfully' }
    } catch (error) {
      return { data: {} as ProductCategory, success: false, message: (error as Error).message }
    }
  },

  update: async (id: string, updates: Partial<ProductCategory>): Promise<ApiResponse<ProductCategory | null>> => {
    try {
      const item = await cmsApi.categories.update(id, { name: updates.name! })
      const updatedCategory: ProductCategory = {
        id: item.id,
        name: item.name,
      }
      return { data: updatedCategory, success: true, message: 'Category updated successfully' }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      await cmsApi.categories.delete(id)
      return { data: true, success: true, message: 'Category deleted successfully' }
    } catch (error) {
      return { data: false, success: false, message: (error as Error).message }
    }
  },
}

// ============ Buildings API ============
export const buildingsApi = {
  getAll: async (params?: { search?: string }): Promise<ApiResponse<Building[]>> => {
    try {
      const response = await cmsApi.buildings.getAll({ search: params?.search })
      const buildings: Building[] = response.items.map((item) => ({
        id: item.id,
        name: item.name,
      }))
      return { data: buildings, success: true }
    } catch (error) {
      return { data: [], success: false, message: (error as Error).message }
    }
  },

  getById: async (id: string): Promise<ApiResponse<Building | null>> => {
    try {
      const item = await cmsApi.buildings.getById(id)
      const building: Building = {
        id: item.id,
        name: item.name,
      }
      return { data: building, success: true }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  create: async (building: Omit<Building, 'id'>): Promise<ApiResponse<Building>> => {
    try {
      const item = await cmsApi.buildings.create({ name: building.name })
      const newBuilding: Building = {
        id: item.id,
        name: item.name,
      }
      return { data: newBuilding, success: true, message: 'Building created successfully' }
    } catch (error) {
      return { data: {} as Building, success: false, message: (error as Error).message }
    }
  },

  update: async (id: string, updates: Partial<Building>): Promise<ApiResponse<Building | null>> => {
    try {
      const item = await cmsApi.buildings.update(id, { name: updates.name! })
      const updatedBuilding: Building = {
        id: item.id,
        name: item.name,
      }
      return { data: updatedBuilding, success: true, message: 'Building updated successfully' }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      await cmsApi.buildings.delete(id)
      return { data: true, success: true, message: 'Building deleted successfully' }
    } catch (error) {
      return { data: false, success: false, message: (error as Error).message }
    }
  },
}

// ============ Apartments API ============
export const apartmentsApi = {
  getAll: async (params?: { search?: string }): Promise<ApiResponse<Apartment[]>> => {
    try {
      const response = await cmsApi.apartments.getAll({ search: params?.search })
      const apartments: Apartment[] = response.items.map((item) => ({
        id: item.id,
        name: item.name,
      }))
      return { data: apartments, success: true }
    } catch (error) {
      return { data: [], success: false, message: (error as Error).message }
    }
  },

  getById: async (id: string): Promise<ApiResponse<Apartment | null>> => {
    try {
      const item = await cmsApi.apartments.getById(id)
      const apartment: Apartment = {
        id: item.id,
        name: item.name,
      }
      return { data: apartment, success: true }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  create: async (apartment: Omit<Apartment, 'id'>): Promise<ApiResponse<Apartment>> => {
    try {
      const item = await cmsApi.apartments.create({ name: apartment.name })
      const newApartment: Apartment = {
        id: item.id,
        name: item.name,
      }
      return { data: newApartment, success: true, message: 'Apartment created successfully' }
    } catch (error) {
      return { data: {} as Apartment, success: false, message: (error as Error).message }
    }
  },

  update: async (id: string, updates: Partial<Apartment>): Promise<ApiResponse<Apartment | null>> => {
    try {
      const item = await cmsApi.apartments.update(id, { name: updates.name! })
      const updatedApartment: Apartment = {
        id: item.id,
        name: item.name,
      }
      return { data: updatedApartment, success: true, message: 'Apartment updated successfully' }
    } catch (error) {
      return { data: null, success: false, message: (error as Error).message }
    }
  },

  delete: async (id: string): Promise<ApiResponse<boolean>> => {
    try {
      await cmsApi.apartments.delete(id)
      return { data: true, success: true, message: 'Apartment deleted successfully' }
    } catch (error) {
      return { data: false, success: false, message: (error as Error).message }
    }
  },
}

// Re-export auth API
export { ssoApi } from './sso'
export { getAccessToken, setAccessToken, getRefreshToken, setRefreshToken, clearTokens, decodeJwtPayload } from './client'
