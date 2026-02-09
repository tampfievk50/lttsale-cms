import { AppBar, Box, IconButton, Toolbar, useTheme, useMediaQuery } from '@mui/material'
import { IconMenu2 } from '@tabler/icons-react'
import { layoutConfig } from '@/configs/themeConfig'
import { useSettingsStore } from '@/store/settingsStore'
import { NavbarSearch } from './NavbarSearch'
import { ThemeSwitcher } from './ThemeSwitcher'
import { UserDropdown } from './UserDropdown'

interface NavbarProps {
  onMobileMenuToggle: () => void
}

export const Navbar = ({ onMobileMenuToggle }: NavbarProps) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const navbarType = useSettingsStore((state) => state.navbarType)
  const skin = useSettingsStore((state) => state.skin)

  if (navbarType === 'hidden') return null

  return (
    <AppBar
      position={navbarType === 'sticky' ? 'sticky' : 'static'}
      elevation={0}
      sx={{
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: skin === 'bordered' ? `1px solid ${theme.palette.divider}` : 'none',
        boxShadow: skin === 'default' ? '0 4px 8px -4px rgba(0,0,0,0.08)' : 'none',
        width: '100%',
        top: 0,
        zIndex: theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          minHeight: `${layoutConfig.navbarHeight}px !important`,
          px: { xs: 2, lg: 3 },
        }}
      >
        {isMobile && (
          <IconButton
            edge="start"
            onClick={onMobileMenuToggle}
            sx={{ mr: 2, color: theme.palette.text.secondary }}
          >
            <IconMenu2 size={24} />
          </IconButton>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <NavbarSearch />
          <ThemeSwitcher />
          <UserDropdown />
        </Box>
      </Toolbar>
    </AppBar>
  )
}
