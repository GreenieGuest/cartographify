import { useState, useRef } from 'react'
import { useMapStore } from '../store/mapStore'

export default function DataExport() {
    const [isOpen, setIsOpen] = useState(false);
    const { exportCSVData } = useMapStore()

    const handleExportCSV = () => {
        const text = exportCSVData();
        if (!text) {
            console.log("no csv data to export");
            return;
        }

        const blob = new Blob([text], { type: 'text/csv'})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'MapData.csv'
        a.click()
        URL.revokeObjectURL(url);
    }

    return (
        <div>
            <button onClick={() => {
                if (isOpen) setIsOpen(false)
                if (!isOpen) setIsOpen(true)
            }}>Export...</button>
            {isOpen && <div className='export-menu'>
                <button onClick={handleExportCSV}>Export as CSV</button>
                <button>Export as EU5 Files</button>
            </div>}
        </div>
    )
}