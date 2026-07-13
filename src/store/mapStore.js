import { create } from 'zustand'

const useMapStore = create((set) => ({
  mapImage: null,
  setMapImage: (image) => set({ mapImage: image }),
}))