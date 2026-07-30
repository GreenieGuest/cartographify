import { useState } from 'react'
import { useMapStore } from '../store/mapStore'
import ColorDisplay from "./ColorDisplay";
import LayersPanel from "./LayersPanel";
import DataPanel from "./ProvinceDataPanel";

const SECTIONS = [
    'Data',
    'Hierarchy',
    'Layers'
]

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