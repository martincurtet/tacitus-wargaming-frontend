import React from 'react'
import Unit from './Unit'

import '../styles/components/Units.css'

const Units = ({
    setLog,
    factions,
    units, setUnits
  }) => {
  // TODO move stuff to tracker

  return (
    <div className='tracker-units'>
    {units.map((u) => (
      <Unit
        setLog={setLog}
        factions={factions}
        units={units} setUnits={setUnits}
        unitData={u}
      />
    ))}
    </div>
  )
}

export default Units
