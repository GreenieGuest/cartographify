import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <header>
        <h1>Cartographify (WIP)</h1>
        <p>visualize your map for eu5 or for other purposes</p>
        <p>made by GreenieGuest</p>
      </header>
      <aside class="left-sidebar">
        <h3>Tools & Data</h3>
      </aside>
      <main>
        <p>Map will go here</p>
      </main>
      <aside class="right-sidebar">
        <h3>Tools & Data</h3>
      </aside>
    </>
  )
}

export default App
