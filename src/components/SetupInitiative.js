import React from 'react'
import UnitIcon from './UnitIcon'

import '../styles/components/SetupInitiative.css'

const SetupInitiative = ({ units, setUnits, factions }) => {
  // RENDER FUNCTIONS
  const renderTable = (start, end, step, origin) => {
    let tableRows = []
    for (let i = start; (step > 0 ? i < end : i > end); i += step) {
      let unitImages = units
        .filter(u => origin ? u.initiativeRaw === i : u.initiative === i)
        .map(u => (
          <UnitIcon
            className={'initiative-row-image'}
            tooltip={`${u.name}\n${u.men} Men`}
            unitIconName={u.iconName}
            factionIconName={factions.find(f => f.code === u.factionCode).icon}
            veterancyIconName={'militia.png'}
          />
        ))
      tableRows.push(
        <tr key={i} className={`${i % 2 === 0 ? 'even' : 'odd'}`}>
          <td className='row-header'>{i}</td>
          <td className='row-units'>{unitImages}</td>
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
      {renderTable(20, 0, -1, true)}
      {renderTable(25, -5, -1, false)}
    </div>
  )
}
export default SetupInitiative
