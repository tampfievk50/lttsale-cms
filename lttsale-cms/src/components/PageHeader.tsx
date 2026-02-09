import { Box, Typography, Link as MuiLink, Paper, alpha, useTheme } from '@mui/material'
import { Link } from 'react-router-dom'
import { IconChevronRight, IconHome } from '@tabler/icons-react'

export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: React.ReactNode
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  action?: React.ReactNode
}

export const PageHeader = ({ title, subtitle, breadcrumbs, action }: PageHeaderProps) => {
  const theme = useTheme()

  return (
    <Box sx={{ mb: 1.5 }}>
      {/* Breadcrumb Bar */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            mb: 1,
            px: 2,
            py: 0.75,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          }}
        >
          {/* Breadcrumb Navigation */}
          <Box
            component="nav"
            aria-label="breadcrumb"
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 0.5,
            }}
          >
            {/* Home link */}
            <MuiLink
              component={Link}
              to="/"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 1.5,
                color: 'primary.main',
                textDecoration: 'none',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  transform: 'scale(1.05)',
                },
              }}
            >
              <IconHome size={18} stroke={1.5} />
            </MuiLink>

            <Box
              component="span"
              sx={{
                display: 'flex',
                color: alpha(theme.palette.text.primary, 0.3),
                mx: 0.5,
              }}
            >
              <IconChevronRight size={18} stroke={2} />
            </Box>

            {/* Other breadcrumb items */}
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1
              return (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center' }}>
                  {isLast || !item.path ? (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 1.5,
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </Box>
                  ) : (
                    <>
                      <MuiLink
                        component={Link}
                        to={item.path}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.75,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 1.5,
                          fontSize: '0.8125rem',
                          fontWeight: 500,
                          color: 'text.secondary',
                          textDecoration: 'none',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            color: 'primary.main',
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          },
                        }}
                      >
                        {item.icon}
                        {item.label}
                      </MuiLink>
                      <Box
                        component="span"
                        sx={{
                          display: 'flex',
                          color: alpha(theme.palette.text.primary, 0.3),
                          mx: 0.5,
                        }}
                      >
                        <IconChevronRight size={18} stroke={2} />
                      </Box>
                    </>
                  )}
                </Box>
              )
            })}
          </Box>

          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Paper>
      )}

      {/* Title and Action (when no breadcrumbs) */}
      {(!breadcrumbs || breadcrumbs.length === 0) && (title || action) && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
        </Box>
      )}
    </Box>
  )
}
