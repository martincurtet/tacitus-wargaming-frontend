import React from 'react'

import '../styles/components/SetupInitiative.css'

const SetupInitiative = ({ units, setUnits }) => {
  // RENDER FUNCTIONS
  const renderTable = (start, end, step) => {
    let tableRows = []
    for (let i = start; (step > 0 ? i < end : i > end); i += step) {
      tableRows.push(
        <tr key={i}>
          <td className='row-header'>{i}</td>
          <td>
            {/* {units[i]?.iconName !== undefined && (
              <img
                src={require(`../images/${units[i].iconName}`)}
                onClick={() => {}}
                alt=''
                height={48}
                width={48}
              />
            )} */}
          </td>
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
      {renderTable(0, 20, 1)}
      {renderTable(25, -5, -1)}
    </div>
  )
}

export default SetupInitiative
