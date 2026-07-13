import { create } from 'zustand'

export const useMapStore = create((set) => ({
  mapImage: null,
  setMapImage: (image) => set({ mapImage: image }),
}))