import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../connections/socket'
import { UserContext } from '../context/UserContext'
import Button from './Button'

import '../styles/components/SetupUnits.css'

const SetupUnits = ({ unitShop, units, setUnits, factions }) => {
  const params = useParams()
  const [user, setUser] = useContext(UserContext)
  const [indexFactionSelected, setIndexFactionSelected] = useState(0)
  const [inputMen, setInputMen] = useState({})

  const DEFAULT_MEN_VALUE = Number(process.env.DEFAULT_MEN_VALUE) || 20

  // FUNCTIONS
  const selectFaction = (factionCode) => {
    console.log(`clicking on faction ${factionCode}`)
    // if host, set the faction as selected
  }

  const addUnit = (unitCode) => {
    console.log(`clicking on unit ${unitCode}`)
    // find out which faction to add it to
    let selectedFaction = ''
    if (user.userFaction === '') {
      console.log(`user is spectator (host: ${user.isUserHost})`)
      selectedFaction = factions[indexFactionSelected].code
    } else {
      console.log(`user faction is ${user.userFaction}`)
      selectedFaction = user.userFaction
      
    }
    socket.emit('add-unit', {
      roomUuid: params.battleuuid,
      factionCode: selectedFaction,
      unitCode: unitCode
    })
  }

  const removeUnit = (unitCode, identifier) => {
    console.log(`Deleting unit ${unitCode} ${identifier}`)
    // find out which faction to remove it from
    let selectedFaction = ''
    if (user.userFaction === '') {
      console.log(`user is spectator (host: ${user.isUserHost})`)
      selectedFaction = factions[indexFactionSelected].code
    } else {
      console.log(`user faction is ${user.userFaction}`)
      selectedFaction = user.userFaction
    }
    socket.emit('remove-unit', {
      roomUuid: params.battleuuid,
      factionCode: selectedFaction,
      unitCode: unitCode,
      identifier: identifier
    })
  }

  const handleInputMen = (unitCode, identifier, value) => {
    const men = parseInt(value, 10)
    console.log(`men change ${unitCode}-${identifier} ${men}`)
    socket.emit('change-men', {
      roomUuid: params.battleuuid,
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
          initialState[`${u.unitCode}-${u.identifier}`] = parseInt(u.men) || DEFAULT_MEN_VALUE
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
          <div className='unit-item' tooltip={`${u.name}\nHD per men: ${u.hdPerMen}`}>
            {u.icon ? (
              <img
                src={require(`../images/${u.icon}`)}
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
            className='faction-panel'
            onClick={() => selectFaction(f.code)}
          >
            <div className='faction-panel-title'>
              <img src={require(`../images/${f.icon}`)} alt='' height={18} width={30} />
              {f.name}{user.isUserHost && i === indexFactionSelected && '*'}
            </div>
            {units.map((u) => {
              if (u.factionCode === f.code) {
                return (
                  <div key={`${u.unitCode}-${u.identifier}`} className='faction-unit'>
                    <div className='faction-unit-name'>
                      <div>{u.name} {u.identifier}</div>
                      <Button color='none' size='small' onClick={() => removeUnit(u.unitCode, u.identifier)}>x</Button>
                    </div>
                    <div>
                    <input
                      disabled={false}
                      type='number'
                      value={inputMen[`${u.unitCode}-${u.identifier}`] || 20}
                      onChange={(e) => handleInputMen(u.unitCode, u.identifier, e.target.value)}
                      min={0}
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
