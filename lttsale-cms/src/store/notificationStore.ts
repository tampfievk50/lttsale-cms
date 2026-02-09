import { create } from 'zustand'

interface Notification {
  message: string
  severity: 'success' | 'error' | 'warning' | 'info'
}

interface NotificationState {
  notification: Notification | null
  show: (message: string, severity?: Notification['severity']) => void
  clear: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notification: null,
  show: (message, severity = 'error') => set({ notification: { message, severity } }),
  clear: () => set({ notification: null }),
}))
