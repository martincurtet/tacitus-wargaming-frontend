import React, { useEffect, useState } from 'react'
import UnitIcon from './UnitIcon'

import '../styles/components/SetupInitiative.css'

const SetupInitiative = ({ units, setUnits, factions }) => {
  //
  const [currentUnitIndex, setCurrentUnitIndex] = useState(0)

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
    console.log(` new initiative ${parseInt(value)}`)
    // send socket event
  }

  // RENDER FUNCTIONS
  const renderTable = (start, end, step, origin) => {
    let tableRows = []
    for (let i = start; (step > 0 ? i < end : i > end); i += step) {
      const currentUnit = units[currentUnitIndex]
      let factionStratAbility = factions.find(f => f.code === currentUnit.factionCode).stratAbility
      let isHighlighted = (origin && currentUnit.initiativeRaw === i) ||
        (
          !origin &&
          i >= parseInt(currentUnit.initiativeRaw - factionStratAbility) &&
          i <= parseInt(currentUnit.initiativeRaw + factionStratAbility)
        )
      let unitImages = units
      .filter(u => origin ? u.initiativeRaw === i : u.initiative === i)
      .map(u => {
        const uniqueIdentifier = `${u.factionCode}-${u.unitCode}-${u.identifier}`
        return (
          <UnitIcon
            className={'initiative-row-image'}
            tooltip={`${u.name}\n${u.men} Men`}
            unitIconName={u.iconName}
            factionIconName={factions.find(f => f.code === u.factionCode).icon}
            veterancyIconName={'militia.png'}
            highlighted={uniqueIdentifier === `${currentUnit.factionCode}-${currentUnit.unitCode}-${currentUnit.identifier}`}
          />
        )})
      tableRows.push(
        <tr
          key={i}
          className={`${i % 2 === 0 ? 'even' : 'odd'}`}
          onClick={() => assignNewInitiative(i)}
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
      <div className='current-unit'>
        Current Unit Information {units[currentUnitIndex]?.factionCode}-{units[currentUnitIndex]?.unitCode}-{units[currentUnitIndex]?.identifier}
      </div>
      <div className='initiative-tables'>
        {renderTable(20, 0, -1, true)}
        {renderTable(25, -5, -1, false)}
      </div>
    </div>
  )
}
export default SetupInitiative
