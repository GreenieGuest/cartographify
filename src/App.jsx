import { use, useState } from 'react'
import MapDisplay from "./components/MapDisplay";
import Toolbar from "./components/Toolbar";
import Sidebar from "./components/Sidebar";
import { FaMapLocationDot } from "react-icons/fa6";
import { useMapStore } from "./store/mapStore";
import './App.css'

function App() {
  const uploadMapButton = useRef(null);
  const { mapImage, loadMapImage } = useMapStore()

  const handleMapUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const image = new Image()
        image.onload = () => {
          loadMapImage(image)
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

  return (
    <>
      <header>
        <h1><FaMapLocationDot class="logo"/>Cartographify (WIP)</h1>
        <p>visualize your map for eu5 or for other purposes</p>
        <p>made by GreenieGuest</p>
        <button onClick={()=>uploadMapButton.current?.click()}>
          Upload Map Image
        </button>
        <input type="file" ref="uploadMapButton" accept="image/*" style={{display: 'none'}} onChange={handleMapUpload}/>
        
      </header>
      <div class="content-wrapper">
        <Toolbar/>
        <main>
          <MapDisplay/>
        </main>
        <Sidebar/>
      </div>
    </>
  )
}

export default App
