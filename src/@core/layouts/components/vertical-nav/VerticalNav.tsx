import { Box, Drawer, List, useTheme, useMediaQuery, IconButton, Typography } from '@mui/material'
import { IconX, IconMenu2 } from '@tabler/icons-react'
import { layoutConfig } from '@/configs/themeConfig'
import { useSettingsStore } from '@/store/settingsStore'
import type { NavGroup } from '@/types'
import { VerticalNavLink } from './VerticalNavLink'
import { VerticalNavGroup } from './VerticalNavGroup'
import { VerticalNavSectionTitle } from './VerticalNavSectionTitle'

interface VerticalNavProps {
  navItems: NavGroup
  mobileOpen: boolean
  onMobileClose: () => void
}

export const VerticalNav = ({ navItems, mobileOpen, onMobileClose }: VerticalNavProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const navCollapsed = useSettingsStore((state) => state.navCollapsed)
  const semiDark = useSettingsStore((state) => state.semiDark)
  const toggleNavCollapsed = useSettingsStore((state) => state.toggleNavCollapsed)

  const actualCollapsed = isMobile ? false : navCollapsed
  const width = actualCollapsed ? layoutConfig.sidebarCollapsedWidth : layoutConfig.sidebarWidth

  const sidebarBgColor = semiDark
    ? theme.palette.mode === 'light'
      ? '#25293C'
      : theme.palette.background.paper
    : theme.palette.background.paper

  const sidebarTextColor = semiDark
    ? theme.palette.mode === 'light'
      ? '#E1DEF5'
      : theme.palette.text.primary
    : theme.palette.text.primary

  const navContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: sidebarBgColor,
        color: sidebarTextColor,
      }}
    >
      {/* Logo Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: actualCollapsed ? 'center' : 'space-between',
          height: layoutConfig.navbarHeight + 10,
          px: actualCollapsed ? 1 : 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {!actualCollapsed && (
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            LTTSale
          </Typography>
        )}
        {!isMobile && (
          <IconButton
            onClick={toggleNavCollapsed}
            size="small"
            sx={{ color: semiDark && theme.palette.mode === 'light' ? '#E1DEF5' : 'inherit' }}
          >
            <IconMenu2 size={20} />
          </IconButton>
        )}
        {isMobile && (
          <IconButton
            onClick={onMobileClose}
            size="small"
            sx={{ color: 'inherit' }}
          >
            <IconX size={20} />
          </IconButton>
        )}
      </Box>

      {/* Navigation Items */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 1,
          '&::-webkit-scrollbar': {
            width: 4,
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 4,
          },
        }}
      >
        <List component="nav" sx={{ px: 0 }}>
          {navItems.map((section) => (
            <Box key={section.title}>
              <VerticalNavSectionTitle title={section.title} collapsed={actualCollapsed} />
              {section.items.map((item) =>
                item.children ? (
                  <VerticalNavGroup key={item.title} item={item} collapsed={actualCollapsed} />
                ) : (
                  <VerticalNavLink key={item.title} item={item} collapsed={actualCollapsed} />
                )
              )}
            </Box>
          ))}
        </List>
      </Box>
    </Box>
  )

  // Mobile Drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: layoutConfig.sidebarWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {navContent}
      </Drawer>
    )
  }

  // Desktop Sidebar
  return (
    <Box
      component="nav"
      sx={{
        width,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          '& .MuiDrawer-paper': {
            width,
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
        open
      >
        {navContent}
      </Drawer>
    </Box>
  )
}
