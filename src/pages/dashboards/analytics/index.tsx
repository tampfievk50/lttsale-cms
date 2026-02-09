import { useState, useMemo } from 'react'
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  TextField,
  MenuItem,
  useTheme,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import {
  IconShoppingCart,
  IconCurrencyDollar,
  IconTruck,
  IconCash,
} from '@tabler/icons-react'
import { PageHeader, StatusChip } from '@/components'
import { useOrdersStore, useCustomersStore, useCategoriesStore } from '@/store'
import { formatVND, formatNumber, getDefaultDateRange } from '@/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  subtitle?: string
}

const StatCard = ({ title, value, icon, color, subtitle }: StatCardProps) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={600}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ minHeight: 18, display: 'block' }}>
              {subtitle || '\u00A0'}
            </Typography>
          </Box>
          <Avatar
            sx={{
              backgroundColor: `${color}14`,
              color: color,
              width: 44,
              height: 44,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )
}

const AnalyticsDashboard = () => {
  const theme = useTheme()
  const orders = useOrdersStore((state) => state.orders)
  const customers = useCustomersStore((state) => state.customers)
  const categories = useCategoriesStore((state) => state.categories)

  const defaultDates = getDefaultDateRange()
  const [dateFrom, setDateFrom] = useState(defaultDates.dateFrom)
  const [dateTo, setDateTo] = useState(defaultDates.dateTo)
  const [selectedCustomer, setSelectedCustomer] = useState('')

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt)

      if (dateFrom) {
        // Parse date as local timezone by adding time component
        const fromDate = new Date(dateFrom + 'T00:00:00')
        if (orderDate < fromDate) return false
      }

      if (dateTo) {
        // Parse date as local timezone and set to end of day
        const toDate = new Date(dateTo + 'T23:59:59.999')
        if (orderDate > toDate) return false
      }

      if (selectedCustomer && order.customerId !== selectedCustomer) {
        return false
      }

      return true
    })
  }, [orders, dateFrom, dateTo, selectedCustomer])

  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalPrice, 0)
    const deliveredOrders = filteredOrders.filter((order) => order.status === 'delivered').length
    const pendingOrders = totalOrders - deliveredOrders
    const paidOrders = filteredOrders.filter((order) => order.paymentStatus === 'paid').length
    const unpaidOrders = totalOrders - paidOrders

    return {
      totalOrders,
      totalRevenue,
      deliveredOrders,
      pendingOrders,
      paidOrders,
      unpaidOrders,
    }
  }, [filteredOrders])

  // Chart data for delivery status
  const deliveryChartData = useMemo(() => [
    { name: 'Delivered', value: stats.deliveredOrders, color: theme.palette.success.main },
    { name: 'Pending', value: stats.pendingOrders, color: theme.palette.warning.main },
  ], [stats, theme])

  // Chart data for payment status
  const paymentChartData = useMemo(() => [
    { name: 'Paid', value: stats.paidOrders, color: theme.palette.info.main },
    { name: 'Unpaid', value: stats.unpaidOrders, color: theme.palette.error.main },
  ], [stats, theme])

  // Chart data for revenue by category (from order items)
  const categoryChartData = useMemo(() => {
    const categoryRevenue: Record<string, number> = {}

    filteredOrders.forEach((order) => {
      if (order.items && order.items.length > 0) {
        order.items.forEach((item) => {
          const categoryId = item.productCategory || 'unknown'
          categoryRevenue[categoryId] = (categoryRevenue[categoryId] || 0) + item.lineTotal
        })
      } else {
        categoryRevenue['unknown'] = (categoryRevenue['unknown'] || 0) + order.totalPrice
      }
    })

    return Object.entries(categoryRevenue).map(([categoryId, revenue]) => {
      const category = categories.find((c) => c.id === categoryId || c.name === categoryId)
      return {
        name: category?.name || categoryId === 'unknown' ? 'Other' : categoryId,
        revenue: parseFloat(revenue.toFixed(2)),
      }
    })
  }, [filteredOrders, categories])

  // Stable multipliers for chart data (generated once per component mount)
  const [chartMultipliers] = useState(() =>
    Array.from({ length: 7 }, () => ({
      revenue: 0.5 + Math.random(),
      orders: 0.5 + Math.random(),
    }))
  )

  // Chart data for orders over time (last 7 days simulation)
  const revenueChartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((day, index) => ({
      name: day,
      revenue: Math.round((stats.totalRevenue / 7) * chartMultipliers[index].revenue),
      orders: Math.round((stats.totalOrders / 7) * chartMultipliers[index].orders),
    }))
  }, [stats, chartMultipliers])

  return (
    <Box>
      <PageHeader
        title="Analytics Dashboard"
        subtitle="Overview of your sales performance"
        breadcrumbs={[
          { label: 'Dashboards', path: '/' },
          { label: 'Analytics' },
        ]}
      />

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              alignItems: 'center',
            }}
          >
            <TextField
              id="analytics-date-from"
              name="dateFrom"
              label="From Date"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
            <TextField
              id="analytics-date-to"
              name="dateTo"
              label="To Date"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
            <TextField
              id="analytics-customer"
              name="selectedCustomer"
              select
              label="Customer"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">All Customers</MenuItem>
              {customers.map((customer) => (
                <MenuItem key={customer.id} value={customer.id}>
                  {customer.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<IconShoppingCart size={24} />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Revenue"
            value={formatVND(stats.totalRevenue)}
            icon={<IconCurrencyDollar size={24} />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Delivered"
            value={stats.deliveredOrders}
            icon={<IconTruck size={24} />}
            color={theme.palette.info.main}
            subtitle={`${stats.pendingOrders} pending`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Paid"
            value={stats.paidOrders}
            icon={<IconCash size={24} />}
            color={theme.palette.warning.main}
            subtitle={`${stats.unpaidOrders} unpaid`}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue Trend Chart */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader title="Revenue Trend" />
            <CardContent>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={revenueChartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="name"
                      stroke={theme.palette.text.secondary}
                      fontSize={12}
                    />
                    <YAxis
                      stroke={theme.palette.text.secondary}
                      fontSize={12}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                      formatter={(value) => [formatVND(value as number), 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Delivery Status Pie Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Delivery Status" />
            <CardContent>
              <Box sx={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={deliveryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deliveryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Second Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue by Category */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardHeader title="Revenue by Category" />
            <CardContent>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="name"
                      stroke={theme.palette.text.secondary}
                      fontSize={12}
                    />
                    <YAxis
                      stroke={theme.palette.text.secondary}
                      fontSize={12}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                      formatter={(value) => [formatVND(value as number), 'Revenue']}
                    />
                    <Bar
                      dataKey="revenue"
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Status Pie Chart */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Payment Status" />
            <CardContent>
              <Box sx={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={paymentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Orders Table */}
      <Card>
        <CardHeader title="Recent Orders" />
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Items</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell align="right">Qty</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Paid</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.slice(0, 10).map((order) => {
                  const firstItem = order.items?.[0]
                  const productName = firstItem?.productName || 'Unknown'
                  const productImage = firstItem?.productImage
                  const itemCount = order.items?.length || 0
                  const totalQty = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0

                  return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {productImage ? (
                          <Avatar
                            src={productImage}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          />
                        ) : (
                          <Avatar variant="rounded" sx={{ width: 40, height: 40 }}>
                            {productName.charAt(0)}
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {itemCount > 1 ? `+${itemCount - 1} more` : formatVND(firstItem?.unitPrice || 0)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{order.customer?.name || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {order.customer?.phoneNumber}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{totalQty}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={500}>
                        {formatVND(order.totalPrice)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip
                        status={order.status === 'delivered'}
                        trueLabel="Delivered"
                        falseLabel={order.status}
                        trueColor="success"
                        falseColor="warning"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <StatusChip
                        status={order.paymentStatus === 'paid'}
                        trueLabel="Paid"
                        falseLabel="Unpaid"
                        trueColor="info"
                        falseColor="error"
                      />
                    </TableCell>
                  </TableRow>
                  )
                })}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No orders found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AnalyticsDashboard
