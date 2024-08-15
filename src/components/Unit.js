import React, { useEffect, useState } from 'react'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'

import '../styles/components/Unit.css'

const Unit = ({
    setBoard,
    factions,
    setUnits,
    unitData,
    setLog,
  }) => {

  //
  const params = useParams()
  const [inputHd, setInputHd] = useState(unitData.hd)

  //
  const handleRevive = (unitData) => {
    socket.emit('revive-unit', {
      roomUuid: params.battleuuid,
      factionCode: unitData.factionCode,
      unitCode: unitData.unitCode,
      identifier: unitData.identifier
    })
  }

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

    socket.on('unit-revived', (data) => {
      setBoard(data.board)
      setUnits(data.units)
      setLog(data.log)
    })

    return () => {
      socket.off('unit-hd-updated')
      socket.off('unit-fatigue-updated')
      socket.off('unit-notes-updated')
      socket.off('unit-revived')
    }
  }, [])

  // RENDER
  return (
    <div key={unitData.code} className={`tracker-item ${unitData.isAlive ? '' : 'inactive'}`}>
      <img className='tracker-item-one' src={require(`../images/${factions.find(f => f.code === unitData.factionCode).icon}`)} alt='' height={18} width={30} />
      <div className='tracker-item-two'>
        <div>{unitData.fire && (<span>🔥</span>)}{unitData.name.split(' ').slice(1).join(' ')} {unitData.identifier}</div>
        <div>{unitData.name.split(' ')[0]} {unitData.men} men</div>
        {unitData.coordinates !== '' ? (
          <div>Location {unitData.coordinates}</div>
        ) : (
          <div>
            <span
              className='emote'
              tooltip='Revive'
              onClick={() => handleRevive(unitData)}
            >
              💀
            </span>
          </div>
        )}

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
          <span
            className='emote'
            tooltip='Bed (-1)'
            onClick={() => handleFatigueChange(-1)}
          >
            🛏️
          </span>
          {unitData.fatigue}
          <span
            className='emote'
            tooltip='Sword (2)'
            onClick={() => handleFatigueChange(2)}
          >
            🗡️
          </span>
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
