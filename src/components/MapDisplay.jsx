import { useRef } from 'react'

export default function MapDisplay() {

    const canvas = useRef(null);
    const ctx = canvas.getContext('2d')

    const viewportTransform = {
        x: 0,
        y: 0,
        scale: 1
    }

    let previousX = 0, previousY = 0

    const updatePanning = (e) => {
        const localX = e.clientX
        const localY = e.clientY

        viewportTransform.x += localX - previousX
        viewportTransform.y += localY - previousY

        previousX = localX
        previousY = localY
    }

    const render = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.setTransform(
            viewportTransform.scale,
            0,
            0,
            viewportTransform.scale,
            x,
            y
        )

    const onMouseMove = (e) => {
        render()

        console.log(e)
    }

    canvas.addEventListener('mousedown', (e) => {
        previousX = e.clientX
        previousY = e.clientY

        canvas.addEventListener('mousemove', onMouseMove)
    })

    canvas.addEventListener('mouseup', (e) => {
        canvas.removeEventListener('mousemove', onMouseMove)
    })
    
    return (
        <canvas
        />
    )
}
