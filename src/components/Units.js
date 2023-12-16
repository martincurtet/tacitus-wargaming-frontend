import React, { useEffect } from 'react'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { debounce } from '../functions/functions'

import '../styles/components/Units.css'

const Units = ({
    setLog,
    factions,
    units, setUnits
  }) => {
  // TODO move stuff to tracker

  //
  const params = useParams()

  const hdChange = (code, hd) => {
    console.log(code, hd)
    let tempUnit = units.find(u => u.code === code)
    tempUnit.hd = hd
    unitInformationChange(code, tempUnit)
  }

  const fatigueChange = (code, fatigue) => {
    console.log(code, fatigue)
    let tempUnit = units.find(u => u.code === code)
    tempUnit.fatigue = fatigue
    unitInformationChange(code, tempUnit)
  }

  const notesChange = (code, notes) => {
    let tempUnit = units.find(u => u.code === code)
    tempUnit.notes = notes
    unitInformationChange(code, tempUnit)
  }

  const dbNotesChange = debounce(notesChange, 1000)

  const debouncedNotesChange = (code, notes) => {
    dbNotesChange(code, notes)
  }

  const unitInformationChange = (unitCode, unitData) => {
    socket.emit('update-unit', { uuid: params.battleuuid, unitCode: unitCode, unitData: unitData })
  }

  useEffect(() => {
    socket.on('unit-updated', (data) => {
      setUnits(data.units)
      setLog(data.log)
    })

    return () => {
      socket.off('unit-updated')
    }
  }, [])

  return (
    <div>
      <div>
      {units.map((u, i) => (
        <div key={u.code}>
          <p>
            <img src={require(`../images/${factions.find(f => f.name === u.faction).icon}`)} alt='' height={18} width={30} />
            {u.name} {u.identifier} {u.men} men
            <input
              className='small-input'
              type='number'
              value={u.hd}
              onChange={(e) => hdChange(u.code, e.target.value)}
              min={0}
              max={u.maxHd}
              step={1}
            /> / {u.maxHd} HD
            {u.casualties} casualties
            <input
              className='small-input'
              type='number'
              value={u.fatigue}
              onChange={(e) => fatigueChange(u.code, e.target.value)}
              min={0}
              max={10}
              step={1}
            /> fatigue
            <textarea
              onChange={(e) => debouncedNotesChange(u.code, e.target.value)}
            >
              {u.notes}
            </textarea>
          </p>
        </div>
      ))}
      </div>

      
    </div>
  )
}

export default Units
