import React from 'react'

import '../styles/components/UnitIcon.css'

const UnitIcon = ({ className='', tooltip, unitIconName, factionIconName, veterancyIconName, highlighted }) => {
  return (
    <div className={`unit-image-container ${className} ${highlighted ? 'highlighted' : ''}`} tooltip={tooltip}>
      <img src={require(`../images/${unitIconName}`)} alt='' className='unit-image' />
      <img src={require(`../images/${factionIconName}`)} alt='' className='faction-image' />
      <img src={require(`../images/${veterancyIconName}`)} alt='' className='veterancy-image' />
    </div>
  )
}

export default UnitIcon
