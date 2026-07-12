import { useState } from 'react'

const SECTIONS = [
    'Data',
    'Hierarchy',
    'Layers'
]

export default function Sidebar() {
    const [currentSection, setCurrentSection] = useState('Data')

    return (
        <aside class="right-sidebar">
            {SECTIONS.map((section) => (
                <button
                    key={section}
                    onClick={() => handleChangeSection(section)}
                >{section}</button>
            ))}
        </aside>
    )
}