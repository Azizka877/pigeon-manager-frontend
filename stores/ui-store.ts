import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toast: { message: string; type: 'success' | 'error' } | null
  setToast: (toast: UIState['toast']) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toast: null,
  setToast: (toast) => set({ toast }),
}))