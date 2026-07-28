import TRADE_GOOD_COLORS from "../constants/tradegoodcolors.js"
import CLIMATE_COLORS from "../constants/climatecolors.js"
import TERRAIN_COLORS from "../constants/terraincolors.js"

self.onmessage = ({ data }) => {
    const { buffer, width, height, provinceData, mapMode } = data
    self.postMessage({ buffer, width, height }, [buffer]);
};