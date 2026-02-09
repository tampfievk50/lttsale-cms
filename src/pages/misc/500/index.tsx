import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography, useTheme } from '@mui/material'
import { IconHome, IconRefresh } from '@tabler/icons-react'

const Page500 = () => {
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
          color: theme.palette.error.main,
          lineHeight: 1,
          mb: 2,
        }}
      >
        500
      </Typography>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
        Internal Server Error
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 400 }}
      >
        Something went wrong on our end. Please try again later or contact support if the problem persists.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<IconRefresh size={18} />}
          onClick={() => window.location.reload()}
        >
          Try Again
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

export default Page500
