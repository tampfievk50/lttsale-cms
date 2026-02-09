import { useState, useMemo, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Box,
  IconButton,
  Typography,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { useProductsStore, useCustomersStore } from '@/store'
import type { Order, CreateOrderRequest, OrderItemRequest } from '@/types'
import { formatVND } from '@/utils'

interface OrderFormModalProps {
  open: boolean
  order: Order | null
  onClose: () => void
  onSubmit: (data: CreateOrderRequest & { id?: string }) => void
}

interface OrderItemForm {
  productId: string
  quantity: number
  unitPrice: number
  note?: string
}

const emptyItem: OrderItemForm = {
  productId: '',
  quantity: 1,
  unitPrice: 0,
}

export const OrderFormModal = ({ open, order, onClose, onSubmit }: OrderFormModalProps) => {
  const products = useProductsStore((state) => state.products)
  const customers = useCustomersStore((state) => state.customers)

  const [customerId, setCustomerId] = useState('')
  const [items, setItems] = useState<OrderItemForm[]>([{ ...emptyItem }])
  const [discount, setDiscount] = useState(0)
  const [discountReason, setDiscountReason] = useState('')
  const [shippingFee, setShippingFee] = useState(0)
  const [note, setNote] = useState('')

  const handleEntered = useCallback(() => {
    if (order) {
      setCustomerId(order.customerId || '')
      setDiscount(order.discount || 0)
      setDiscountReason(order.discountReason || '')
      setShippingFee(order.shippingFee || 0)
      setNote(order.note || '')
      // Convert order items to form items
      if (order.items && order.items.length > 0) {
        setItems(order.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          note: item.note,
        })))
      }
    } else {
      setCustomerId('')
      setItems([{ ...emptyItem }])
      setDiscount(0)
      setDiscountReason('')
      setShippingFee(0)
      setNote('')
    }
  }, [order])

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerId(e.target.value)
  }

  // Item management
  const handleAddItem = () => {
    setItems([...items, { ...emptyItem }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (index: number, field: keyof OrderItemForm, value: string | number) => {
    const newItems = [...items]
    if (field === 'productId') {
      const product = products.find(p => p.id === value)
      newItems[index] = {
        ...newItems[index],
        productId: value as string,
        unitPrice: product?.price || 0,
      }
    } else if (field === 'quantity') {
      newItems[index] = { ...newItems[index], quantity: Number(value) || 1 }
    } else if (field === 'unitPrice') {
      newItems[index] = { ...newItems[index], unitPrice: Number(value) || 0 }
    } else if (field === 'note') {
      newItems[index] = { ...newItems[index], note: value as string }
    }
    setItems(newItems)
  }

  // Calculate totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
  }, [items])

  const totalPrice = useMemo(() => {
    return subtotal - discount + shippingFee
  }, [subtotal, discount, shippingFee])

  const handleSubmit = () => {
    if (!customerId || items.length === 0) return
    if (items.some(item => !item.productId)) return

    const orderItems: OrderItemRequest[] = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      note: item.note,
    }))

    onSubmit({
      id: order?.id,
      customerId,
      items: orderItems,
      discount: discount || undefined,
      discountReason: discountReason || undefined,
      shippingFee: shippingFee || undefined,
      note: note || undefined,
    })
    onClose()
  }

  const isValid = customerId && items.length > 0 && items.every(item => item.productId)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      TransitionProps={{ onEntered: handleEntered }}
    >
      <DialogTitle>{order ? 'Edit Order' : 'Create Order'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {/* Customer Selection */}
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Customer</Typography>
          <TextField
            fullWidth
            select
            required
            label="Select Customer"
            value={customerId}
            onChange={handleCustomerChange}
          >
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name} {customer.phoneNumber ? `- ${customer.phoneNumber}` : ''}
              </MenuItem>
            ))}
          </TextField>

          <Divider sx={{ my: 2 }} />

          {/* Order Items */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Order Items</Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddItem}
            >
              Add Item
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="center" sx={{ width: 80 }}>Qty</TableCell>
                  <TableCell align="right" sx={{ width: 120 }}>Unit Price</TableCell>
                  <TableCell align="right" sx={{ width: 120 }}>Line Total</TableCell>
                  <TableCell align="center" sx={{ width: 50 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        placeholder="Select product"
                      >
                        {products.map((product) => (
                          <MenuItem key={product.id} value={product.id}>
                            {product.name} - {formatVND(product.price)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        inputProps={{ min: 1, style: { textAlign: 'center' } }}
                        sx={{ width: 80 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        inputProps={{ min: 0, style: { textAlign: 'right' } }}
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatVND(item.unitPrice * item.quantity)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pricing Summary */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Discount"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Discount Reason"
                value={discountReason}
                onChange={(e) => setDiscountReason(e.target.value)}
                placeholder="Optional reason for discount"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Shipping Fee"
                value={shippingFee}
                onChange={(e) => setShippingFee(Number(e.target.value) || 0)}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pt: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Subtotal:</Typography>
                  <Typography variant="body2">{formatVND(subtotal)}</Typography>
                </Box>
                {discount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="error">Discount:</Typography>
                    <Typography variant="body2" color="error">-{formatVND(discount)}</Typography>
                  </Box>
                )}
                {shippingFee > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Shipping:</Typography>
                    <Typography variant="body2">+{formatVND(shippingFee)}</Typography>
                  </Box>
                )}
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle2">Total:</Typography>
                  <Typography variant="subtitle2" color="primary">{formatVND(totalPrice)}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Note */}
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Order Note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note for this order"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!isValid}>
          {order ? 'Save' : 'Create Order'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
