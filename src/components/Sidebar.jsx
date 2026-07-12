
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
                    key={section.id}
                    onClick={() => handleChangeSection(section.id)}
                >{section.label}</button>
            ))}
        </aside>
    )
}