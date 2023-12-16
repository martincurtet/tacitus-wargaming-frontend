import React from 'react'
import Units from './Units'

const Tracker = ({ setBoard, factions, setFactions, unitShop, units, setUnits, setLog }) => {
  // TODO move some stuff back here instead of units
  return (
    <div>
      <Units setLog={setLog} setBoard={setBoard} factions={factions} unitShop={unitShop} units={units} setUnits={setUnits} />
    </div>
  )
}

export default Tracker
