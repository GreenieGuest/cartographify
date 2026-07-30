import { useState, useRef } from 'react'
import { useMapStore } from '../store/mapStore'
import ColorDisplay from "./ColorDisplay";

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
        <div className='layers-panel'>
            <button onClick={()=>uploadMapButton.current?.click()}>
            + Upload Layer
            </button>
            <input type="file" ref={uploadMapButton} accept="image/*" style={{display: 'none'}} onChange={handleMapUpload}/>
            <div className="scrollable-box">
            {layers.map((layer, index) => (
                <div key={layer.key} className='layer-container'>
                    <div className="layer-heading">
                        <p>Layer {layer.num}</p>
                        <button class="delete" onClick={()=>removeLayer(layer.key)}>X</button>
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
        </div>
    )
}

function DataPanel() {
    const { selectedProvince, provinceData, setProvinceData, headers, createProvince, updateData, centroids } = useMapStore()
    const [selectedAttributes, setSelectedAttributes] = useState([]);

    if (headers.length < 1) return (
        <p>No Province Data, import a CSV</p>
    )
    if (!selectedProvince) return (
        <p>Select a province to view data</p>
    )

    const [r,g,b] = selectedProvince.rgb;
    const key = selectedProvince.key
    const data = provinceData[key] ?? null;
    const isRegistered = !!data;
    const h = headers.length ? headers : data ? Object.keys(data) : []

    const handleAttributeSelect = (e) => {
        const { value, checked } = e.target;

        if (checked) {
            setSelectedAttributes((prev) => [...prev, value]);
        } else {
            setSelectedAttributes((prev) => prev.filter((item) => item !== value));
        }

        // console.log(selectedAttributes)
    }

    const copyAttribute = (scale) => {
        for (const pKey in provinceData) {
            const p = provinceData[pKey]

            if (p[scale] == data[scale]) {
                for (const field of h) {
                    if (selectedAttributes.includes(field)) {
                        updateData(pKey, field, data[field] ?? '')
                    }
                }
            }
        }
    }
    
    const handleCopyProvince = () => copyAttribute('province');
    const handleCopyArea = () => copyAttribute('area');
    const handleCopyRegion = () => copyAttribute('region');


    return (
        <div className='province-panel'>
            <ColorDisplay r={r} g={g} b={b}/>

            <button onClick={handleCopyProvince}>Copy Selected to All in Province</button>
            <button onClick={handleCopyArea}>Copy Selected to All In Area</button>
            <button onClick={handleCopyRegion}>Copy Selected to All In Region</button>

            <div className='scrollable-box'>
                { !isRegistered ? (
                    <button onClick={()=>createProvince(r, g, b)}>Create Province</button>
                ) : (
                        <table className="province-data-table">
                            <tbody>
                                {h.map((header) => (
                                    <tr>
                                        <td>
                                            <input
                                                value={header}
                                                type='checkbox'
                                                onChange={handleAttributeSelect}
                                                checked={selectedAttributes.includes(header)}
                                            />
                                        </td>
                                        <td className='input-label'>{header}</td>
                                        <td>
                                            <input
                                                className='input-attribute'
                                                value={data[header] ?? ''}
                                                onChange={e => updateData(key, header, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                )}
            </div>
        </div>
    )
}

export default function Sidebar() {
    const [currentSection, setCurrentSection] = useState('Data')

    return (
        <aside className="right-sidebar">
            <div className='buttons-flex'>
            {SECTIONS.map((section) => (
                <button
                    key={section}
                    onClick={() => setCurrentSection(section)}
                    className={currentSection === section ? 'active' : ''}
                >{section}</button>
            ))}
            </div>
            <h1>{currentSection}</h1>
            {currentSection === 'Layers' && <LayersPanel />}
            {currentSection === 'Data' && <DataPanel />}
        </aside>
    )
}