import { useCallback, useEffect, useRef, useState } from 'react'
import { useMapStore } from "../store/mapStore";

export default function MapDisplay() {
    const mapcanvas = useRef(null);
    const canvasContainer = useRef(null);
    const { mapImage, layers, setSelectedProvince, mapMode, provinceData } = useMapStore()

    const TILE_SIZE = 512;

    // pan/zoom variables
    const pan = useRef({ x: 0, y: 0 })
    const zoom = useRef(1)
    const zoomIntensity = useRef(0.1)
    const isPanning = useRef(false)
    const lastMouse = useRef({ x: 0, y: 0 })

    // Img data
    const pixelData = useRef(null);
    const pixelData_mapmode = useRef(null);
    const tileCache = useRef(new Map());
    const currentTile = useRef(new Set());

    // Web Workers
    const mapModeWorker = useRef(null)

    const [displayedCoords, setDisplayedCoords] = useState({ x: 0, y: 0 });

    // Tile Generation (splits large maps into grid to not crash your PC)
    // creates ImageBitmap from pixelData

    const createTile = useCallback((tx, ty, idata) => {
        const { data, width, height } = idata;
        // get left-most pixel and upper-most pixel by multiplying tx/ty by tile size
        const x0 = tx * TILE_SIZE;
        const y0 = ty * TILE_SIZE;
        // 'edge' cases ;)
        const tileWidth = Math.min(TILE_SIZE, width - x0)
        const tileHeight = Math.min(TILE_SIZE, height - y0)

        const tile = new ImageData(tileWidth, tileHeight);
        for (let row = 0; row < tileHeight; row++) {
            const sourceOffset = ((y0 + row) * width + x0) * 4 // (y*width) + x (4 bytes in memory)
            const destinationOffset = row * tileWidth * 4;
            tile.data.set(
                data.subarray(sourceOffset, sourceOffset + tileWidth * 4),
                destinationOffset
            )
        }
        return createImageBitmap(tile); // returns Promise<ImageBitmap>
    }, [])

    // Draw function for canvas (call each time pan/zoom/window resizes)
    const draw = (e) => {
        if (!mapImage) return;
        const canvas = mapcanvas.current;
        const container = canvasContainer.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');
        // check that container size matches canvas size and if not then fix
        const cx = container.clientWidth;
        const cy = container.clientHeight;
        if (canvas.height !== cy) canvas.height = cy;
        if (canvas.width !== cx) canvas.width = cx;

        const z = zoom.current
        const px = pan.current.x
        const py = pan.current.y

        const srcPixels = (mapMode !== 'default' && pixelData_mapmode.current) ? pixelData_mapmode.current : pixelData.current;
        if (!srcPixels) {
            console.log("pixels not ready yet")
            return
        }
        const { width: imgW, height: imgH } = srcPixels;

        // how many tiles will be needed
        const numTilesX = Math.ceil(imgW / TILE_SIZE)
        const numTilesY = Math.ceil(imgH / TILE_SIZE)
        // get image bounds to start drawing tiles
        const imgLeftBound = Math.max(0, Math.floor(-px / z / TILE_SIZE))
        const imgTopBound = Math.max(0, Math.floor(-py / z / TILE_SIZE))
        const imgRightBound = Math.min(numTilesX - 1,
            Math.ceil((cx-px) / z / TILE_SIZE) 
        )
        const imgBottomBound = Math.min(numTilesY - 1,
            Math.ceil((cy-py) / z / TILE_SIZE) 
        )

        // Draw the canvas itself (translate and scale according to pan/zoom)
        ctx.save()
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.imageSmoothingEnabled = false; // MUST retain pixelated form (blurred lines are ugly ... also its a pixel map for a reason)
        
        for (let ty = imgTopBound; ty <= imgBottomBound; ty++) {
            for (let tx = imgLeftBound; tx <= imgRightBound; tx++) {
                const key = `${tx}:${ty}`
                const bmp = tileCache.current.get(key)

                if (bmp) {
                    const dx = px + tx * TILE_SIZE * z
                    const dy = py + ty * TILE_SIZE * z
                    ctx.drawImage(bmp, dx, dy, bmp.width * z, bmp.height * z) // draws one tile of the image at a time
                } else if (!currentTile.current.has(key)) {
                    currentTile.current.add(key)
                    createTile(tx, ty, srcPixels).then(bitmap => {
                        if (!bitmap) return;
                        tileCache.current.set(key, bitmap)
                        currentTile.current.delete(key)
                        draw()
                    })
                }
            }
        }

        ctx.setTransform(1, 0, 0, 1, 0, 0) // identity matrix

        ctx.translate(pan.current.x, pan.current.y)
        ctx.scale(zoom.current, zoom.current)

        for (const layer of layers) {
            ctx.globalAlpha = layer.opacity;
            //ctx.translate(pan.current.x + layer.pan.x, pan.current.y + layer.pan.y)
            //ctx.scale(zoom.current + layer.scale, zoom.current + layer.scale)
            ctx.drawImage(layer.img, layer.offset.x, layer.offset.y, layer.img.width * layer.scale, layer.img.height * layer.scale);
            ctx.globalAlpha = 1;
            console.log(layer)
        }

        ctx.restore()
    }

    // Canvas Drawer
    useEffect(() => {
        // each time a new map image is loaded redraw the canvas
        // and also add RO to redraw canvas if user changes window size
        if (!mapImage) return
        const offscreenCanvas = document.createElement('canvas') // create a canvas offscreen to load the full image so it can be split into parts (not seen by user)
        offscreenCanvas.width = mapImage.width;
        offscreenCanvas.height = mapImage.height;

        const ctx = offscreenCanvas.getContext('2d');
        ctx.drawImage(mapImage, 0, 0);

        const idata = ctx.getImageData(0, 0, mapImage.width, mapImage.height);
        pixelData.current = {
            data: idata.data,
            width: mapImage.width,
            height: mapImage.height,
        }

        tileCache.current.forEach(b => b.close?.())
        tileCache.current.clear()
        currentTile.current.clear()
        draw();

        const resizeObserver = new ResizeObserver(() => draw());
        if (canvasContainer.current) {resizeObserver.observe(canvasContainer.current)}
        return () => resizeObserver.disconnect()
    }, [mapImage, layers])

    // Mapmode Drawer

    useEffect(()=> {
        if (!pixelData.current) return
        if (mapMode == 'default') {// nothing to change 
            pixelData_mapmode.current = null;

            tileCache.current.forEach(b => b.close?.())
            tileCache.current.clear()
            currentTile.current.clear()
            draw()
            return
        }
        
        if (mapModeWorker.current) mapModeWorker.current.terminate()
        mapModeWorker.current = new Worker(
            new URL('../workers/recolorWorker.js', import.meta.url), { type: 'module' }
        )
        const { data, width, height } = pixelData.current;
        const copy = new Uint8ClampedArray(data)

        mapModeWorker.current.onmessage = ({ data: msg }) => {
            pixelData_mapmode.current = {
                data: new Uint8ClampedArray(msg.buffer),
                width: msg.width,
                height: msg.height,
            }

            tileCache.current.forEach(b => b.close?.())
            tileCache.current.clear()
            currentTile.current.clear()
            draw()
        }
        mapModeWorker.current.postMessage(
            { buffer: copy.buffer, width, height, provinceData, mapMode }, [copy.buffer]
        )
    }, [mapMode, provinceData])

    // [[ Helper functions ]]

    const getRectXY = (e) => {
        const rect = mapcanvas.current.getBoundingClientRect();
        return { rx: (e.clientX - rect.left), ry: (e.clientY - rect.top)  }
    }

    const getImageCoords = (cx, cy) => {
        return {
            x: Math.floor((cx - pan.current.x) / zoom.current),
            y: Math.floor((cy - pan.current.y) / zoom.current),
        }
    }

    const getCanvasPixelAt = (x, y) => { // Old, gets pixel data directly from Canvas (hits map modes)
        const canvas = mapcanvas.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const imageData = ctx.getImageData(x, y, 1, 1);
        const r = imageData.data[0];
        const g = imageData.data[1];
        const b = imageData.data[2];
        console.log(r, g, b);
        
        return [r, g, b]
    }

    const getPixelAt = (x, y) => {
        console.log(x, y)
        const imageData = pixelData.current
        console.log(imageData)
        if (!imageData || !imageData.data) return null;
        
        // in-bounds checker
        if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) return null

        const i = (y * imageData.width + x) * 4
        console.log(i)

        const r = imageData.data[i];
        const g = imageData.data[i+1];
        const b = imageData.data[i+2];
        console.log(r, g, b);
        
        return [r, g, b]
    }

    // [[ M O U S E   L I S T E N E R S ]]

    // Event listeners for pan/zoom
    const handleMouseDown = (e) => {
        isPanning.current = true;
        lastMouse.current = {
            x: e.clientX - pan.current.x,
            y: e.clientY - pan.current.y
        }

        const { rx, ry } = getRectXY(e)
        const { x: ix, y: iy } = getImageCoords(rx, ry)
        const [r, g, b] = getPixelAt(ix, iy)
        setSelectedProvince(r, g, b)
    }

    const handleMouseUp = (e) => { isPanning.current = false }

    const handleMouseMove = (e) => {
        // Show coordinates at bottom of screen
        const { rx, ry } = getRectXY(e)
        const { x: ix, y: iy } = getImageCoords(rx, ry)
        setDisplayedCoords({
            x: ix,
            y: iy
        })
        getPixelAt(ix, iy)

        if (!isPanning.current) return;
        pan.current = {
            x: e.clientX - lastMouse.current.x,
            y: e.clientY - lastMouse.current.y
        }
        draw();
    }
    const handleMouseWheel = (e) => {
        e.preventDefault()
        const { rx, ry } = getRectXY(e);

        let newZoom = e.deltaY < 0 ? zoom.current + zoomIntensity.current : zoom.current - zoomIntensity.current;
        newZoom = Math.min(Math.max(.1, newZoom), 50);

        // zoom towards cursor position

        const scale = newZoom / zoom.current;

        pan.current = {
            x: rx - (rx - pan.current.x) * scale,
            y: ry - (ry - pan.current.y) * scale
        };
        zoom.current = newZoom;
        draw();
    }
    
    return (
        <div className='canvas-container' ref={canvasContainer}>
            <canvas
                ref={mapcanvas}
                style={{width: '100%', height: '100%', touchAction: "none"}}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleMouseWheel}
            />
            <p className='coords'>Coords: ({displayedCoords.x}, {displayedCoords.y})</p>
        </div>
    )
}
