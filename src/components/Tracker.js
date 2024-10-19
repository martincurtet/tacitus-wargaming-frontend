import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../connections/socket'

import Units from './Units'

import '../styles/components/Tracker.css'

const Tracker = ({
    setBoard,
    factions, setFactions,
    units, setUnits,
    setLog
  }) => {

  //
  const params = useParams()

  // RENDER
  return (
    <div className='tracker'>
      <Units
        setLog={setLog}
        factions={factions}
        units={units}
        setUnits={setUnits}
      />
    </div>
  )
}

export default Tracker
