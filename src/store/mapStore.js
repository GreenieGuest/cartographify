import { create } from 'zustand'

function colorKey(r, g, b) {
  return `${r},${g},${b}`;
}

function hexToRGB(code) { // allows both # and no-#
  let c = code.replace(/^#/, "");
  if (c.length == 3) {
    c = c.split('').map(x => x + x).join('');
  }
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);

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

  autofillCountries: () => {
    const { provinceData } = get();

    const countries = {};

    for (const province of Object.values(provinceData)) {
      if (!province.owner || !province.tag) continue;

      const tag = province.tag

      if (!countries[tag]) {
        countries[tag] = {
          id: tag,
          name: province.owner, // should always be  name of country if everyone's spreadsheets look like mine
          religion: province.religion,
          culture: province.culture,
          capital: colorKey(province.r, province.g, province.b)
        };
        continue
      }

      const oldCapital = provinceData[countries[tag].capital]

      if (oldCapital && province.population > oldCapital.population) {
        existingCountry.religion = province.religion;
        existingCountry.culture = province.culture;
        existingCountry.capital = colorKey(province.r, province.g, province.b)
      }
    }

    set({ countries })
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

  exportDataEU5: () => {
    // Warning! This Function is REALLY Ugly! And that's the beauty of it!

    const { provinceData, headers, hierarchy } = get();
    if (headers.length === 0) return;


    const serializeNode = (node, depth) => {
      const indent = '\t'.repeat(depth)
      if (node.children.length === 0) return `${indent}${node.name}`;

      const children = node.children.map(child => serializeNode(child, depth+1)).join('\n')
      return `${indent}${node.name} = {\n${children}\n${indent}}`
    }

    // default.map
    const seaProvinces = [];
    const lakeProvinces = [];
    const wastelandProvinces = [];
    // definitions.txt
    const hierarchyInText = hierarchy.map(root => serializeNode(root, 0)).join('\n\n');
    // location_templates.txt
    const locationTemplates = [];
    const namedLocations = [];
    const ports = [];
    const localizationLines = [];
    const popTemplates = [];

    for (const province of Object.values(provinceData)) { // for each province (row [besides headers])
      if (province.sea_zones === 'yes') seaProvinces.push(province.location);
      if (province.is_lake === 'yes') lakeProvinces.push(province.location);
      if (province.impassable_mountains === 'yes') wastelandProvinces.push(province.location);
      if (province.port_seazone && province.port_x && province.port_y) ports.push(
        `${province.location};${province.port_seazone};${province.port_x};${province.port_y};x`
      );

      locationTemplates.push(
        [
        `${province.location} = {`,
        (province.topography ? `topography = ${province.topography}` : null),
        (province.vegetation ? `vegetation = ${province.vegetation}` : null),
        (province.climate ? `climate = ${province.climate}` : null),
        (province.religion ? `religion = ${province.religion}` : null),
        (province.culture ? `culture = ${province.culture}` : null),
        (province.raw_material ? `raw_material = ${province.raw_material}` : null),
        (province.natural_harbor_suitability ? `natural_harbor_suitability = ${province.natural_harbor_suitability}` : null),
        `}`
        ].filter(Boolean).join(' ')
      );
      
      namedLocations.push(
        `${province.location} = ${province.color.replace("#", "")}`
      );
      
      localizationLines.push(
        `${province.location}: \"${province.name}\"`
      );

      popTemplates.push(
        [
        `${province.location} = {`,
          ((province.population && province.culture && province.religion) ? `\tdefine_pop = \{ type = peasants size = ${(province.population / 1000).toFixed(3)} culture = ${province.culture} religion = ${province.religion} \}` : null),
        `}`
        ].filter(Boolean).join('\n')
      );
    }
    const lines = [
      "### PUT THESE IN default.map ###",
      "sea_zones = {",
      `${seaProvinces.map(entry => '\t' + entry).join('\n')}`,
      "}",
      "lakes = {",
      `${lakeProvinces.map(entry => '\t' + entry).join('\n')}`,
      "}",
      "impassable_mountains = {",
      `${wastelandProvinces.map(entry => '\t' + entry).join('\n')}`,
      "}",
      "",
      "",
      "### PUT THESE IN definitions.txt ###",
      `${hierarchyInText}`,
      "",
      "",
      "### PUT THESE IN location_templates.txt ###",
      `${locationTemplates.join('\n')}`,
      "",
      "",
      "### PUT THESE IN ports.csv ###",
      `${ports.join('\n')}`,
      "",
      "",
      "### PUT THESE IN map_data/named_locations.txt ###",
      `${namedLocations.join('\n')}`,
      "",
      "",
      "### PUT THESE IN main_menu/localization/english/location_names/location_names_l_english.yml ###",
      `${localizationLines.join('\n')}`,
      "",
      "",
      "### PUT THESE IN main_menu/setup/start/06_pops.txt ###",
      `${popTemplates.join('\n')}`,
      "",
    ];

    return lines.join('\n');
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
      id: Date.now(), tier, name, children: []
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
    const cleanTree = (nodes) => nodes.filter((n) => n.id !== id).map(
      (n) => ({
        ...n, children: cleanTree(n.children || [])
      })
    )
    return { hierarchy: cleanTree(state.hierarchy)}
  }),

  // Port placing

  settingPortFor: null,
  setPortActive: (province) => set({ settingPortFor: province }),

  // Countries
  
  countries: {},
}))