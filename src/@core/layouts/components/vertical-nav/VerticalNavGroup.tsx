import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Chip,
  useTheme,
} from '@mui/material'
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react'
import type { NavItem } from '@/types'
import { VerticalNavLink } from './VerticalNavLink'

interface VerticalNavGroupProps {
  item: NavItem
  collapsed: boolean
}

export const VerticalNavGroup = ({ item, collapsed }: VerticalNavGroupProps) => {
  const theme = useTheme()
  const location = useLocation()

  // Check if any child is active
  const isChildActive = item.children?.some((child) =>
    child.path ? location.pathname === child.path : false
  )

  const [open, setOpen] = useState(isChildActive || false)

  const handleToggle = () => {
    if (!collapsed) {
      setOpen(!open)
    }
  }

  return (
    <>
      <ListItem disablePadding sx={{ display: 'block' }}>
        <ListItemButton
          onClick={handleToggle}
          disabled={item.disabled}
          sx={{
            minHeight: 40,
            borderRadius: 1,
            px: collapsed ? 1.5 : 2.5,
            mx: collapsed ? 1 : 1.5,
            justifyContent: collapsed ? 'center' : 'flex-start',
            backgroundColor: isChildActive ? `${theme.palette.primary.main}08` : 'transparent',
            color: isChildActive ? theme.palette.primary.main : theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '& .MuiListItemIcon-root': {
              color: isChildActive ? theme.palette.primary.main : theme.palette.text.secondary,
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
                  fontWeight: isChildActive ? 500 : 400,
                }}
              />
              {item.badge && (
                <Chip
                  label={item.badge}
                  size="small"
                  color={item.badgeColor || 'primary'}
                  sx={{ height: 20, fontSize: '0.75rem', mr: 1 }}
                />
              )}
              {open ? (
                <IconChevronDown size={18} />
              ) : (
                <IconChevronRight size={18} />
              )}
            </>
          )}
        </ListItemButton>
      </ListItem>
      {!collapsed && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 2 }}>
            {item.children?.map((child) =>
              child.children ? (
                <VerticalNavGroup key={child.title} item={child} collapsed={collapsed} />
              ) : (
                <VerticalNavLink key={child.title} item={child} collapsed={collapsed} />
              )
            )}
          </List>
        </Collapse>
      )}
    </>
  )
}
