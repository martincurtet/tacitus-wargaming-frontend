import React from 'react'
import Factions from './Factions'
import Units from './Units'

const Tracker = ({ factions, setFactions, unitShop, units, setUnits }) => {
  return (
    <div>
      {/* <Factions factions={factions} setFactions={setFactions} /> */}
      <Units factions={factions} unitShop={unitShop} units={units} setUnits={setUnits} />
    </div>
  )
}

export default Tracker
