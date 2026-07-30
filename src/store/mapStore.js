import { create } from 'zustand'

function colorKey(r, g, b) {
  return `${r},${g},${b}`;
}

function hexToRGB(code) { // allows both # and no-#
  const c = code.replace(/^#/, "");
  if (c.length == 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
  } else if (c.length == 3) {
    const r = parseInt(hex.slice(0, 1) + hex.slice(0, 1), 16);
    const g = parseInt(hex.slice(1, 2) + hex.slice(1, 2), 16);
    const b = parseInt(hex.slice(2, 3) + hex.slice(2, 3), 16);
  }

  return [r, g, b]
}

export const useMapStore = create((set, get) => ({
  mapImage: null,
  setMapImage: (image) => set({ mapImage: image }),

  // Reference Layers

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

  // Provvie Data

  selectedProvince: null,
  provinceData: {},
  headers: [],

  setProvinceData: (data) => set({ provinceData: data }),
  setSelectedProvince: (r, g, b) => set({ selectedProvince: { rgb: [r, g, b], key: colorKey(r, g, b), data: get().provinceData[colorKey(r, g, b)] ?? null}}),
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
  }),

  loadCSVData: (text) => {
    const rows = text.trim().split('\n').map(data => data.trim());
    const headers = rows[0].split(',');

    const fullData = {}

    for (let i = 1; i < rows.length; i++) {
      const columns = rows[i].split(',').map(data => data.trim())

      const rowData = {}
      headers.forEach((header, index) => {
        rowData[header] = columns[index];
      });

      if (rowData.r && rowData.g && rowData.b) {
        fullData[colorKey(rowData.r, rowData.g, rowData.b)] = rowData;
      } else if (rowData.hex) {
        const [r, g, b] = hexToRGB(rowData.hex);
        fullData[colorKey(r, g, b)] = rowData;
      }
    }
    console.log(fullData)
    set({ provinceData: fullData, headers: headers })
  },

  autofillHierarchy: () => {
    const { provinceData, headers } = get();

    // Go through each province and build the hierarchy from the bottom up by checking if ascending nodes already exist
    // (Tedious but best option i can think of)

    const levels = ['continent', 'subcontinent', 'region', 'area', 'province', 'location'].filter(tier => headers.includes(tier))

    let newHierarchy = []
    const alreadyDone = new Set()

    if (levels.length === 0) return
    // loop through each province in the csv data
    // console.log("let's begin")
    for (const province of Object.values(provinceData)) {
      let parentId = null
      for (const tier of levels) { // for every tier in the hierarchy
        //console.log(`checking for ${tier} ${province[tier]}`)
        if (!province[tier]) break // if hierarchy incomplete skip province entirely
        if (alreadyDone.has(province[tier])) { // if this tier is already filed out continue
          // console.log(`${province[tier]} exists! setting as parent`)
        } else { // this tier hasn't been done yet...
          // console.log(`${province[tier]} doesn't exist yet! let's make it`)
          const newNode = {
            id: province[tier], tier, name: province[tier], children: []
          } // creates new node
          if (!parentId) { // if it's the highest node then push it into the hierarchy array
            newHierarchy.push(newNode)
          } else { // otherwise push it into the highest done node
            const insertInto = (hierarchyNodes) => hierarchyNodes.map(node =>
              node.id === parentId
              ? { ...node, children: [...node.children, newNode] }
              : { ...node, children: insertInto(node.children || [])}
            )
            newHierarchy = insertInto(newHierarchy)
          }
          alreadyDone.add(province[tier])
        }
        parentId = province[tier]
      }
    }

    //console.log(newHierarchy)

    set({ hierarchy: newHierarchy })
  },

  updateData: (key, field, value) => set((state) => ({
    provinceData: {
      ...state.provinceData,
      [key]: { ...state.provinceData[key], [field]: value }
    }
  })),

  exportCSVData: () => {
    const { provinceData, headers } = get();
    if (headers.length === 0) return;

    const rows = [headers.join(',')]; // headers is always the first row

    for (const row of Object.values(provinceData)) { // for each province (row [besides headers])
      rows.push(headers.map((header) => row[header] ?? '').join(','));
    }

    return rows.join('\n');
  },

  // Mapmodes

  mapMode: null,
  setMapMode: (text) => set({ mapMode: text }),
  showLabels: true,
  setShowLabels: (show) => set({ showLabels: show }),

  // Centoids to label mapmodes

  centroids: {},
  setCentroids: (centroids) => set({ centroids }),

  // Province Hierarchy
  
  hierarchy: [],
  addNode: (parentId, tier, name) => set((state) => {
    const newNode = {
      id: Date.now(), type, name, children: []
    }
    const updateHierarchy = (nodes) => nodes.map(
        (n) =>
        n.id === parentId ? {
          ...n, children: [...(n.children || []), newNode]
        } : {
          ...n, children: updateHierarchy(n.children || [])
        }
      )
      return { hierarchy: updateHierarchy(state.hierarchy)}
  }),
  removeNode: (id) => set((state) => {
    const cleanTree = (nodes) => nodes.filter((n) => n.id !== parentId).map(
      (n) => ({
        ...n, children: cleanTree(n.children || [])
      })
    )
    return { hierarchy: cleanTree(state.hierarchy)}
  })
}))