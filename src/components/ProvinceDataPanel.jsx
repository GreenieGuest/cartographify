import { useState } from 'react'
import { useMapStore } from '../store/mapStore'
import ColorDisplay from "./ColorDisplay";

export default function DataPanel() {
    const { selectedProvince, provinceData, setProvinceData, headers, createProvince, updateData, centroids, setPortActive } = useMapStore()
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
            <button onClick={() => setPortActive(key)}>Set Port...</button>

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