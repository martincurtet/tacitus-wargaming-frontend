import React from 'react'
import Unit from './Unit'

import '../styles/components/Units.css'

const Units = ({
    setBoard,
    factions,
    units, setUnits,
    setLog
  }) => {

  return (
    <div className='tracker-units'>
    {units.map((u) => (
      <Unit
        key={u.code}
        setBoard={setBoard}
        factions={factions}
        setUnits={setUnits}
        setLog={setLog}
        unitData={u}
      />
    ))}
    </div>
  )
}

export default Units
