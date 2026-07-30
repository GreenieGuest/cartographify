import { useState, useRef } from 'react'
import { useMapStore } from '../store/mapStore'

const rgbToHex = (r, g, b) => 
  "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");

export default function ColorDisplay({r, g, b}) {
    const { centroids, provinceData } = useMapStore()
    console.log(centroids, provinceData, r, g, b)
    if (!centroids || !provinceData) return;

    const key = `${r},${g},${b}`

    if (!provinceData[key]) return;
    if (!centroids[key]) return;

    return (
        <div className='color-card'>
            <div className='color-display' style={{ background: rgbToHex(r, g, b) }}/>
            <div>
                <h2 className='color-card-text'>{provinceData[key].name ?? 'Unnamed'}</h2>
                <p className='color-card-text'>RGB: {r}, {g}, {b}</p>
                <p className='color-card-text'>HEX: {rgbToHex(r, g, b)}</p>
                <p className='color-card-text'>Pixels: {centroids[key].count}</p>
            </div>
        </div>
    )
}