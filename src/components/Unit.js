import React, { useEffect, useState } from 'react'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { debounce } from '../functions/functions'
import '../styles/components/Unit.css'

const Unit = ({
    setLog,
    factions,
    setUnits,
    unitData
  }) => {

  //
  const params = useParams()

  const [inputHd, setInputHd] = useState(unitData.hd)

  // CHANGE HD FUNCTIONS
  const hdChange = (hd) => {
    if (hd < 0 || hd > unitData.maxHd) {
      console.log(`out of normal values: ${hd}`)
      setInputHd(unitData.hd)
    } else {
      let tempUnit = unitData
      tempUnit.hd = hd.toString()
      unitInformationChange(unitData.code, tempUnit)
    }
  }

  const dbHdChange = debounce(hdChange, 1000)

  const debouncedHdChange = (hd) => {
    setInputHd(hd)
    dbHdChange(hd)
  }

  // CHANGE FATIGUE FUNCTIONS
  const fatigueChange = (fatigueIncrement) => {
    // fatigue can't drop to 0 if it's 1
    let tempUnit = unitData
    let newFatigue = Number(tempUnit.fatigue) + Number(fatigueIncrement)
    if (newFatigue < 0 || newFatigue > 100) return
    tempUnit.fatigue = newFatigue.toString()
    unitInformationChange(unitData.code, tempUnit)
  }

  // CHANGE NOTES FUNCTIONS
  const notesChange = (notes) => {
    let tempUnit = unitData
    tempUnit.notes = notes
    unitInformationChange(unitData.code, tempUnit)
  }

  const dbNotesChange = debounce(notesChange, 1000)

  const debouncedNotesChange = (notes) => {
    dbNotesChange(notes)
  }

  // UNIT CHANGE SOCKET EVENT
  const unitInformationChange = (unitCode, unitData) => {
    socket.emit('update-unit', { uuid: params.battleuuid, unitCode: unitCode, unitData: unitData })
  }

  // SOCKET LISTENERS
  useEffect(() => {
    socket.on('unit-updated', (data) => {
      setUnits(data.units)
      setLog(data.log)
      setInputHd(data.units.find(u => u.code === unitData.code).hd)
    })

    return () => {
      socket.off('unit-updated')
    }
  }, [])

  // RENDER
  return (
    <div key={unitData.code} className='tracker-item'>
      <img className='tracker-item-one' src={require(`../images/${factions.find(f => f.name === unitData.faction).icon}`)} alt='' height={18} width={30} />
      <div className='tracker-item-two'>
        <div>{unitData.name.split(' ').slice(1).join(' ')} {unitData.identifier}</div>
        <div>{unitData.name.split(' ')[0]} {unitData.men} men</div>
        {/* <div>Location</div> */}
      </div>
      <div className='tracker-item-three'>
        <div>
          <input
            className='small-input'
            type='number'
            value={inputHd}
            onChange={(e) => debouncedHdChange(e.target.value)}
            min={0}
            max={unitData.maxHd}
            step={1}
          /> / {unitData.maxHd} HD
          {/* <textarea
            onChange={(e) => debouncedHdChange(e.target.value)}
            maxLength={3}
          >
            {unitData.hd}
          </textarea> / {unitData.maxHd} HD */}
        </div>
        <div>
          {unitData.casualties} casualties
        </div>
      </div>
      <div className='tracker-item-four'>
        <div>Fatigue</div>
        <div>
          <button onClick={() => fatigueChange(-1)}>-</button>
          {/* <input
            className='small-input'
            type='number'
            value={unitData.fatigue}
            onChange={(e) => fatigueChange(unitData.code, e.target.value)}
            min={0}
            max={100}
            step={1}
          /> */}
          {unitData.fatigue}
          <button onClick={() => fatigueChange(2)}>+</button>
        </div>
      </div>
      <div className='tracker-item-five'>
        <textarea
          onChange={(e) => debouncedNotesChange(e.target.value)}
        >
          {unitData.notes}
        </textarea>
      </div>
    </div>
  )
}

export default Unit
