import { useMapStore } from '../store/mapStore'

export default function CountryPanel() {
    const { provinceData, countries } = useMapStore()
    
    if (provinceData.length < 1) return (
        <p>No Province Data, import a CSV</p>
    )
    if (hierarchy.length < 1) return (
        <p>No Hierarchy. Perhaps add some?</p>
    )

    return (
        <div className='hierarchy-panel'>
            <div className="scrollable-box">
            <ul>
            {hierarchy.map((node) => (
                <Node key={node.id} node={node}/>
            ))}
            </ul>
            </div>
        </div>
    )
}

function Node({node}) {
    return (
    <li>
        {node.name}
        {node.children.length > 0 &&
        <ul>
        {node.children.map((innerNode) => (
            <Node key={innerNode.id} node={innerNode}/>
        ))}
        </ul>
        }
    </li>
    )
}