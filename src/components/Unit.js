import React, { useEffect, useState } from 'react'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { debounce } from '../functions/functions'
import '../styles/components/Unit.css'
import Button from './Button'

const Unit = ({
    factions,
    setUnits,
    unitData,
    setLog,
  }) => {

  //
  const params = useParams()
  const [inputHd, setInputHd] = useState(unitData.hd)

  // CHANGE HD FUNCTION
  const handleInputHd = (e) => {
    let hd = Number(e.target.value)
    if (hd >= 0 && hd <= parseInt(unitData.maxHd)) {
      socket.emit('update-unit-hd', {
        roomUuid: params.battleuuid,
        factionCode: unitData.factionCode,
        unitCode: unitData.unitCode,
        identifier: unitData.identifier,
        hd: hd
      })
      setInputHd(hd)
    }
  }

  // CHANGE FATIGUE FUNCTION
  const handleFatigueChange = (fatigueIncrement) => {
    let fatigue = Number(unitData.fatigue) + Number(fatigueIncrement)
    if (fatigue < 0 || fatigue > 100) return
    console.log(fatigue)
    socket.emit('update-unit-fatigue', {
      roomUuid: params.battleuuid,
      factionCode: unitData.factionCode,
      unitCode: unitData.unitCode,
      identifier: unitData.identifier,
      fatigue: fatigue
    })
  }

  // CHANGE NOTES FUNCTION
  const handleInputNotes = (e) => {
    let notes = (e.target.value).toString()
    socket.emit('update-unit-notes', {
      roomUuid: params.battleuuid,
      factionCode: unitData.factionCode,
      unitCode: unitData.unitCode,
      identifier: unitData.identifier,
      notes: notes
    })
  }

  // SOCKET LISTENERS
  useEffect(() => {
    socket.on('unit-hd-updated', (data) => {
      setUnits(data.units)
      setLog(data.log)
    })

    socket.on('unit-fatigue-updated', (data) => {
      setUnits(data.units)
      setLog(data.log)
    })

    socket.on('unit-notes-updated', (data) => {
      setUnits(data.units)
      setLog(data.log)
    })

    return () => {
      socket.off('unit-hd-updated')
      socket.off('unit-fatigue-updated')
      socket.off('unit-notes-updated')
    }
  }, [])

  // RENDER
  return (
    <div key={unitData.code} className='tracker-item'>
      <img className='tracker-item-one' src={require(`../images/${factions.find(f => f.code === unitData.factionCode).icon}`)} alt='' height={18} width={30} />
      <div className='tracker-item-two'>
        <div>{unitData.name.split(' ').slice(1).join(' ')} {unitData.identifier}</div>
        <div>{unitData.name.split(' ')[0]} {unitData.men} men</div>
        <div>{unitData.coordinates}</div>
      </div>
      <div className='tracker-item-three'>
        <div>
          <input
            className='small-input'
            type='number'
            value={inputHd}
            onChange={handleInputHd}
            min={0}
            max={unitData.maxHd}
            step={1}
          /> / {unitData.maxHd} HD
        </div>
        <div>
          {unitData.casualties} casualties
        </div>
      </div>
      <div className='tracker-item-four'>
        <div>Fatigue</div>
        <div className='fatigue-controls'>
          <Button color='green' size='small' onClick={() => handleFatigueChange(-1)}>b</Button>
          {unitData.fatigue}
          <Button color='red' size='small' onClick={() => handleFatigueChange(2)}>s</Button>
        </div>
      </div>
      <div className='tracker-item-five'>
        <textarea
          onChange={handleInputNotes}
        >
          {unitData.notes}
        </textarea>
      </div>
    </div>
  )
}

export default Unit
