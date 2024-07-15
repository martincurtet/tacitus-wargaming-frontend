import React, { useContext, useState } from 'react'
import { UserContext } from '../context/UserContext'
import Button from './Button'

import '../styles/components/SetupUnits.css'

const SetupUnits = ({ unitShop, units, factions }) => {
  //
  const [user, setUser] = useContext(UserContext)
  const [indexFactionSelected, setIndexFactionSelected] = useState(0)

  //
  const deleteUnit = () => {
    console.log('delete unit')
  }

  const menChange = () => {
    console.log('men change')
  }

  const handleClick = (unitCode) => {
    console.log(`clicking on unit ${unitCode}`)
  }

  const selectFaction = (factionCode) => {
    console.log(`clicking on faction ${factionCode}`)
    // if host, set the faction as selected
  }

  // RENDER
  return (
    <div className='setup-units'>
      <div className='unit-store'>
        {unitShop.map((u) => (
          <div className='unit-item' tooltip={`${u.name}\nHD per men: ${u.hdPerMen}`}>
            {u.icon ? (
              <img
                src={require(`../images/${u.icon}`)}
                onClick={() => handleClick(u.code)}
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
              if (u.faction === f.name) {
                return (
                  <div key={u.code} className='faction-unit'>
                    <div className='faction-unit-name'>
                      <div>{u.name} {u.identifier}</div>
                      <Button color='none' size='small' onClick={() => deleteUnit(u.code)}>x</Button>
                    </div>
                    <div>
                    <input
                      type='number'
                      value={u.men}
                      onChange={(e) => menChange(u.code, parseInt(e.target.value))}
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
