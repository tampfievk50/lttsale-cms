import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  Typography,
  Divider,
  FormControlLabel,
  Switch,
  MenuItem,
  Alert,
} from '@mui/material'
import { IconDeviceFloppy, IconUser } from '@tabler/icons-react'
import { PageHeader } from '@/components'
import { useSettingsStore } from '@/store'
import { useAuthStore } from '@/store/authStore'

const AccountPage = () => {
  const settings = useSettingsStore()
  const { user, updateProfile, isLoading, error } = useAuthStore()
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    setSuccess(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ok = await updateProfile({ name: formData.name, phone: formData.phone })
    if (ok) setSuccess(true)
  }

  return (
    <Box>
      <PageHeader
        title="Account Settings"
        subtitle="Manage your profile and preferences"
        breadcrumbs={[
          { label: 'Settings', path: '/settings/categories' },
          { label: 'Account' },
        ]}
      />

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Avatar
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                <IconUser size={48} />
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                {user?.name || 'User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || ''}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Role: {user?.role || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Profile Form */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Profile Information
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  Profile saved successfully!
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="account-name"
                      name="name"
                      fullWidth
                      label="Name"
                      value={formData.name}
                      onChange={handleChange('name')}
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="account-email"
                      name="email"
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      disabled
                      helperText="Email is managed by SSO"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="account-phone"
                      name="phone"
                      fullWidth
                      label="Phone"
                      value={formData.phone}
                      onChange={handleChange('phone')}
                      disabled={isLoading}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<IconDeviceFloppy size={18} />}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Theme Settings */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Theme Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    id="settings-theme-mode"
                    name="mode"
                    fullWidth
                    select
                    label="Theme Mode"
                    value={settings.mode}
                    onChange={(e) => settings.setMode(e.target.value as 'light' | 'dark' | 'system')}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    id="settings-skin"
                    name="skin"
                    fullWidth
                    select
                    label="Skin"
                    value={settings.skin}
                    onChange={(e) => settings.setSkin(e.target.value as 'default' | 'bordered')}
                  >
                    <MenuItem value="default">Default</MenuItem>
                    <MenuItem value="bordered">Bordered</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    id="settings-navbar-type"
                    name="navbarType"
                    fullWidth
                    select
                    label="Navbar Type"
                    value={settings.navbarType}
                    onChange={(e) => settings.setNavbarType(e.target.value as 'sticky' | 'static' | 'hidden')}
                  >
                    <MenuItem value="sticky">Sticky</MenuItem>
                    <MenuItem value="static">Static</MenuItem>
                    <MenuItem value="hidden">Hidden</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    id="settings-content-width"
                    name="contentWidth"
                    fullWidth
                    select
                    label="Content Width"
                    value={settings.contentWidth}
                    onChange={(e) => settings.setContentWidth(e.target.value as 'fluid' | 'boxed')}
                  >
                    <MenuItem value="fluid">Fluid</MenuItem>
                    <MenuItem value="boxed">Boxed</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        id="settings-semi-dark"
                        name="semiDark"
                        checked={settings.semiDark}
                        onChange={(e) => settings.setSemiDark(e.target.checked)}
                      />
                    }
                    label="Semi Dark Sidebar"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        id="settings-nav-collapsed"
                        name="navCollapsed"
                        checked={settings.navCollapsed}
                        onChange={(e) => settings.setNavCollapsed(e.target.checked)}
                      />
                    }
                    label="Collapsed Sidebar"
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={settings.resetSettings}
                  >
                    Reset to Defaults
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AccountPage
