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
      {unitIconName && <img src={require(`../images/${unitIconName}`)} alt='' className='unit-image' onClick={() => console.log(`coucou`)} />}
      {factionIconName && <img src={require(`../images/${factionIconName}`)} alt='' className='faction-image' onClick={() => console.log(`coucou`)} />}
      {veterancyIconName && <img src={require(`../images/${veterancyIconName}`)} alt='' className='veterancy-image' onClick={() => console.log(`coucou`)} />}
      {identifier && <div className='identifier' style={{ color: identifierColor }}>{identifier}</div>}
    </div>
  )
}

export default UnitIcon
