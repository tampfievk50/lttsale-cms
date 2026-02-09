import { Box, Link, Typography, useTheme } from '@mui/material'
import { layoutConfig } from '@/configs/themeConfig'
import { useSettingsStore } from '@/store/settingsStore'

export const Footer = () => {
  const theme = useTheme()
  const footerType = useSettingsStore((state) => state.footerType)

  if (footerType === 'hidden') return null

  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, lg: 3 },
        py: 2,
        minHeight: layoutConfig.footerHeight,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        width: '100%',
        position: footerType === 'sticky' ? 'sticky' : 'static',
        bottom: 0,
        mt: 'auto',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {new Date().getFullYear()} LTTSale
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Link
          href="#"
          color="text.secondary"
          underline="hover"
          variant="body2"
        >
          Support
        </Link>
        <Link
          href="#"
          color="text.secondary"
          underline="hover"
          variant="body2"
        >
          Documentation
        </Link>
      </Box>
    </Box>
  )
}
