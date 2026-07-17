import { create } from 'zustand'

export const useMapStore = create((set) => ({
  mapImage: null,
  setMapImage: (image) => set({ mapImage: image }),

  layers: [],
  layerNumber: 0,
  addLayer: (image) => set((state) => ({
    layerNumber: state.layerNumber + 1,
    layers: [...state.layers, { key: Date.now(), num: state.layerNumber, img: image, opacity: 0.5, offset: { x: 0, y: 0 }, scale: 1, visible: true}]
  })),
  removeLayer: (key) => set((state) => ({
    layers: state.layers.filter((layer) => layer.key !== key)
  })),
  updateLayer: (key, attributes) => set((state) => ({
    layers: state.layers.map((layer) => layer.key === key ? {...layer, ...attributes } : layer)
  })),
}))