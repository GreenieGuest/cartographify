import TRADE_GOOD_COLORS from "../constants/tradegoodcolors.js"
import CLIMATE_COLORS from "../constants/climatecolors.js"
import TERRAIN_COLORS from "../constants/terraincolors.js"

// Input: { buffer: ArrayBuffer, width, height, provinceData, centroids, mapMode }
// Output: { buffer: ArrayBuffer, width, height }

self.onmessage = ({ data }) => {
    const { buffer, width, height, provinceData, centroids, mapMode } = data
    const pixels = new Uint8ClampedArray(buffer)
    const colorCache = new Map()

    // get unique rgb for any string
    const getHashColor = (str) => {
        if (!str) return [120, 120, 120]
        let hash = 5381
        for (let i = 0; i < str.length; i++) hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
        return [(hash >> 16) & 0xff, (hash >> 8) & 0xff, hash & 0xff]
    }

    // get color on a scale (useful in some cases)
    const getColorOnScale = (value, min, max) => {
        value = Math.max(min, Math.min(max, value));
        const percent = (value - min) / (max - min);
        const g = Math.floor(percent * 255);
        return [0, g, 0];
    }

    // get paradox-style colors for different map modes ( very useful in all cases )
    const getMapModeColor = (key) => {
        const province = provinceData[key];
        const centroid = centroids[key];

        if (mapMode === 'assigned') return province ? [0,255,0] : [0,0,0]
        if (!province || !centroid) return null
        if (mapMode === 'tradeGood') {
            const g = (province.tradeGood || province.grade_good || province.raw_material || '').toLowerCase()
            return TRADE_GOOD_COLORS[g] || getHashColor(g)
        }
        if (mapMode === 'climate') {
            const g = (province.climate || '').toLowerCase()
            return CLIMATE_COLORS[g] || getHashColor(g)
        }
        if (mapMode === 'terrain') {
            const g = (province.terrain || province.topography || '').toLowerCase()
            return TERRAIN_COLORS[g] || getHashColor(g)
        }
        if (mapMode === 'vegetation') {
            const g = (province.vegetation || '').toLowerCase()
            return TERRAIN_COLORS[g] || getHashColor(g)
        }
        if (mapMode === 'population') {
            const g = Number(province.population || '')
            return (getColorOnScale(g, 0, 150000))
        }
        if (mapMode === 'harbors') {
            const g = Number(province.natural_harbor_suitability || '')
            return (getColorOnScale(g, 0, 1))
        }
        if (mapMode === 'pdensity') {
            const p = Number(province.population || '')
            const s = Number(centroid.count || '')
            const g = p / s
            return (getColorOnScale(g, 0, 50))
        }
        
        if (mapMode === 'culture') return getHashColor(province.culture || '')
        if (mapMode === 'religion') return getHashColor(province.religion || '')
        if (mapMode === 'owner') return getHashColor(province.owner || '')

        if (mapMode === 'continent') return getHashColor(province.continent || '')
        if (mapMode === 'subcontinent') return getHashColor(province.subcontinent || '')
        if (mapMode === 'region') return getHashColor(province.region || '')
        if (mapMode === 'area') return getHashColor(province.area || '')
        if (mapMode === 'province') return getHashColor(province.province || '')
        if (mapMode === 'isCoastal') {
            if (province.sea_zones && province.sea_zones === 'yes') return [0,0,255]
            if (province.lakes && province.lakes === 'yes') return [0,0,100]
            const c = province.isCoastal || province.is_coastal || province.coastal || ''
            const hasPorts = province.port_x && province.port_y || province.port_seazone
            return (c === '1' || c.toLowerCase() === 'true' || c.toLowerCase() === 'yes') ? (
                hasPorts ? [0,255,0] : [70,130,180]
            ) : (
                hasPorts ? [255,255,0] : [139,115,85] // Why would it have ports???
            )
        }
        return null
    }

    for (let i = 0; i < pixels.length; i += 4) { // (each pixel is 4 bytes)
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]
        const key = (r << 16) | (g << 8) | b

        if (!colorCache.has(key)) {
            const pKey = `${r},${g},${b}`
            colorCache.set(key, getMapModeColor(pKey))
        }

        const c = colorCache.get(key)
        if (c) {
            pixels[i] = c[0]
            pixels[i+1] = c[1]
            pixels[i+2] = c[2]
        }
    }

    self.postMessage({ buffer: pixels.buffer, width, height }, [pixels.buffer]);
};