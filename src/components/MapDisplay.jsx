import { useEffect, useRef, useState } from 'react'
import { useMapStore } from "../store/mapStore";

export default function MapDisplay() {
    const mapcanvas = useRef(null);
    const canvasContainer = useRef(null);
    const { mapImage } = useMapStore()

    // pan/zoom variables
    const pan = useRef({ x: 0, y: 0 })
    const zoom = useRef(1)
    const zoomIntensity = useRef(0.1)
    const isPanning = useRef(false)
    const lastMouse = useRef({ x: 0, y: 0 })

    const [displayedCoords, setDisplayedCoords] = useState({ x: 0, y: 0 });

    // Draw function for canvas (call each time pan/zoom/window resizes)
    const draw = (e) => {
        if (!mapImage) return;
        const canvas = mapcanvas.current;
        const container = canvasContainer.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext('2d');
        
        const cx = container.clientWidth;
        const cy = container.clientHeight;
        if (canvas.height !== cy) canvas.height = cy;
        if (canvas.width !== cx) canvas.width = cx;

        ctx.save()
        ctx.imageSmoothingEnabled = false;
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.translate(pan.current.x, pan.current.y)
        ctx.scale(zoom.current, zoom.current)

        ctx.drawImage(mapImage, 0, 0);
        ctx.restore()
    }

    useEffect(() => {
        draw();
        const resizeObserver = new ResizeObserver(() => draw());
        if (canvasContainer.current) {resizeObserver.observe(canvasContainer.current)}
        return () => resizeObserver.disconnect()
    }, [mapImage])

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

    // [[ M O U S E   L I S T E N E R S ]]

    // Event listeners for pan/zoom
    const handleMouseDown = (e) => {
        isPanning.current = true;
        lastMouse.current = {
            x: e.clientX - pan.current.x,
            y: e.clientY - pan.current.y
        }
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
