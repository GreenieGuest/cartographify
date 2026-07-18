import { create } from 'zustand'

function colorKey(r, g, b) {
  return `${r},${g},${b}`;
}

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

  selectedProvince: null,
  provinceData: {},
  headers: [],

  setSelectedProvince: (r, g, b) => set({ selectedProvince: { rgb: [r, g, b], key: colorKey(r, g, b), data: provinceData[colorKey(r, g, b)] ?? null}}),
  createProvince: (r, g, b) => set((state) => {
    if (state.provinceData[colorKey(r,g,b)]) {
      console.log("Province already exists :)");
      console.log(state.provinceData)
      return state;
    }
    console.log("Creating province!")
    return ({
    provinceData: {...state.provinceData,
      [colorKey(r,g,b)]: {key: colorKey(r, g, b)}}
    })
  })
}))