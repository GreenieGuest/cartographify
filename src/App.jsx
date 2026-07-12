import { useState } from 'react'
import MapDisplay from "./components/MapDisplay";
import Toolbar from "./components/Toolbar";
import Sidebar from "./components/Sidebar";
import { FaMapLocationDot } from "react-icons/fa6";
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <header>
        <h1><FaMapLocationDot class="logo"/>Cartographify (WIP)</h1>
        <p>visualize your map for eu5 or for other purposes</p>
        <p>made by GreenieGuest</p>
        
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
