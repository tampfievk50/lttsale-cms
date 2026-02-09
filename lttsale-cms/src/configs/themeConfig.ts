import type { ThemeSettings } from '@/types'

// Vuexy Color Palette
export const vuexyColors = {
  light: {
    primary: '#7367F0',
    secondary: '#808390',
    success: '#28C76F',
    error: '#FF4C51',
    warning: '#FF9F43',
    info: '#00BAD1',
    background: '#F8F7FA',
    surface: '#FFFFFF',
    text: {
      primary: '#4B465C',
      secondary: '#6E6B7B',
      disabled: '#A5A3AE',
    },
  },
  dark: {
    primary: '#7367F0',
    secondary: '#808390',
    success: '#28C76F',
    error: '#FF4C51',
    warning: '#FF9F43',
    info: '#00BAD1',
    background: '#25293C',
    surface: '#2F3349',
    text: {
      primary: '#E1DEF5',
      secondary: '#B6B0C6',
      disabled: '#7A7592',
    },
  },
}

// Layout Sizing
export const layoutConfig = {
  sidebarWidth: 260,
  sidebarCollapsedWidth: 70,
  navbarHeight: 54,
  footerHeight: 54,
  contentPadding: '1rem',
}

// Default Theme Settings
export const defaultSettings: ThemeSettings = {
  mode: 'light',
  skin: 'default',
  layout: 'vertical',
  navbarType: 'sticky',
  footerType: 'static',
  contentWidth: 'fluid',
  semiDark: false,
  navCollapsed: false,
}

// Cookie key for persisting settings
export const SETTINGS_COOKIE_KEY = 'lttsale-settings'
