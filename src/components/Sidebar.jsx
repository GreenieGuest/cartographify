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
    const { layers, addLayer, removeLayer } = useMapStore()

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
                <div key={layer.key}>
                    <p>Layer {layer.num}</p>
                    <button onClick={()=>removeLayer(layer.key)}>X</button>
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