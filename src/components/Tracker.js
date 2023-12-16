import React from 'react'
import Units from './Units'

const Tracker = ({ setBoard, factionShop, setFactionShop, factions, setFactions, unitShop, units, setUnits, setLog }) => {
  // TODO move some stuff back here instead of units
  // modal unit manager
  // units -> unit component (not here)
  // toolbar

  return (
    <div>
      <Units factionShop={factionShop} setFactionShop={setFactionShop} setLog={setLog} setBoard={setBoard} factions={factions} unitShop={unitShop} units={units} setUnits={setUnits} />
    </div>
  )
}

export default Tracker
