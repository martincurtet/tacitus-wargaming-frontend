import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../connections/socket'
import { UserContext } from '../context/UserContext'
import Button from './Button'

import '../styles/components/SetupUnits.css'

const SetupUnits = ({ unitShop, units, setUnits, factions }) => {
  const params = useParams()
  const [user, setUser] = useContext(UserContext)
  const [indexFactionSelected, setIndexFactionSelected] = useState(user.isHost ? 0 : -1)
  const [inputMen, setInputMen] = useState({})

  const DEFAULT_MEN_VALUE = Number(process.env.DEFAULT_MEN_VALUE) || 20

  // FUNCTIONS
  const selectFaction = (index) => {
    if (user.isHost) {
      setIndexFactionSelected(index)
    }
  }

  const addUnit = (unitCode) => {
    let selectedFaction = ''
    if (user.userFaction === '') {
      selectedFaction = factions[indexFactionSelected]?.code
    } else {
      selectedFaction = user.userFaction
    }
    if (user.isHost) {
      selectedFaction = factions[indexFactionSelected]?.code
    }
    if (units.filter(u => u.factionCode === factions[indexFactionSelected]?.code).length < 100) {
      socket.emit('add-unit', {
        roomUuid: params.battleuuid,
        factionCode: selectedFaction,
        unitCode: unitCode
      })
    }
  }

  const removeUnit = (factionCode, unitCode, identifier) => {
    socket.emit('remove-unit', {
      roomUuid: params.battleuuid,
      factionCode: factionCode,
      unitCode: unitCode,
      identifier: identifier
    })
  }

  const handleInputMen = (factionCode, unitCode, identifier, value) => {
    let men = parseInt(value.replace(/[^0-9]/g, '') || '0', 10)
    if (isNaN(men) || men < 1) men = 1
    if (men > 99999) men = 99999
    socket.emit('change-men', {
      roomUuid: params.battleuuid,
      factionCode: factionCode,
      unitCode: unitCode,
      identifier: identifier,
      men: men
    })
  }

  // SOCKET LISTENER
  useEffect(() => {
    socket.on('unit-added', (data) => {
      setUnits(data.units)
    })

    socket.on('unit-removed', (data) => {
      setUnits(data.units)
    })

    socket.on('men-changed', (data) => {
      setInputMen(() => {
        let initialState = {}
        data.units.forEach(u => {
          initialState[`${u.factionCode}-${u.unitCode}-${u.identifier}`] = parseInt(u.men) || DEFAULT_MEN_VALUE
        })
        return initialState
      })
      setUnits(data.units)
    })

    return () => {
      socket.off('unit-added')
      socket.off('unit-removed')
      socket.off('men-changed')
    }
  }, [])

  // RENDER
  return (
    <div className='setup-units'>
      <div className='unit-store'>
        {unitShop.map((u) => (
          <div key={u.code} className='unit-item' tooltip={`${u.name}\nHD per men: ${u.hdPerMen}`}>
            {u.icon ? (
              <img
                src={`/images/${u.icon}`}
                onClick={() => addUnit(u.code)}
                alt=''
                height={48}
                width={48} />
            ) : null}
          </div>
        ))}
      </div>

      <div className='faction-panels'>
        {factions.map((f, i) => (
          <div
            key={f.code}
            className={`faction-panel ${!user.isHost && user.isSpectator ? '' : (!user.isHost && user.userFaction === f.code ? 'selected' : (factions[indexFactionSelected]?.code === f.code ? 'selected' : ''))}`}
            style={{ borderColor: f.color }}
            onClick={() => selectFaction(i)}
          >
            <div className='faction-panel-title'>
              <img src={`/images/${f.icon}`} alt='' height={18} width={30} />
              {f.name}
            </div>
            {units.map((u) => {
              if (u.factionCode === f.code) {
                return (
                  <div key={`${u.unitCode}-${u.identifier}`} className='faction-unit'>
                    <div className='faction-unit-name'>
                      <div>{u.name} {u.identifier}</div>
                      <Button color='none' size='small' onClick={() => removeUnit(f.code, u.unitCode, u.identifier)}>x</Button>
                    </div>
                    <div>
                    <input
                      disabled={!user.isHost && f.code !== user.userFaction}
                      type='number'
                      value={inputMen[`${u.factionCode}-${u.unitCode}-${u.identifier}`] || 20}
                      onChange={(e) => handleInputMen(f.code, u.unitCode, u.identifier, e.target.value)}
                      min={1}
                      max={99999}
                      step={1}
                    /> men {u.maxHd} HD </div>
                  </div>
                )
              }
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SetupUnits
