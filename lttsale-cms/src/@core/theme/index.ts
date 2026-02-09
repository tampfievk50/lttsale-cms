import { createTheme, type ThemeOptions } from '@mui/material/styles'
import { vuexyColors } from '@/configs/themeConfig'
import type { Mode } from '@/types'

const getDesignTokens = (mode: 'light' | 'dark'): ThemeOptions => {
  const colors = vuexyColors[mode]

  return {
    palette: {
      mode,
      primary: {
        main: colors.primary,
        light: '#9E95F5',
        dark: '#5549CC',
        lighter: mode === 'light' ? '#EEEDFD' : 'rgba(115, 103, 240, 0.16)',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: colors.secondary,
        light: '#A4A8B4',
        dark: '#6B6F7B',
        lighter: mode === 'light' ? '#F1F1F3' : 'rgba(128, 131, 144, 0.16)',
        contrastText: '#FFFFFF',
      },
      success: {
        main: colors.success,
        light: '#5DD092',
        dark: '#1FA855',
        lighter: mode === 'light' ? '#E8F9F0' : 'rgba(40, 199, 111, 0.16)',
        contrastText: '#FFFFFF',
      },
      error: {
        main: colors.error,
        light: '#FF7A7E',
        dark: '#E3353B',
        lighter: mode === 'light' ? '#FFEDED' : 'rgba(255, 76, 81, 0.16)',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: colors.warning,
        light: '#FFB76B',
        dark: '#E58529',
        lighter: mode === 'light' ? '#FFF5E8' : 'rgba(255, 159, 67, 0.16)',
        contrastText: '#FFFFFF',
      },
      info: {
        main: colors.info,
        light: '#33CBDD',
        dark: '#0098AA',
        lighter: mode === 'light' ? '#E5F9FB' : 'rgba(0, 186, 209, 0.16)',
        contrastText: '#FFFFFF',
      },
      background: {
        default: colors.background,
        paper: colors.surface,
      },
      text: {
        primary: colors.text.primary,
        secondary: colors.text.secondary,
        disabled: colors.text.disabled,
      },
      divider: mode === 'light' ? 'rgba(75, 70, 92, 0.12)' : 'rgba(225, 222, 245, 0.12)',
    },
    typography: {
      fontFamily: '"Public Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      h1: { fontWeight: 600, fontSize: '2.5rem', lineHeight: 1.2 },
      h2: { fontWeight: 600, fontSize: '2rem', lineHeight: 1.3 },
      h3: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.3 },
      h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.4 },
      h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
      h6: { fontWeight: 600, fontSize: '1rem', lineHeight: 1.5 },
      body1: { fontSize: '0.9375rem', lineHeight: 1.5 },
      body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
      borderRadius: 6,
    },
    shadows: [
      'none',
      '0px 2px 4px rgba(15, 20, 34, 0.08)',
      '0px 4px 8px rgba(15, 20, 34, 0.08)',
      '0px 6px 12px rgba(15, 20, 34, 0.1)',
      '0px 8px 16px rgba(15, 20, 34, 0.1)',
      '0px 10px 20px rgba(15, 20, 34, 0.12)',
      '0px 12px 24px rgba(15, 20, 34, 0.12)',
      '0px 14px 28px rgba(15, 20, 34, 0.14)',
      '0px 16px 32px rgba(15, 20, 34, 0.14)',
      '0px 18px 36px rgba(15, 20, 34, 0.16)',
      '0px 20px 40px rgba(15, 20, 34, 0.16)',
      '0px 22px 44px rgba(15, 20, 34, 0.18)',
      '0px 24px 48px rgba(15, 20, 34, 0.18)',
      '0px 26px 52px rgba(15, 20, 34, 0.2)',
      '0px 28px 56px rgba(15, 20, 34, 0.2)',
      '0px 30px 60px rgba(15, 20, 34, 0.22)',
      '0px 32px 64px rgba(15, 20, 34, 0.22)',
      '0px 34px 68px rgba(15, 20, 34, 0.24)',
      '0px 36px 72px rgba(15, 20, 34, 0.24)',
      '0px 38px 76px rgba(15, 20, 34, 0.26)',
      '0px 40px 80px rgba(15, 20, 34, 0.26)',
      '0px 42px 84px rgba(15, 20, 34, 0.28)',
      '0px 44px 88px rgba(15, 20, 34, 0.28)',
      '0px 46px 92px rgba(15, 20, 34, 0.3)',
      '0px 48px 96px rgba(15, 20, 34, 0.3)',
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.background,
          },
        },
      },
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            borderRadius: 6,
            padding: '7px 20px',
          },
          sizeLarge: {
            padding: '9px 24px',
          },
          sizeSmall: {
            padding: '5px 14px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: mode === 'light'
              ? '0px 2px 8px rgba(15, 20, 34, 0.08)'
              : '0px 2px 8px rgba(0, 0, 0, 0.2)',
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: '1.25rem 1.5rem',
          },
          title: {
            fontSize: '1.125rem',
            fontWeight: 500,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '1.25rem 1.5rem',
            '&:last-child': {
              paddingBottom: '1.25rem',
            },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#F9FAFC' : '#343852',
            '& .MuiTableCell-head': {
              fontWeight: 600,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: mode === 'light' ? 'rgba(75, 70, 92, 0.12)' : 'rgba(225, 222, 245, 0.12)',
            padding: '0.75rem 1rem',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            fontWeight: 500,
          },
          sizeSmall: {
            height: 22,
            fontSize: '0.75rem',
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 6,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 8,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            borderRadius: 6,
            boxShadow: '0px 4px 16px rgba(15, 20, 34, 0.16)',
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            fontSize: '0.875rem',
            fontWeight: 500,
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontWeight: 500,
          },
        },
      },
    },
  }
}

export const createAppTheme = (mode: Mode) => {
  const actualMode = mode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : mode

  return createTheme(getDesignTokens(actualMode))
}

export const getActualMode = (mode: Mode): 'light' | 'dark' => {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}
