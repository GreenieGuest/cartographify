import { useEffect, useRef, useState } from 'react'
import { useMapStore } from "../store/mapStore";

export default function MapDisplay() {
    const mapcanvas = useRef(null);
    const { mapImage } = useMapStore()

    // pan/zoom variables
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const zoomIntensity = useRef(0.1)
    const isPanning = useRef(false)
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })

    // image loader (from mapImage upload button)
    useEffect(() => {
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
    },[mapImage, pan, zoom])

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
        if (!isPanning) return;
        setPan({
            x: e.clientX - lastMouse.x,
            y: e.clientY - lastMouse.y
        })
    }
    const handleMouseWheel = (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        let newZoom = e.deltaY < 0 ? zoom + zoomIntensity : zoom - zoomIntensity;
        newZoom = Math.min(Math.max(.5, newZoom), 5);

        // zoom towards cursor position

        const factor = newZoom - zoom;
        setPan({
            x: pan.x - (mouseX * factor),
            y: pan.y - (mouseY * factor)
        });
        setZoom(newZoom);
    }
    
    return (
        <canvas
            ref={mapcanvas}
            style={{width: '100%', height: '100%'}}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleMouseWheel}
        />
    )
}
