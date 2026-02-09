import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText, useTheme } from '@mui/material'
import { IconSun, IconMoon, IconDeviceDesktop } from '@tabler/icons-react'
import { useState } from 'react'
import { useSettingsStore } from '@/store/settingsStore'
import type { Mode } from '@/types'

export const ThemeSwitcher = () => {
  const theme = useTheme()
  const mode = useSettingsStore((state) => state.mode)
  const setMode = useSettingsStore((state) => state.setMode)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode)
    handleClose()
  }

  const getCurrentIcon = () => {
    switch (mode) {
      case 'light':
        return <IconSun size={20} />
      case 'dark':
        return <IconMoon size={20} />
      case 'system':
        return <IconDeviceDesktop size={20} />
    }
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{ color: theme.palette.text.secondary }}
      >
        {getCurrentIcon()}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleModeChange('light')} selected={mode === 'light'}>
          <ListItemIcon>
            <IconSun size={20} />
          </ListItemIcon>
          <ListItemText>Light</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleModeChange('dark')} selected={mode === 'dark'}>
          <ListItemIcon>
            <IconMoon size={20} />
          </ListItemIcon>
          <ListItemText>Dark</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleModeChange('system')} selected={mode === 'system'}>
          <ListItemIcon>
            <IconDeviceDesktop size={20} />
          </ListItemIcon>
          <ListItemText>System</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
