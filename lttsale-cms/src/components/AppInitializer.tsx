import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box, CircularProgress, Typography } from '@mui/material'
import {
  useOrdersStore,
  useProductsStore,
  useCustomersStore,
  useCategoriesStore,
  useBuildingsStore,
} from '@/store'
import { useAuthStore } from '@/store/authStore'
import { getAccessToken } from '@/api'

interface AppInitializerProps {
  children: React.ReactNode
}

// Public paths that don't require authentication
const publicPaths = ['/auth/login', '/404', '/500']

export const AppInitializer = ({ children }: AppInitializerProps) => {
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initRef = useRef(false)
  const location = useLocation()
  const navigate = useNavigate()

  const { isAuthenticated, fetchCurrentUser, fetchUserPermissions, isLoading: authLoading } = useAuthStore()

  const fetchOrders = useOrdersStore((state) => state.fetchOrders)
  const fetchProducts = useProductsStore((state) => state.fetchProducts)
  const fetchCustomers = useCustomersStore((state) => state.fetchCustomers)
  const fetchCategories = useCategoriesStore((state) => state.fetchCategories)
  const fetchBuildings = useBuildingsStore((state) => state.fetchBuildings)
  const fetchApartments = useBuildingsStore((state) => state.fetchApartments)

  const isPublicPath = publicPaths.some((path) => location.pathname.startsWith(path))

  useEffect(() => {
    // Prevent double initialization in React strict mode
    if (initRef.current) return
    initRef.current = true

    const initializeApp = async () => {
      const token = getAccessToken()

      // If on public path, just mark as initialized
      if (isPublicPath) {
        // If user has token and is on login page, redirect to dashboard
        if (token && location.pathname === '/auth/login') {
          try {
            await fetchCurrentUser()
            navigate('/dashboards/analytics', { replace: true })
          } catch {
            // Token invalid, stay on login
          }
        }
        setInitialized(true)
        return
      }

      // If no token, redirect to login
      if (!token) {
        navigate('/auth/login', { replace: true })
        setInitialized(true)
        return
      }

      // Try to restore session
      try {
        await fetchCurrentUser()
      } catch {
        // fetchCurrentUser failed, token might be expired/invalid
        navigate('/auth/login', { replace: true })
        setInitialized(true)
        return
      }

      // Load app data and user permissions
      try {
        await Promise.all([
          fetchCategories(),
          fetchBuildings(),
          fetchApartments(),
          fetchProducts(),
          fetchCustomers(),
          fetchOrders(),
          fetchUserPermissions(),
        ])
        setInitialized(true)
      } catch (err) {
        console.error('Initialization error:', err)
        setError('Failed to load application data')
        setInitialized(true)
      }
    }

    initializeApp()
  }, []) // Empty dependency array - only run once on mount

  // Handle navigation after auth state changes (e.g., logout)
  useEffect(() => {
    if (initialized && !isPublicPath && !isAuthenticated && !getAccessToken()) {
      navigate('/auth/login', { replace: true })
    }
  }, [initialized, isPublicPath, isAuthenticated, navigate])

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Typography color="text.secondary">
          Please refresh the page to try again.
        </Typography>
      </Box>
    )
  }

  if (!initialized || authLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography color="text.secondary">Loading...</Typography>
      </Box>
    )
  }

  return <>{children}</>
}
