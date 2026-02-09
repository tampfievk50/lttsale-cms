import { Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, CircularProgress, useTheme } from '@mui/material'

export const BlankLayout = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Suspense fallback={<CircularProgress />}>
        <Outlet />
      </Suspense>
    </Box>
  )
}
