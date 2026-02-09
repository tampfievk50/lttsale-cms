import { useState } from 'react'
import {
  Box,
  IconButton,
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  IconSearch,
  IconChartBar,
  IconShoppingCart,
  IconPackage,
  IconUsers,
  IconSettings,
} from '@tabler/icons-react'

interface SearchItem {
  title: string
  path: string
  icon: React.ReactNode
  category: string
}

const searchItems: SearchItem[] = [
  { title: 'Analytics Dashboard', path: '/dashboards/analytics', icon: <IconChartBar size={20} />, category: 'Dashboards' },
  { title: 'Orders List', path: '/orders/list', icon: <IconShoppingCart size={20} />, category: 'Orders' },
  { title: 'Add New Order', path: '/orders/add', icon: <IconShoppingCart size={20} />, category: 'Orders' },
  { title: 'Products List', path: '/products/list', icon: <IconPackage size={20} />, category: 'Products' },
  { title: 'Add New Product', path: '/products/add', icon: <IconPackage size={20} />, category: 'Products' },
  { title: 'Customers List', path: '/customers/list', icon: <IconUsers size={20} />, category: 'Customers' },
  { title: 'Add New Customer', path: '/customers/add', icon: <IconUsers size={20} />, category: 'Customers' },
  { title: 'Categories', path: '/settings/categories', icon: <IconSettings size={20} />, category: 'Settings' },
  { title: 'Buildings', path: '/settings/buildings', icon: <IconSettings size={20} />, category: 'Settings' },
  { title: 'Account Settings', path: '/settings/account', icon: <IconSettings size={20} />, category: 'Settings' },
]

export const NavbarSearch = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false)
    setSearch('')
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    handleClose()
  }

  const filteredItems = search
    ? searchItems.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.category.toLowerCase().includes(search.toLowerCase())
      )
    : searchItems.slice(0, 5)

  return (
    <>
      <IconButton onClick={handleOpen} sx={{ color: theme.palette.text.secondary }}>
        <IconSearch size={20} />
      </IconButton>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            position: 'absolute',
            top: '15%',
            borderRadius: 2,
          },
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <TextField
            id="navbar-search"
            name="search"
            fullWidth
            placeholder="Search pages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={20} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                '& fieldset': { border: 'none' },
              },
            }}
          />
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {filteredItems.length > 0 ? (
              <List>
                {filteredItems.map((item) => (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton onClick={() => handleNavigate(item.path)}>
                      <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        secondary={item.category}
                        primaryTypographyProps={{ fontSize: '0.9375rem' }}
                        secondaryTypographyProps={{ fontSize: '0.75rem' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">No results found</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}
