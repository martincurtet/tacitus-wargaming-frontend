import React, { useState } from 'react'
import Factions from './Factions'
import '../styles/components/Tracker.css'

const Tracker = ({ factions, setFactions, units, setUnits }) => {
  const [isEditUnitsOn, setIsEditUnitsOn] = useState(false)

  const toggleEditUnits = () => {
    setIsEditUnitsOn(prev => !prev)
  }

  return (
    <div>
      <Factions factions={factions} setFactions={setFactions} />

      <button onClick={toggleEditUnits}>Toggle Edit Units</button>
      {isEditUnitsOn ? (
        <button>Add Unit</button>
      ) : null}
      <div className='unit-list'>
      {units.map((u, i) => (
        <div className='unit-item' key={i}>
          <p style={{ color: u.color }}>{u.experience} {u.name}</p>
          {isEditUnitsOn ? (
            <>
              <button>Edit</button>
              <button>Delete</button>
            </>
          ) : null}
        </div>
      ))}
      </div>
    </div>
  )
}

export default Tracker
