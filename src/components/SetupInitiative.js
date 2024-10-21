import React, { useContext, useEffect, useState } from 'react'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

import UnitIcon from './UnitIcon'
import Button from './Button'

import '../styles/components/SetupInitiative.css'

const SetupInitiative = ({ users, units, setUnits, factions, setLog }) => {
  //
  const params = useParams()
  const [user, setUser] = useContext(UserContext)
  const [currentUnitTypeIndex, setCurrentUnitTypeIndex] = useState(0)

  const unitTypes = [...new Set(units.map(unit => `${unit.factionCode}-${unit.unitCode}`))]

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

  const selectNextUnitTypeIndex = () => {
    let selectedIndex = -1
    let lowestInitiativeRaw = Infinity
    unitTypes.forEach((type, index) => {
      const [factionCode, unitCode] = type.split('-')
      const unitGroup = units.filter(unit => unit.factionCode === factionCode && unit.unitCode === unitCode)
      const initiativeRaw = Math.min(...unitGroup.map(unit => unit.initiativeRaw))

      if (unitGroup.some(unit => unit.initiative === null) && initiativeRaw < lowestInitiativeRaw) {
        lowestInitiativeRaw = initiativeRaw
        selectedIndex = index
      }
    })
    return selectedIndex
  }

  useEffect(() => {
    setCurrentUnitTypeIndex(selectNextUnitTypeIndex())
  }, [units])

  const assignNewInitiative = (value, order=0) => {
    console.log(`init ${value}, order ${order}`)
    const [factionCode, unitCode] = unitTypes[currentUnitTypeIndex].split('-')
    if (user.isHost || user.userFaction === factionCode) {
      socket.emit('change-initiative', {
        roomUuid: params.battleuuid,
        factionCode: factionCode,
        unitCode: unitCode,
        initiative: parseInt(value),
        initiativeOrder: parseInt(order)
      })
    }
  }

  const handleRevertInitiative = (steps) => {
    socket.emit('revert-initiative', {
      roomUuid: params.battleuuid,
      steps: steps
    })
  }

  useEffect(() => {
    socket.on('initiative-changed', (data) => {
      setUnits(data.units)
      setLog(data.log)
    })

    socket.on('initiative-reverted', (data) => {
      setUnits(data.units)
      setLog(data.log)
    })

    return () => {
      socket.off('initiative-changed')
      socket.off('initiative-reverted')
    }
  }, [socket, setUnits])

  // RENDER FUNCTIONS
  const renderTable = (start, end, step, origin) => {
    let tableRows = []
    for (let i = start; (step > 0 ? i < end : i > end); i += step) {
      let unitImages = []
      let isHighlighted = false

      const currentUnitType = unitTypes[currentUnitTypeIndex]
      const [factionCode, unitCode] = currentUnitType?.split('-') || ['', '']
      let factionStratAbility = factions.find(f => f.code === factionCode)?.stratAbility
      const unitGroup = units.filter(u => u.factionCode === factionCode && u.unitCode === unitCode)
      
      isHighlighted = unitGroup.some(unit =>
        (!origin && i >= parseInt(unit.initiativeRaw - factionStratAbility) &&
        i <= parseInt(unit.initiativeRaw + factionStratAbility))
      )

      unitImages = unitTypes
        .map(type => {
          const [factionCode, unitCode] = type.split('-')
          const unitGroup = units.filter(u => u.factionCode === factionCode && u.unitCode === unitCode)

          const matchingUnit = unitGroup.find(u => origin ? u.initiativeRaw === i : u.initiative === i)

          if (matchingUnit) {
            return (
              <UnitIcon
                key={type}
                className={'initiative-row-image'}
                tooltip={`${matchingUnit.name}\n${matchingUnit.men} Men`}
                unitIconName={matchingUnit.iconName}
                factionIconName={factions.find(f => f.code === matchingUnit.factionCode).icon}
                veterancyIconName={veterancyMap[matchingUnit.veterancy].iconName}
                highlighted={`${matchingUnit.factionCode}-${matchingUnit.unitCode}` === currentUnitType}
              />
            )
          } else {
            return null
          }
        })
        .filter(icon => icon !== null)

      let unitImagesWithButtons = []

      if (unitImages.length > 0) {
        if (isHighlighted) {
          // Add a button before the first unit
          unitImagesWithButtons.push(
            <Button
              size='small'
              color='green'
              onClick={() => assignNewInitiative(i, 0)}
            >
              +
            </Button>
          )

          // Add buttons between each unit
          unitImages.forEach((unitIcon, index) => {
            unitImagesWithButtons.push(unitIcon)
            if (index < unitImages.length - 1) {
              unitImagesWithButtons.push(
                <Button
                  size='small'
                  color='green'
                  onClick={() => assignNewInitiative(i, index+1)}
                >
                  +
                </Button>
              )
            }
          })

          // Add a button after the last unit
          unitImagesWithButtons.push(
            <Button
              size='small'
              color='green'
              onClick={() => assignNewInitiative(i, unitImages.length)}
            >
              +
            </Button>
          )
        } else {
          unitImagesWithButtons = unitImages
        }
      } else if (isHighlighted && !origin) {
        // Add a single button if the row is empty and highlighted
        unitImagesWithButtons.push(
          <Button
            size='small'
            color='green'
            onClick={() => assignNewInitiative(i)}
          >
            +
          </Button>
        )
      }

      tableRows.push(
        <tr
          key={i}
          className={`${i % 2 === 0 ? 'even' : 'odd'}`}
        >
          <td className='row-header'>{i}</td>
          <td className={`row-units`}>{unitImagesWithButtons}</td>
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
      {currentUnitTypeIndex !== -1 && (
        <div className='current-unit'>
          <div>
            <img src={require(`./images/${factions.find(f => f.code === unitTypes[currentUnitTypeIndex]?.split('-')[0]).icon}`)} alt='' height={36} width={60} />
          </div>
          <div>{factions.find(f => f.code === unitTypes[currentUnitTypeIndex]?.split('-')[0]).name}</div>
          <div>
            <img src={require(`./images/${units.find(u => `${u.factionCode}-${u.unitCode}` === unitTypes[currentUnitTypeIndex])?.iconName}`)} alt='' height={60} width={60} />
          </div>
          <div>
            {units.find(u => `${u.factionCode}-${u.unitCode}` === unitTypes[currentUnitTypeIndex])?.name}</div>
          <div>
            Users:
            {users.map(u => {
              if (u.faction === unitTypes[currentUnitTypeIndex]?.split('-')[0]) {
                return (<span>{u.username}</span>)
              }
            })}
          </div>
        </div>
      )}
      <div className='initiative-buttons'>
        <Button onClick={() => handleRevertInitiative(1)}>Undo</Button>
        <Button onClick={() => handleRevertInitiative('all')}>Undo All</Button>
      </div>
      <div className='initiative-tables'>
        {renderTable(20, 0, -1, true)}
        {renderTable(25, -5, -1, false)}
      </div>
    </div>
  )
}
export default SetupInitiative
