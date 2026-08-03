import { useState } from 'react'
import { useMapStore } from '../store/mapStore'

export default function CountryPanel() {
    const { provinceData, countries, autofillCountries } = useMapStore()
    
    if (Object.keys(provinceData).length < 1) return (
        <p>No Province Data, import a CSV</p>
    )
    if (Object.keys(countries).length < 1) return (
        <div>
            <p>No Countries. Perhaps add some?</p>
            <button onClick={() => autofillCountries()}>Generate Tags</button>
        </div>
    )

    return (
        <div className='hierarchy-panel'>
            <button onClick={() => autofillCountries()}>Generate Tags</button>
            <div className="scrollable-box">
            {Object.values(countries).map((country) => (
                <ul key={country.id}>
                    <li>{country.id}</li>
                    <li>{country.name}</li>
                    <li>{country.religion}</li>
                    <li>{country.culture}</li>
                    <li>{provinceData[country.capital].name}</li>
                </ul>
            ))}
            </div>
        </div>
    )
}

function CountryBlock() {
    const [isOpen, setIsOpen] = useState(true)

    // to do later
}