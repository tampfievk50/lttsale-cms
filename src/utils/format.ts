// Format number with thousand separators (Vietnamese style)
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value)
}

// Format currency in VND
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

// Format currency short (without currency symbol, just number + đ)
export const formatVND = (value: number): string => {
  return `${formatNumber(value)} đ`
}

// Get date string in YYYY-MM-DD format (using local timezone)
export const formatDateInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Get default date range (1 week ago to today)
export const getDefaultDateRange = (): { dateFrom: string; dateTo: string } => {
  const today = new Date()
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(today.getDate() - 7)

  return {
    dateFrom: formatDateInput(oneWeekAgo),
    dateTo: formatDateInput(today),
  }
}
