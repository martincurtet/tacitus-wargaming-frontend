import React from 'react'

import '../styles/components/SetupInitiative.css'

const SetupInitiative = ({ units, setUnits }) => {
  // RENDER FUNCTIONS
  const renderTable = (start, end, step, origin) => {
    let tableRows = []
    for (let i = start; (step > 0 ? i < end : i > end); i += step) {
      let unitImages = units
        .filter(u => origin ? u.initiativeRaw === i : u.initiative === i)
        .map(u => (
          <img
            key={`${u.factionCode}-${u.unitCode}-${u.identifier}`} // assuming each unit has a unique id
            src={require(`../images/${u.iconName}`)}
            onClick={() => {}}
            className='initiative-row-image'
            alt=''
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
