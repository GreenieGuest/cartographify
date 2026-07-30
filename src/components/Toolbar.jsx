import { useState } from 'react'
import { useMapStore } from '../store/mapStore'

export default function Toolbar() {
    const { mapMode, setMapMode, showLabels, setShowLabels } = useMapStore()

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
        { id: 'pdensity', label: 'Pop Density'},
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
            <div>
                {MAP_MODES.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setMapMode(section.id)}
                        className={mapMode === section.id ? 'active' : ''}
                    >{section.label}</button>
                ))}
            </div>
            <label>
                <input
                    type='checkbox'
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                />
                Show Labels
            </label>
        </aside>
    )
}