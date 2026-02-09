import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material'
import { IconUser, IconSettings, IconLogout } from '@tabler/icons-react'

export const UserDropdown = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    handleClose()
  }

  const handleLogout = () => {
    navigate('/auth/login')
    handleClose()
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{ p: 0.5 }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            backgroundColor: theme.palette.primary.main,
            fontSize: '0.875rem',
          }}
        >
          A
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: { minWidth: 200, mt: 1 },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            Admin User
          </Typography>
          <Typography variant="body2" color="text.secondary">
            admin@lttsale.com
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => handleNavigation('/settings/account')}>
          <ListItemIcon>
            <IconUser size={20} />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleNavigation('/settings/account')}>
          <ListItemIcon>
            <IconSettings size={20} />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <IconLogout size={20} />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </>
  )
}
