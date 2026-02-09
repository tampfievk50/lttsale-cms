import { useMemo, useEffect, useState } from 'react'
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material'
import { createAppTheme, getActualMode } from '@core/theme'
import { useSettingsStore } from '@/store/settingsStore'
import { ThemeContext } from './ThemeContextDef'

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const mode = useSettingsStore((state) => state.mode)
  const [actualMode, setActualMode] = useState<'light' | 'dark'>(() => getActualMode(mode))

  useEffect(() => {
    const updateActualMode = () => {
      setActualMode(getActualMode(mode))
    }

    updateActualMode()

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => updateActualMode()
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [mode])

  // actualMode is included to trigger theme regeneration when system preference changes
  const theme = useMemo(() => createAppTheme(actualMode), [actualMode])

  const value = useMemo(
    () => ({
      theme,
      mode,
      actualMode,
    }),
    [theme, mode, actualMode]
  )

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  )
}
