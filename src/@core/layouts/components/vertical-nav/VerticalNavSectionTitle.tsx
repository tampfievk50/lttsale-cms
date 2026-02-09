import { Box, Typography, Divider, useTheme } from '@mui/material'

interface VerticalNavSectionTitleProps {
  title: string
  collapsed: boolean
}

export const VerticalNavSectionTitle = ({ title, collapsed }: VerticalNavSectionTitleProps) => {
  const theme = useTheme()

  if (collapsed) {
    return (
      <Divider
        sx={{
          my: 1.5,
          mx: 1.5,
          borderColor: theme.palette.divider,
        }}
      />
    )
  }

  return (
    <Box sx={{ px: 2.5, py: 1.5, mt: 1 }}>
      <Typography
        variant="caption"
        sx={{
          color: theme.palette.text.disabled,
          fontWeight: 600,
          fontSize: '0.6875rem',
          letterSpacing: '0.4px',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Typography>
    </Box>
  )
}
