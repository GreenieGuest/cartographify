import { useState, useRef } from 'react'
import { useMapStore } from '../store/mapStore'

const SECTIONS = [
    'Data',
    'Hierarchy',
    'Layers'
]

// Layers Panel
function LayersPanel() {
    const uploadMapButton = useRef(null);
    const { mapImage, layers, addLayer, removeLayer, updateLayer } = useMapStore()

    const handleMapUpload = (e) => {
        const file = e.target.files[0];

        if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const image = new Image()
            image.onload = () => {
            addLayer(image)
            console.log("Successfully added layer :)")
            console.log(layers)
            }
            image.onerror = (event) => {
            console.log("Map failed to upload")
            }
            image.src = event.target.result
        }
        reader.readAsDataURL(file)
        e.target.value = ''
        }
    }
    
    return (
        <div>
            <button onClick={()=>uploadMapButton.current?.click()}>
            + Upload Layer
            </button>
            <input type="file" ref={uploadMapButton} accept="image/*" style={{display: 'none'}} onChange={handleMapUpload}/>
            {layers.map((layer, index) => (
                <div key={layer.key} className='layer-container'>
                    <div className="layer-heading">
                        <p>Layer {layer.num}</p>
                        <button onClick={()=>removeLayer(layer.key)}>X</button>
                    </div>
                    <div className="layer-setting">
                        <label>Opacity</label>
                        <input type='range' value={layer.opacity} min='0' max='1' step='0.01' onChange={(e)=>updateLayer(layer.key, { opacity: Number(e.target.value)})}/>
                        <input className="alt-setting" type='number' value={layer.opacity} min='0' max='1' step='0.01' onChange={(e)=>updateLayer(layer.key, { opacity: Number(e.target.value)})}/>
                    </div>
                    <div className="layer-setting">
                        <label>Size</label>
                        <input type='range' value={layer.scale} min='0.1' max='5' step='0.01' onChange={(e)=>updateLayer(layer.key, { scale: Number(e.target.value)})}/>
                        <input className="alt-setting" type='number' value={layer.scale} step='0.01' onChange={(e)=>updateLayer(layer.key, { scale: Number(e.target.value)})}/>
                    </div>
                    <div className="layer-setting">
                        <label>X-Offset</label>
                        <input type='range' value={layer.offset.x} min={mapImage ? -mapImage.width : -1024} max={mapImage ? mapImage.width : 1024} step='1' onChange={(e)=>updateLayer(layer.key, { offset: { x: Number(e.target.value), y: layer.offset.y}})}/>
                        <input className="alt-setting" type='number' value={layer.offset.x} onChange={(e)=>updateLayer(layer.key, { offset: { x: Number(e.target.value), y: layer.offset.y}})}/>
                    </div>
                    <div className="layer-setting">
                        <label>Y-Offset</label>
                        <input type='range' value={layer.offset.y} min={mapImage ? -mapImage.height : -1024} max={mapImage ? mapImage.height : 1024} step='1' onChange={(e)=>updateLayer(layer.key, { offset: { x: layer.offset.x, y: Number(e.target.value)}})}/>
                        <input className="alt-setting" type='number' value={layer.offset.y} onChange={(e)=>updateLayer(layer.key, { offset: { x: layer.offset.x, y: Number(e.target.value)}})}/>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function Sidebar() {
    const [currentSection, setCurrentSection] = useState('Data')

    return (
        <aside className="right-sidebar">
            {SECTIONS.map((section) => (
                <button
                    key={section}
                    onClick={() => setCurrentSection(section)}
                >{section}</button>
            ))}
            <h1>{currentSection}</h1>
            {currentSection === 'Layers' && <LayersPanel />}
        </aside>
    )
}