import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { defaultSettings, SETTINGS_COOKIE_KEY } from '@/configs/themeConfig'
import type { ThemeSettings, Mode, Skin, Layout, NavbarType, FooterType, ContentWidth } from '@/types'

interface SettingsStore extends ThemeSettings {
  setMode: (mode: Mode) => void
  setSkin: (skin: Skin) => void
  setLayout: (layout: Layout) => void
  setNavbarType: (navbarType: NavbarType) => void
  setFooterType: (footerType: FooterType) => void
  setContentWidth: (contentWidth: ContentWidth) => void
  setSemiDark: (semiDark: boolean) => void
  setNavCollapsed: (navCollapsed: boolean) => void
  toggleNavCollapsed: () => void
  resetSettings: () => void
}

// Custom storage using cookies
const cookieStorage = {
  getItem: (name: string): string | null => {
    const value = Cookies.get(name)
    return value ?? null
  },
  setItem: (name: string, value: string): void => {
    Cookies.set(name, value, { expires: 365 })
  },
  removeItem: (name: string): void => {
    Cookies.remove(name)
  },
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setMode: (mode) => set({ mode }),
      setSkin: (skin) => set({ skin }),
      setLayout: (layout) => set({ layout }),
      setNavbarType: (navbarType) => set({ navbarType }),
      setFooterType: (footerType) => set({ footerType }),
      setContentWidth: (contentWidth) => set({ contentWidth }),
      setSemiDark: (semiDark) => set({ semiDark }),
      setNavCollapsed: (navCollapsed) => set({ navCollapsed }),
      toggleNavCollapsed: () => set((state) => ({ navCollapsed: !state.navCollapsed })),
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: SETTINGS_COOKIE_KEY,
      storage: createJSONStorage(() => cookieStorage),
      partialize: (state) => ({
        mode: state.mode,
        skin: state.skin,
        layout: state.layout,
        navbarType: state.navbarType,
        footerType: state.footerType,
        contentWidth: state.contentWidth,
        semiDark: state.semiDark,
        navCollapsed: state.navCollapsed,
      }),
    }
  )
)
