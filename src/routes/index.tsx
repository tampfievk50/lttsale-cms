import { lazy } from 'react'
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { VerticalLayout, BlankLayout } from '@core/layouts'
import { AppInitializer } from '@/components'

// Lazy-loaded pages
const AnalyticsDashboard = lazy(() => import('@/pages/dashboards/analytics'))
const OrdersList = lazy(() => import('@/pages/orders/list'))
const ProductsList = lazy(() => import('@/pages/products/list'))
const CustomersList = lazy(() => import('@/pages/customers/list'))
const CategoriesPage = lazy(() => import('@/pages/settings/categories'))
const BuildingsPage = lazy(() => import('@/pages/settings/buildings'))
const ApartmentsPage = lazy(() => import('@/pages/settings/apartments'))
const AccountPage = lazy(() => import('@/pages/settings/account'))
const UsersPage = lazy(() => import('@/pages/settings/users'))
const RolesPage = lazy(() => import('@/pages/settings/roles'))
const PermissionsPage = lazy(() => import('@/pages/settings/permissions'))
const RolePermissionsPage = lazy(() => import('@/pages/settings/role-permissions'))
const DomainsPage = lazy(() => import('@/pages/settings/domains'))
const LoginPage = lazy(() => import('@/pages/auth/login'))
const Page404 = lazy(() => import('@/pages/misc/404'))
const Page500 = lazy(() => import('@/pages/misc/500'))

// Wrapper component that provides AppInitializer context
const AppWrapper = () => (
  <AppInitializer>
    <Outlet />
  </AppInitializer>
)

export const router = createBrowserRouter([
  {
    element: <AppWrapper />,
    children: [
      {
        path: '/',
        element: <VerticalLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboards/analytics" replace />,
          },
          // Dashboards
          {
            path: 'dashboards/analytics',
            element: <AnalyticsDashboard />,
          },
          // Orders
          {
            path: 'orders/list',
            element: <OrdersList />,
          },
          // Products
          {
            path: 'products/list',
            element: <ProductsList />,
          },
          // Customers
          {
            path: 'customers/list',
            element: <CustomersList />,
          },
          // Settings
          {
            path: 'settings/categories',
            element: <CategoriesPage />,
          },
          {
            path: 'settings/buildings',
            element: <BuildingsPage />,
          },
          {
            path: 'settings/apartments',
            element: <ApartmentsPage />,
          },
          {
            path: 'settings/account',
            element: <AccountPage />,
          },
          // Administration
          {
            path: 'settings/users',
            element: <UsersPage />,
          },
          {
            path: 'settings/roles',
            element: <RolesPage />,
          },
          {
            path: 'settings/permissions',
            element: <PermissionsPage />,
          },
          {
            path: 'settings/role-permissions',
            element: <RolePermissionsPage />,
          },
          {
            path: 'settings/domains',
            element: <DomainsPage />,
          },
        ],
      },
      {
        element: <BlankLayout />,
        children: [
          // Auth
          {
            path: 'auth/login',
            element: <LoginPage />,
          },
          // Registration disabled — SSO only
          // Misc
          {
            path: '404',
            element: <Page404 />,
          },
          {
            path: '500',
            element: <Page500 />,
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/404" replace />,
      },
    ],
  },
])
