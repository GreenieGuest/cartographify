import { use, useRef, useState } from 'react'
import MapDisplay from "./components/MapDisplay";
import Toolbar from "./components/Toolbar";
import Sidebar from "./components/Sidebar";
import DataExport from "./components/DataExport";
import { FaMapLocationDot } from "react-icons/fa6";
import { useMapStore } from "./store/mapStore";
import './App.css'

function App() {
  const uploadMapButton = useRef(null);
  const uploadCSVButton = useRef(null);
  const { mapImage, setMapImage, loadCSVData, autofillHierarchy } = useMapStore()

  const handleMapUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const image = new Image()
        image.onload = () => {
          setMapImage(image)
        }
        image.onerror = (event) => {
          console.log("Map failed to upload")
        }
        image.src = event.target.result
      }
      reader.readAsDataURL(file)
      e.target.value = ''
    }
  }

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        loadCSVData(text);
        autofillHierarchy();
      }
      reader.readAsText(file)
      e.target.value = ''
    }
  }

  return (
    <div className="shell">
      <header>
        <h1><FaMapLocationDot className="logo"/>Cartographify (WIP)</h1>
        <div>
          <p>visualize your map for eu5 or for other purposes</p>
          <p>made by GreenieGuest</p>
        </div>

        <div className="buttons-flex">
          <button onClick={()=>uploadMapButton.current?.click()}>
            Upload Map Image
          </button>
          <input type="file" ref={uploadMapButton} accept="image/*" style={{display: 'none'}} onChange={handleMapUpload}/>

          <button onClick={()=>uploadCSVButton.current?.click()}>
            Upload Map Data (CSV)
          </button>
          <input type="file" ref={uploadCSVButton} accept=".csv" style={{display: 'none'}} onChange={handleCSVUpload}/>

          <DataExport/>
        </div>
        
      </header>
      <div className="content-wrapper">
        <Toolbar/>
        <main>
          <MapDisplay/>
        </main>
        <Sidebar/>
      </div>
    </div>
  )
}

export default App
