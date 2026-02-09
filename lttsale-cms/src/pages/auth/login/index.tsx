import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Link as MuiLink,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material'
import { IconEye, IconEyeOff, IconMail, IconLock } from '@tabler/icons-react'
import { useAuthStore } from '@/store/authStore'

const LoginPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  })

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login(formData.email, formData.password)
    if (success) {
      navigate('/dashboards/analytics')
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              fontWeight={700}
              color="primary"
              sx={{ mb: 1 }}
            >
              LTTSale
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account to continue
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              id="login-email"
              name="email"
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              disabled={isLoading}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconMail size={20} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              id="login-password"
              name="password"
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange('password')}
              disabled={isLoading}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconLock size={20} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    id="login-remember"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange('remember')}
                    size="small"
                    disabled={isLoading}
                  />
                }
                label="Remember me"
                slotProps={{ typography: { variant: 'body2' } }}
              />
              <MuiLink
                component={Link}
                to="#"
                variant="body2"
                underline="hover"
              >
                Forgot password?
              </MuiLink>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mb: 3 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>

          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default LoginPage
