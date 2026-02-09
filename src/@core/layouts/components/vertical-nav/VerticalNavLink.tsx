import { NavLink, useLocation } from 'react-router-dom'
import { ListItem, ListItemButton, ListItemIcon, ListItemText, Chip, useTheme } from '@mui/material'
import type { NavItem } from '@/types'

interface VerticalNavLinkProps {
  item: NavItem
  collapsed: boolean
}

export const VerticalNavLink = ({ item, collapsed }: VerticalNavLinkProps) => {
  const theme = useTheme()
  const location = useLocation()
  const isActive = item.path ? location.pathname === item.path : false

  const linkContent = (
    <ListItemButton
      disabled={item.disabled}
      sx={{
        minHeight: 40,
        borderRadius: 1,
        px: collapsed ? 1.5 : 2.5,
        mx: collapsed ? 1 : 1.5,
        justifyContent: collapsed ? 'center' : 'flex-start',
        backgroundColor: isActive ? `${theme.palette.primary.main}14` : 'transparent',
        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
        '&:hover': {
          backgroundColor: isActive
            ? `${theme.palette.primary.main}20`
            : theme.palette.action.hover,
        },
        '& .MuiListItemIcon-root': {
          color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
          minWidth: collapsed ? 0 : 36,
        },
      }}
    >
      {item.icon && (
        <ListItemIcon sx={{ mr: collapsed ? 0 : 1 }}>
          {item.icon}
        </ListItemIcon>
      )}
      {!collapsed && (
        <>
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              fontSize: '0.9375rem',
              fontWeight: isActive ? 500 : 400,
            }}
          />
          {item.badge && (
            <Chip
              label={item.badge}
              size="small"
              color={item.badgeColor || 'primary'}
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
          )}
        </>
      )}
    </ListItemButton>
  )

  if (item.path) {
    return (
      <ListItem disablePadding sx={{ display: 'block' }}>
        <NavLink to={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
          {linkContent}
        </NavLink>
      </ListItem>
    )
  }

  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      {linkContent}
    </ListItem>
  )
}
