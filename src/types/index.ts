// MUI Palette Type Augmentation
declare module '@mui/material/styles' {
  interface PaletteColor {
    lighter?: string
  }

  interface SimplePaletteColorOptions {
    lighter?: string
  }
}

// Order Status Constants
export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus]

// Order Status Display Info
export const OrderStatusInfo: Record<OrderStatusType, { label: string; color: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' }> = {
  pending: { label: 'Pending', color: 'warning' },
  confirmed: { label: 'Confirmed', color: 'info' },
  preparing: { label: 'Preparing', color: 'secondary' },
  shipped: { label: 'Shipped', color: 'primary' },
  delivered: { label: 'Delivered', color: 'success' },
  cancelled: { label: 'Cancelled', color: 'error' },
}

// Payment Status Constants
export const PaymentStatus = {
  UNPAID: 'unpaid',
  PAID: 'paid',
} as const

export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const PaymentStatusInfo: Record<PaymentStatusType, { label: string; color: 'success' | 'error' }> = {
  unpaid: { label: 'Unpaid', color: 'error' },
  paid: { label: 'Paid', color: 'success' },
}

// Order Item - represents a single product in an order
export interface OrderItem {
  id: string
  orderId: string
  productId: string
  productName: string
  productImage?: string
  productCategory?: string
  unitPrice: number
  quantity: number
  lineTotal: number
  note?: string
  createdAt: Date
}

// Order - enhanced with multi-item support
export interface Order {
  id: string
  orderNumber: number
  customerId: string
  customer?: Customer
  status: OrderStatusType
  paymentStatus: PaymentStatusType
  items: OrderItem[]
  itemCount: number
  subtotal: number
  discount: number
  discountReason?: string
  shippingFee: number
  totalPrice: number
  note?: string
  deliveryImage?: string
  paidAt?: Date
  deliveredAt?: Date
  cancelledAt?: Date
  cancelReason?: string
  createdAt: Date
  updatedAt: Date
}

// Order Item Request - for creating/updating orders
export interface OrderItemRequest {
  productId: string
  quantity: number
  unitPrice?: number
  note?: string
}

// Create Order Request
export interface CreateOrderRequest {
  customerId: string
  items: OrderItemRequest[]
  discount?: number
  discountReason?: string
  shippingFee?: number
  note?: string
}

// Create Order Legacy Request (single product)
export interface CreateOrderLegacyRequest {
  productId: string
  quantity: number
  customerId: string
  note?: string
  totalPrice?: number
}

// Update Order Request
export interface UpdateOrderRequest {
  customerId?: string
  items?: OrderItemRequest[]
  discount?: number
  discountReason?: string
  shippingFee?: number
  note?: string
  deliveryImage?: string
  totalPrice?: number
}

// Update Order Status Request
export interface UpdateOrderStatusRequest {
  status: OrderStatusType
  note?: string
}

// Cancel Order Request
export interface CancelOrderRequest {
  reason: string
}

// Mark Paid Request
export interface MarkPaidRequest {
  paidAt?: Date
  note?: string
}

// Add Order Item Request
export interface AddOrderItemRequest {
  productId: string
  quantity: number
  unitPrice?: number
  note?: string
}

// Order Status History
export interface OrderStatusHistory {
  id: string
  orderId: string
  fromStatus?: string
  toStatus: string
  changedBy?: string
  note?: string
  createdAt: Date
}

// Product with inventory
export interface Product {
  id: string
  sku?: string
  name: string
  description: string
  price: number
  costPrice?: number
  category: string
  categoryName?: string
  image?: string
  stockQty?: number
  lowStockThreshold?: number
  trackInventory?: boolean
  isLowStock?: boolean
  isPublished: boolean
}

export interface Customer {
  id: string
  name: string
  address: string
  building: string
  buildingName?: string
  apartmentId?: string
  phoneNumber?: string
  image?: string
}

export interface Building {
  id: string
  name: string
  address?: string
}

export interface Apartment {
  id: string
  name: string
  buildingId?: string
  unitNumber?: string
  floor?: number
}

export interface ProductCategory {
  id: string
  name: string
  description?: string
  image?: string
  sortOrder?: number
}

export interface User {
  id: string
  name: string
  address: string
  mobile: string
}

// Analytics Types
export interface OrderAnalytics {
  totalOrders: number
  totalRevenue: number
  totalProfit?: number
  averageOrderValue?: number
  pendingOrders: number
  confirmedOrders?: number
  preparingOrders?: number
  shippedOrders?: number
  deliveredOrders: number
  cancelledOrders?: number
  paidOrders: number
  unpaidOrders: number
  paidAmount?: number
  unpaidAmount?: number
}

// SSO Admin Types

export interface SsoUser {
  id: number
  username: string
  email: string
  avatar: string
  first_name?: string
  last_name?: string
  is_active?: boolean
  is_supper: boolean
  gender?: number
  date_of_birth?: string
  last_login?: string
  user_roles?: UserRoleEntry[]
}

export interface Role {
  id: number
  name: string
  description: string
}

export interface Permission {
  id: number
  name: string
  description: string
  path: string
  action: string
}

export interface Policy {
  role_id: string
  domain_id: string
  path: string
  action: string
  effect: string
}

export interface UserRoleEntry {
  user_id: number
  role_id: number
  resource_id: number
}

export interface Resource {
  id: number
  name: string
  description: string
}

// Theme & Layout Types

export type Mode = 'light' | 'dark' | 'system'
export type Skin = 'default' | 'bordered'
export type Layout = 'vertical' | 'horizontal'
export type NavbarType = 'sticky' | 'static' | 'hidden'
export type FooterType = 'sticky' | 'static' | 'hidden'
export type ContentWidth = 'boxed' | 'fluid'

export interface ThemeSettings {
  mode: Mode
  skin: Skin
  layout: Layout
  navbarType: NavbarType
  footerType: FooterType
  contentWidth: ContentWidth
  semiDark: boolean
  navCollapsed: boolean
}

// Navigation Types

export interface NavItem {
  title: string
  path?: string
  icon?: React.ReactNode
  badge?: string
  badgeColor?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
  children?: NavItem[]
  disabled?: boolean
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export type NavGroup = NavSection[]
