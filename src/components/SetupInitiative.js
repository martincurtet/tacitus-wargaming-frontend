import React, { useContext, useEffect, useState } from 'react'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

import UnitIcon from './UnitIcon'

import '../styles/components/SetupInitiative.css'

const SetupInitiative = ({ users, units, setUnits, factions }) => {
  //
  const params = useParams()
  const [user, setUser] = useContext(UserContext)
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0)

  const veterancyMap = {
    0: {
      iconName: 'militia.png'
    },
    1: {
      iconName: 'normal.png'
    },
    2: {
      iconName: 'veteran.png'
    },
    3: {
      iconName: 'elite.png'
    }
  }

  const selectNextUnitIndex = () => {
    let selectedIndex = -1
    let lowestInitiativeRaw = Infinity
    for (let i = 0; i < units.length; i++) {
      const unit = units[i]
      if (unit.initiative === null && unit.initiativeRaw < lowestInitiativeRaw) {
        lowestInitiativeRaw = unit.initiativeRaw
        selectedIndex = i
      } else if (unit.initiative === null && unit.initiativeRaw === lowestInitiativeRaw) {
        if (i > selectedIndex) {
          selectedIndex = i
        }
      }
    }
    return selectedIndex
  }

  useEffect(() => {
    setCurrentUnitIndex(selectNextUnitIndex())
  }, [units])

  const assignNewInitiative = (value) => {
    // check that user faction is correct
    if (user.isHost || user.userFaction === units[currentUnitIndex].factionCode) {
      socket.emit('change-initiative', {
        roomUuid: params.battleuuid,
        factionCode: units[currentUnitIndex].factionCode,
        unitCode: units[currentUnitIndex].unitCode,
        identifier: units[currentUnitIndex].identifier,
        initiative: parseInt(value)
      })
    }
  }

  useEffect(() => {
    socket.on('initiative-changed', (data) => {
      setUnits(data.units)
    })

    return () => {
      socket.off('initiative-changed')
    }
  }, [])

  // RENDER FUNCTIONS
  const renderTable = (start, end, step, origin) => {
    let tableRows = []
    for (let i = start; (step > 0 ? i < end : i > end); i += step) {
      let unitImages = null
      let isHighlighted = false
      const currentUnit = units[currentUnitIndex]
      let factionStratAbility = factions.find(f => f.code === currentUnit?.factionCode)?.stratAbility
      isHighlighted = (origin && currentUnit?.initiativeRaw === i) ||
        (
          !origin &&
          i >= parseInt(currentUnit?.initiativeRaw - factionStratAbility) &&
          i <= parseInt(currentUnit?.initiativeRaw + factionStratAbility)
        )
      unitImages = units
      .filter(u => origin ? u.initiativeRaw === i : u.initiative === i)
      .map(u => {
        const uniqueIdentifier = `${u.factionCode}-${u.unitCode}-${u.identifier}`
        return (
          <UnitIcon
            className={'initiative-row-image'}
            tooltip={`${u.name}\n${u.men} Men`}
            unitIconName={u.iconName}
            factionIconName={factions.find(f => f.code === u.factionCode).icon}
            veterancyIconName={veterancyMap[u.veterancy].iconName}
            highlighted={uniqueIdentifier === `${currentUnit?.factionCode}-${currentUnit?.unitCode}-${currentUnit?.identifier}`}
          />
        )})

      tableRows.push(
        <tr
          key={i}
          className={`${i % 2 === 0 ? 'even' : 'odd'}`}
          onClick={origin ? () => {} : () => assignNewInitiative(i)}
        >
          <td className='row-header'>{i}</td>
          <td className={`row-units ${isHighlighted ? 'highlighted' : ''}`}>{unitImages}</td>
        </tr>
      )
    }

    return (
      <table className='initiative-table'>
        <tbody>
          {tableRows}
        </tbody>
      </table>
    )
  }

  // RENDER
  return (
    <div className='setup-initiative'>
      {currentUnitIndex !== -1 && (
        <div className='current-unit'>
          <div>
            <img src={require(`../images/${factions.find(f => f.code === units[currentUnitIndex].factionCode).icon}`)} alt='' height={36} width={60} />
          </div>
          <div>{factions.find(f => f.code === units[currentUnitIndex].factionCode).name}</div>
          <div>
            <img src={require(`../images/${units[currentUnitIndex].iconName}`)} alt='' height={60} width={60} />
          </div>
          {/* <div>{units[currentUnitIndex]?.factionCode}-{units[currentUnitIndex]?.unitCode}-{units[currentUnitIndex]?.identifier}</div> */}
          <div>{units[currentUnitIndex]?.name} {units[currentUnitIndex]?.identifier}</div>
          <div>
            Users:
            {users.map(u => {
              if (u.faction === units[currentUnitIndex].factionCode) {
                return (<span>{u.username}</span>)
              }
            })}
          </div>
        </div>
      )}
      <div className='initiative-tables'>
        {renderTable(20, 0, -1, true)}
        {renderTable(25, -5, -1, false)}
      </div>
    </div>
  )
}
export default SetupInitiative
