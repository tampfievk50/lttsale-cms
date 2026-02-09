import {
  IconChartBar,
  IconShoppingCart,
  IconPackage,
  IconUsers,
  IconCategory,
  IconBuilding,
  IconHome,
  IconUser,
  IconUserCog,
  IconShield,
  IconLock,
  IconShieldCheck,
  IconWorld,
} from '@tabler/icons-react'
import type { NavGroup } from '@/types'

export const navigation: NavGroup = [
  {
    title: 'Dashboards',
    items: [
      {
        title: 'Analytics',
        path: '/dashboards/analytics',
        icon: <IconChartBar size={22} />,
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        title: 'Orders',
        path: '/orders/list',
        icon: <IconShoppingCart size={22} />,
      },
      {
        title: 'Products',
        path: '/products/list',
        icon: <IconPackage size={22} />,
      },
      {
        title: 'Customers',
        path: '/customers/list',
        icon: <IconUsers size={22} />,
      },
      {
        title: 'Categories',
        path: '/settings/categories',
        icon: <IconCategory size={22} />,
      },
      {
        title: 'Buildings',
        path: '/settings/buildings',
        icon: <IconBuilding size={22} />,
      },
      {
        title: 'Apartments',
        path: '/settings/apartments',
        icon: <IconHome size={22} />,
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        title: 'Users',
        path: '/settings/users',
        icon: <IconUserCog size={22} />,
      },
      {
        title: 'Roles',
        path: '/settings/roles',
        icon: <IconShield size={22} />,
      },
      {
        title: 'Permissions',
        path: '/settings/permissions',
        icon: <IconLock size={22} />,
      },
      {
        title: 'Role Permissions',
        path: '/settings/role-permissions',
        icon: <IconShieldCheck size={22} />,
      },
      {
        title: 'Domains',
        path: '/settings/domains',
        icon: <IconWorld size={22} />,
      },
      {
        title: 'Account',
        path: '/settings/account',
        icon: <IconUser size={22} />,
      },
    ],
  },
]
