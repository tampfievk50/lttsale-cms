import { useState, useMemo, Suspense } from 'react'
import { Outlet, useLocation, Navigate } from 'react-router-dom'
import { Box, CircularProgress, Snackbar, Alert, useTheme, useMediaQuery } from '@mui/material'
import { layoutConfig } from '@/configs/themeConfig'
import { useSettingsStore } from '@/store/settingsStore'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { VerticalNav } from './components/vertical-nav'
import { Navbar } from './components/navbar'
import { Footer } from './components/footer'
import { navigation } from '@/configs/navigation'

// Map nav paths to required permissions (method, API path)
const permissionPaths: Record<string, { method: string; path: string }> = {
  // Management
  '/dashboards/analytics': { method: 'GET', path: '/api/analytics' },
  '/orders/list': { method: 'GET', path: '/api/orders' },
  '/products/list': { method: 'GET', path: '/api/products' },
  '/customers/list': { method: 'GET', path: '/api/customers' },
  // Settings
  '/settings/categories': { method: 'GET', path: '/api/categories' },
  '/settings/buildings': { method: 'GET', path: '/api/buildings' },
  '/settings/apartments': { method: 'GET', path: '/api/apartments' },
  // Administration
  '/settings/users': { method: '*', path: '/v1/account' },
  '/settings/roles': { method: '*', path: '/v1/role' },
  '/settings/permissions': { method: '*', path: '/v1/permission' },
  '/settings/role-permissions': { method: '*', path: '/v1/policy' },
  '/settings/domains': { method: '*', path: '/v1/resource' },
}

export const VerticalLayout = () => {
  const theme = useTheme()
  const location = useLocation()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const navCollapsed = useSettingsStore((state) => state.navCollapsed)
  const contentWidth = useSettingsStore((state) => state.contentWidth)
  const hasPermission = useAuthStore((state) => state.hasPermission)
  const user = useAuthStore((state) => state.user)
  const notification = useNotificationStore((state) => state.notification)
  const clearNotification = useNotificationStore((state) => state.clear)
  const showNotification = useNotificationStore((state) => state.show)

  const handleMobileMenuToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleMobileClose = () => {
    setMobileOpen(false)
  }

  const sidebarWidth = isMobile
    ? 0
    : navCollapsed
      ? layoutConfig.sidebarCollapsedWidth
      : layoutConfig.sidebarWidth

  // Filter navigation items based on user permissions
  const filteredNavigation = useMemo(() => {
    return navigation
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (!item.path) return true
          // Account page is always accessible
          if (item.path === '/settings/account') return true
          const required = permissionPaths[item.path]
          if (!required) return true
          return hasPermission(required.method, required.path)
        }),
      }))
      .filter((section) => section.items.length > 0)
  }, [hasPermission, user])

  // Check if current route is allowed
  const currentPath = location.pathname
  const requiredPerm = permissionPaths[currentPath]
  const isAccountPage = currentPath === '/settings/account'
  const routeAllowed = !requiredPerm || isAccountPage || hasPermission(requiredPerm.method, requiredPerm.path)

  // Show notification and redirect if route not allowed
  if (!routeAllowed) {
    // Find first accessible page to redirect to
    const firstAccessible = filteredNavigation
      .flatMap((s) => s.items)
      .find((item) => item.path && item.path !== currentPath)
    showNotification('You do not have permission to access this page', 'warning')
    return <Navigate to={firstAccessible?.path || '/settings/account'} replace />
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <VerticalNav
        navItems={filteredNavigation}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minHeight: '100vh',
          width: `calc(100% - ${sidebarWidth}px)`,
          backgroundColor: theme.palette.background.default,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Navbar onMobileMenuToggle={handleMobileMenuToggle} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: layoutConfig.contentPadding,
            maxWidth: contentWidth === 'boxed' ? 1440 : '100%',
            mx: 'auto',
            width: '100%',
          }}
        >
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            }
          >
            <Outlet />
          </Suspense>
        </Box>

        <Footer />
      </Box>

      {/* Global notification snackbar */}
      <Snackbar
        open={!!notification}
        autoHideDuration={4000}
        onClose={clearNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={clearNotification}
          severity={notification?.severity || 'error'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
