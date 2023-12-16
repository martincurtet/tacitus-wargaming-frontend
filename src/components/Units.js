import React, { useEffect } from 'react'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { debounce } from '../functions/functions'

import '../styles/components/Units.css'

const Units = ({ factionShop, setFactionShop, setLog, setBoard, factions, unitShop, units, setUnits }) => {
  // TODO move stuff to tracker

  //
  const params = useParams()

  // const veterancies = [
  //   { id: 0, name: 'Militia', icon: require('../images/militia.png'), next: 1 },
  //   { id: 1, name: 'Normal', icon: require('../images/normal.png'), next: 2 },
  //   { id: 2, name: 'Veteran', icon: require('../images/veteran.png'), next: 3 },
  //   { id: 3, name: 'Elite', icon: require('../images/elite.png'), next: 0 }
  // ]

  const hdChange = (code, hd) => {
    console.log(code, hd)
    // min max values of hd
    // DONT UPDATE UNIT, SEND CHANGE
    // setUnits((prev) =>
    //   prev.map((u) =>
    //     u.code === code ? {...u, hd: hd } : u
    //   )
    // )
    let tempUnit = units.find(u => u.code === code)
    tempUnit.hd = hd
    unitInformationChange(code, tempUnit)
  }

  const casualtiesChange = (code, casualties) => {
    console.log(code, casualties)
    // DONT UPDATE UNIT, SEND CHANGE
    // setUnits((prev) =>
    //   prev.map((u) =>
    //     u.code === code ? {...u, casualties: casualties } : u
    //   )
    // )
    let tempUnit = units.find(u => u.code === code)
    tempUnit.casualties = casualties
    unitInformationChange(code, tempUnit)
  }

  const fatigueChange = (code, fatigue) => {
    console.log(code, fatigue)
    // DONT UPDATE UNIT, SEND CHANGE
    // setUnits((prev) =>
    //   prev.map((u) =>
    //     u.code === code ? {...u, fatigue: fatigue } : u
    //   )
    // )
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
          {/* indicate faction by icon */}
          <p>
            <img src={require(`../images/${factions.find(f => f.name === u.faction).icon}`)} alt='' height={18} width={30} />
            {/* {veterancies[u.veterancy].name} */}
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
            <input
              className='small-input'
              type='number'
              value={u.casualties}
              onChange={(e) => casualtiesChange(u.code, e.target.value)}
              min={0}
              max={u.men}
              step={1}
            /> casualties
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
