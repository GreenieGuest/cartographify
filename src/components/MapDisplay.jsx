import { useEffect, useRef, useState } from 'react'
import { useMapStore } from "../store/mapStore";

export default function MapDisplay() {
    const mapcanvas = useRef(null);
    const canvasContainer = useRef(null);
    const { mapImage } = useMapStore()

    // pan/zoom variables
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const zoomIntensity = useRef(0.1)
    const isPanning = useRef(false)
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })

    // Draw function for canvas (call each time pan/zoom/window resizes)
    const draw = (e) => {
        if (!mapImage) return;
        const canvas = mapcanvas.current;
        const ctx = canvas.getContext('2d');
        ctx.save()
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.translate(pan.x, pan.y)
        ctx.scale(zoom, zoom)

        ctx.drawImage(mapImage, 0, 0);
        ctx.restore()
    }

    useEffect(() => {
        const resizeObserver = new ResizeObserver(() => draw());
        if (canvasContainer.current) {resizeObserver.observe(canvasContainer.current)}
        return () => resizeObserver.disconnect()
    }, [pan, zoom, mapImage])

    // [[ Helper functions ]]

    const getRectXY = (e) => {
        const rect = mapcanvas.current.getBoundingClientRect();
        return { rx: (e.clientX - rect.left), ry: (e.clientY - rect.top)  }
    }

    // [[ M O U S E   L I S T E N E R S ]]

    // Event listeners for pan/zoom
    const handleMouseDown = (e) => {
        isPanning.current = true;
        setLastMouse({
            x: e.clientX - pan.x,
            y: e.clientY - pan.y
        })
    }

    const handleMouseUp = (e) => { isPanning.current = false }

    const handleMouseMove = (e) => {
        if (!isPanning.current) return;
        setPan({
            x: e.clientX - lastMouse.x,
            y: e.clientY - lastMouse.y
        })
    }
    const handleMouseWheel = (e) => {
        e.preventDefault()
        const rect = mapcanvas.current.getBoundingClientRect();

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let newZoom = e.deltaY < 0 ? zoom + zoomIntensity.current : zoom - zoomIntensity.current;
        newZoom = Math.min(Math.max(.5, newZoom), 5);

        // zoom towards cursor position

        const scale = newZoom / zoom;

        setPan({
            x: mouseX - (mouseX - pan.x) * scale,
            y: mouseY - (mouseY - pan.y) * scale
        });
        setZoom(newZoom);
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
        </div>
    )
}
