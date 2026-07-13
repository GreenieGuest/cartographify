import { useState } from 'react'

export default function Toolbar() {
    const [currentMapMode, setCurrentMapMode] = useState('default')

    const MAP_MODES = [
        { id: 'default', label: 'Default (Location)'},
        { id: 'assigned', label: 'Assigned'},
        { id: 'tradeGood', label: 'Trade Goods'},
        { id: 'population', label: 'Population'},
        { id: 'vegetation', label: 'Vegetation'},
        { id: 'terrain', label: 'Topography'},
        { id: 'climate', label: 'Climate'},
        { id: 'owner', label: 'Owner'},
        { id: 'culture', label: 'Culture'},
        { id: 'religion', label: 'Religion'},
        { id: 'harbors', label: 'Harbors'},
        //Hierarchical
        { id: 'continent', label: 'Continent'},
        { id: 'subcontinent', label: 'Subcontinent'},
        { id: 'region', label: 'Region'},
        { id: 'area', label: 'Area'},
        { id: 'province', label: 'Province'},
        { id: 'isCoastal', label: 'Coastal'},
    ]

    return (
        <aside className="left-sidebar">
            <h2>Map Modes</h2>
            {MAP_MODES.map((section) => (
                <button
                    key={section.id}
                    onClick={() => setCurrentMapMode(section.id)}
                >{section.label}</button>
            ))}
        </aside>
    )
}