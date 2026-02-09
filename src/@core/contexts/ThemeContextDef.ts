import { createContext } from 'react'
import type { Theme } from '@mui/material'
import type { Mode } from '@/types'

export interface ThemeContextValue {
  theme: Theme
  mode: Mode
  actualMode: 'light' | 'dark'
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
