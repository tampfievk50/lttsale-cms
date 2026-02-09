import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, useTheme } from '@mui/material'
import { IconHome, IconArrowLeft } from '@tabler/icons-react'

const Page404 = () => {
  const theme = useTheme()
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 4,
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '6rem', md: '10rem' },
          fontWeight: 700,
          color: theme.palette.primary.main,
          lineHeight: 1,
          mb: 2,
        }}
      >
        404
      </Typography>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 400 }}
      >
        The page you are looking for doesn't exist or has been moved.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          variant="contained"
          startIcon={<IconHome size={18} />}
          onClick={() => navigate('/')}
        >
          Go to Home
        </Button>
      </Box>
    </Box>
  )
}

export default Page404
