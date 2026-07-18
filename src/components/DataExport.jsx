import { useState, useRef } from 'react'

export default function DataExport() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            <button onClick={() => {
                if (isOpen) setIsOpen(false)
                if (!isOpen) setIsOpen(true)
            }}>Export...</button>
            {isOpen && <div className='export-menu'>
                <button>Export as CSV</button>
                <button>Export as EU5 Files</button>
            </div>}
        </div>
    )
}