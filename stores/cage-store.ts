import { create } from 'zustand'

interface CageState {
  selectedCage: string | null
  filterStatus: 'all' | 'free' | 'single' | 'couple'
  setSelectedCage: (id: string | null) => void
  setFilterStatus: (status: CageState['filterStatus']) => void
}

export const useCageStore = create<CageState>((set) => ({
  selectedCage: null,
  filterStatus: 'all',
  setSelectedCage: (id) => set({ selectedCage: id }),
  setFilterStatus: (status) => set({ filterStatus: status }),
}))