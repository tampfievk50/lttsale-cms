import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Box,
  Button,
  IconButton,
  Avatar,
  Typography,
  TextField,
  MenuItem,
  Tooltip,
  Chip,
  Menu,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material'
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconTruck,
  IconCash,
  IconCheck,
  IconX,
  IconChevronDown,
  IconPackage,
  IconClipboardCheck,
  IconLoader,
  IconSearch,
} from '@tabler/icons-react'
import { PageHeader, DataTable, type Column, ConfirmDialog, OrderFormModal } from '@/components'
import { useOrdersStore } from '@/store'
import type { Order, OrderStatusType, CreateOrderRequest, PaymentStatusType } from '@/types'
import { OrderStatus, OrderStatusInfo, PaymentStatus, PaymentStatusInfo } from '@/types'
import { formatVND, getDefaultDateRange } from '@/utils'

const OrdersList = () => {
  const orders = useOrdersStore((state) => state.orders)
  const fetchOrders = useOrdersStore((state) => state.fetchOrders)
  const createOrder = useOrdersStore((state) => state.createOrder)
  const updateOrder = useOrdersStore((state) => state.updateOrder)
  const deleteOrder = useOrdersStore((state) => state.deleteOrder)
  const updateStatus = useOrdersStore((state) => state.updateStatus)
  const cancelOrder = useOrdersStore((state) => state.cancelOrder)
  const markPaid = useOrdersStore((state) => state.markPaid)
  const toggleDelivered = useOrdersStore((state) => state.toggleDelivered)
  const togglePaid = useOrdersStore((state) => state.togglePaid)

  const defaultDates = getDefaultDateRange()
  const [dateFrom, setDateFrom] = useState(defaultDates.dateFrom)
  const [dateTo, setDateTo] = useState(defaultDates.dateTo)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [paymentFilter, setPaymentFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchOrders(search)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search, fetchOrders])

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  // Status menu state
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null)
  const [statusMenuOrder, setStatusMenuOrder] = useState<Order | null>(null)

  // Cancel dialog state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null)

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt)

      if (dateFrom) {
        const fromDate = new Date(dateFrom + 'T00:00:00')
        if (orderDate < fromDate) return false
      }

      if (dateTo) {
        const toDate = new Date(dateTo + 'T23:59:59.999')
        if (orderDate > toDate) return false
      }

      if (statusFilter !== '') {
        if (order.status !== statusFilter) return false
      }

      if (paymentFilter !== '') {
        if (order.paymentStatus !== paymentFilter) return false
      }

      return true
    })
  }, [orders, dateFrom, dateTo, statusFilter, paymentFilter])

  const handleOpenModal = (order?: Order) => {
    setEditingOrder(order || null)
    setFormModalOpen(true)
  }

  const handleCloseModal = () => {
    setFormModalOpen(false)
    setEditingOrder(null)
  }

  const handleFormSubmit = async (data: CreateOrderRequest & { id?: string }) => {
    if (data.id) {
      await updateOrder(data.id, data)
    } else {
      await createOrder(data)
    }
  }

  const handleDeleteClick = (id: string) => {
    setOrderToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (orderToDelete) {
      await deleteOrder(orderToDelete)
    }
    setDeleteDialogOpen(false)
    setOrderToDelete(null)
  }

  // Status menu handlers
  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLElement>, order: Order) => {
    event.stopPropagation()
    setStatusMenuAnchor(event.currentTarget)
    setStatusMenuOrder(order)
  }

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null)
    setStatusMenuOrder(null)
  }

  const handleStatusChange = async (newStatus: OrderStatusType) => {
    if (statusMenuOrder) {
      if (newStatus === OrderStatus.CANCELLED) {
        setOrderToCancel(statusMenuOrder.id)
        setCancelDialogOpen(true)
      } else {
        await updateStatus(statusMenuOrder.id, newStatus)
      }
    }
    handleStatusMenuClose()
  }

  // Cancel dialog handlers
  const handleCancelConfirm = async () => {
    if (orderToCancel && cancelReason) {
      await cancelOrder(orderToCancel, cancelReason)
    }
    setCancelDialogOpen(false)
    setOrderToCancel(null)
    setCancelReason('')
  }

  const handleMarkPaid = async (orderId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    await markPaid(orderId)
  }

  // Get status chip color
  const getStatusChip = (status: OrderStatusType) => {
    const info = OrderStatusInfo[status] || { label: status, color: 'default' as const }
    return <Chip label={info.label} color={info.color} size="small" />
  }

  // Get available status transitions
  const getAvailableStatuses = (currentStatus: OrderStatusType): OrderStatusType[] => {
    const transitions: Record<OrderStatusType, OrderStatusType[]> = {
      pending: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      confirmed: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      preparing: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      shipped: [OrderStatus.DELIVERED],
      delivered: [],
      cancelled: [],
    }
    return transitions[currentStatus] || []
  }

  // Get status icon
  const getStatusIcon = (status: OrderStatusType) => {
    switch (status) {
      case OrderStatus.CONFIRMED:
        return <IconClipboardCheck size={16} />
      case OrderStatus.PREPARING:
        return <IconLoader size={16} />
      case OrderStatus.SHIPPED:
        return <IconTruck size={16} />
      case OrderStatus.DELIVERED:
        return <IconCheck size={16} />
      case OrderStatus.CANCELLED:
        return <IconX size={16} />
      default:
        return <IconPackage size={16} />
    }
  }

  const columns: Column<Order>[] = [
    {
      id: 'orderNumber',
      label: '#',
      minWidth: 60,
      format: (row) => (
        <Typography variant="body2" fontWeight={500}>
          #{row.orderNumber || '-'}
        </Typography>
      ),
    },
    {
      id: 'items',
      label: 'Items',
      minWidth: 200,
      format: (row) => {
        const firstItem = row.items?.[0]
        const productName = firstItem?.productName || 'Unknown'
        const productImage = firstItem?.productImage
        const itemCount = row.items?.length || 0
        const totalQty = row.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {productImage ? (
              <Avatar src={productImage} variant="rounded" sx={{ width: 40, height: 40 }} />
            ) : (
              <Avatar variant="rounded" sx={{ width: 40, height: 40 }}>
                {productName.charAt(0)}
              </Avatar>
            )}
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {productName}{firstItem && firstItem.quantity > 1 ? ` x${firstItem.quantity}` : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {itemCount > 1 ? `${itemCount} items, ${totalQty} qty` : formatVND(firstItem?.lineTotal || 0)}
              </Typography>
            </Box>
          </Box>
        )
      },
    },
    {
      id: 'customer',
      label: 'Customer',
      minWidth: 150,
      format: (row) => (
        <Box>
          <Typography variant="body2">{row.customer?.name || '-'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {row.customer?.phoneNumber}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'totalPrice',
      label: 'Total',
      align: 'right',
      minWidth: 100,
      format: (row) => (
        <Box>
          <Typography fontWeight={500}>{formatVND(row.totalPrice)}</Typography>
          {(row.discount || 0) > 0 && (
            <Typography variant="caption" color="error">
              -{formatVND(row.discount)}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Status',
      align: 'center',
      minWidth: 120,
      format: (row) => {
        const availableStatuses = getAvailableStatuses(row.status)
        const hasTransitions = availableStatuses.length > 0

        return (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              cursor: hasTransitions ? 'pointer' : 'default'
            }}
            onClick={(e) => hasTransitions && handleStatusMenuOpen(e, row)}
          >
            {getStatusChip(row.status)}
            {hasTransitions && <IconChevronDown size={14} style={{ marginLeft: 4 }} />}
          </Box>
        )
      },
    },
    {
      id: 'paymentStatus',
      label: 'Payment',
      align: 'center',
      minWidth: 80,
      format: (row) => {
        const info = PaymentStatusInfo[row.paymentStatus] || { label: row.paymentStatus, color: 'error' as const }
        return (
          <Chip
            label={info.label}
            color={info.color}
            size="small"
            variant={row.paymentStatus === PaymentStatus.PAID ? 'filled' : 'outlined'}
          />
        )
      },
    },
    {
      id: 'createdAt',
      label: 'Created',
      minWidth: 100,
      format: (row) => {
        const date = new Date(row.createdAt)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return (
          <Typography variant="body2">
            {`${day}/${month}/${year}`}
          </Typography>
        )
      },
    },
    {
      id: 'actions',
      label: 'Actions',
      align: 'center',
      minWidth: 150,
      format: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
          {/* Toggle delivered */}
          <Tooltip title={row.status === 'delivered' ? 'Undo Delivered' : 'Mark as Delivered'}>
            <IconButton
              size="small"
              color={row.status === 'delivered' ? 'success' : 'default'}
              onClick={(e) => {
                e.stopPropagation()
                toggleDelivered(row.id)
              }}
            >
              <IconTruck size={18} />
            </IconButton>
          </Tooltip>
          {/* Mark as paid */}
          {(() => {
            const isPaid = row.paymentStatus === PaymentStatus.PAID
            return (
              <Tooltip title={isPaid ? 'Already Paid' : 'Mark as Paid'}>
                <span>
                  <IconButton
                    size="small"
                    color={isPaid ? 'success' : 'default'}
                    disabled={isPaid}
                    onClick={(e) => isPaid ? e.stopPropagation() : handleMarkPaid(row.id, e)}
                  >
                    <IconCash size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            )
          })()}
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleOpenModal(row)
              }}
            >
              <IconEdit size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteClick(row.id)
              }}
            >
              <IconTrash size={18} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ]

  return (
    <Box>
      <PageHeader
        title=""
        breadcrumbs={[
          { label: 'Orders', path: '/orders/list' },
          { label: 'List' },
        ]}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<IconPlus size={18} />}
            onClick={() => handleOpenModal()}
          >
            Add Order
          </Button>
        }
      />

      {/* Filters & Search */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          alignItems: 'center',
          mb: 1,
        }}
      >
        <TextField
          id="orders-search"
          name="search"
          placeholder="Search orders..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: { xs: '100%', sm: 220 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={18} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          id="orders-date-from"
          name="dateFrom"
          label="From Date"
          type="date"
          size="small"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: { xs: '100%', sm: 170 } }}
        />
        <TextField
          id="orders-date-to"
          name="dateTo"
          label="To Date"
          type="date"
          size="small"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: { xs: '100%', sm: 170 } }}
        />
        <TextField
          id="orders-status-filter"
          name="statusFilter"
          select
          label="Order Status"
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ width: { xs: '100%', sm: 170 } }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {Object.values(OrderStatus).map((status) => (
            <MenuItem key={status} value={status}>
              {OrderStatusInfo[status]?.label || status}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          id="orders-payment-filter"
          name="paymentFilter"
          select
          label="Payment Status"
          size="small"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          sx={{ width: { xs: '100%', sm: 170 } }}
        >
          <MenuItem value="">All</MenuItem>
          {Object.values(PaymentStatus).map((ps) => (
            <MenuItem key={ps} value={ps}>
              {PaymentStatusInfo[ps]?.label || ps}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <DataTable
        columns={columns}
        data={filteredOrders}
        onRowClick={(row) => handleOpenModal(row)}
        emptyMessage="No orders found"
      />

      {/* Status Change Menu */}
      <Menu
        anchorEl={statusMenuAnchor}
        open={Boolean(statusMenuAnchor)}
        onClose={handleStatusMenuClose}
      >
        {statusMenuOrder && getAvailableStatuses(statusMenuOrder.status).map((status) => (
          <MenuItem
            key={status}
            onClick={() => handleStatusChange(status)}
          >
            <ListItemIcon>
              {getStatusIcon(status)}
            </ListItemIcon>
            <ListItemText>
              {OrderStatusInfo[status]?.label || status}
            </ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Order</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            label="Cancellation Reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Please provide a reason for cancelling this order"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Order</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelConfirm}
            disabled={!cancelReason.trim()}
          >
            Cancel Order
          </Button>
        </DialogActions>
      </Dialog>

      <OrderFormModal
        open={formModalOpen}
        order={editingOrder}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
        confirmText="Delete"
        confirmColor="error"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  )
}

export default OrdersList
