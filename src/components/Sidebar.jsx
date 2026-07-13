import { useState } from 'react'

const SECTIONS = [
    'Data',
    'Hierarchy',
    'Layers'
]

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
        </aside>
    )
}