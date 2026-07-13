import { useRef } from 'react'

export default function MapDisplay() {
    const mapcanvas = useRef(null);

    // pan/zoom variables
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const zoomIntensity = useRef(0.1)
    const isPanning = useRef(false)
    const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })

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
        e.preventDefault();
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
