import React from 'react'
import '../styles/components/UnitIcon.css'

const UnitIcon = ({
    className='',
    tooltip,
    unitIconName=null, factionIconName=null, veterancyIconName=null,
    highlighted, handleClick, identifier, identifierColor
  }) => {

  // RENDER
  return (
    <div
      className={`unit-image-container ${className} ${highlighted ? 'highlighted' : ''}`}
      tooltip={tooltip}
      onClick={handleClick}
    >
      {unitIconName && <img src={`./images/${unitIconName}`} alt='' className='unit-image' />}
      {factionIconName && <img src={`./images/${factionIconName}`} alt='' className='faction-image' />}
      {veterancyIconName && <img src={`./images/${veterancyIconName}`} alt='' className='veterancy-image' />}
      {identifier && <div className='identifier' style={{ color: identifierColor }}>{identifier}</div>}
    </div>
  )
}

export default UnitIcon
