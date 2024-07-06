import React, { useState } from 'react'
import Factions from './Factions'
import Button from './Button'

import '../styles/components/Setup.css'

const Setup = ({ step, users, setUsers, factionShop, factions, setFactions, setLog }) => {
  //
  const [stateStep, setStateStep] = useState(1)

  //
  const stepTitles = {
    1: 'Factions',
    2: 'Units',
    3: 'Initiative',
    4: 'Board'
  }

  const renderStepContent = () => {
    switch (stateStep) {
      case 1:
        return (
          <Factions
            users={users} setUsers={setUsers}
            factionShop={factionShop} factions={factions} setFactions={setFactions}
            setLog={setLog}
          />
        )
      case 2:
        return (
          <div>Units</div>
        )
      case 3:
        return (
          <div>Initiative</div>
        )
      case 4:
        return (
          <div>Board</div>
        )
      default:
        return (
          <div>Error - no step</div>
        )
    }
  }

  const prevStep = () => {
    setStateStep(prev => prev - 1)
  }

  const nextStep = () => {
    setStateStep(prev => prev + 1)
  }

  // RENDER
  return (
    <div className='setup'>
      <div className='stepper'>
        {Object.entries(stepTitles).map(([id, name]) => (
          <div key={id} className={`step ${stateStep === parseInt(id) ? 'step-bold': ''}`}>
            <span>{id}</span>
            <span>{name}</span>
          </div>
        ))}
      </div>
      <div className='setup-box'>
        <h2 className='setup-title'>{stepTitles[stateStep]}</h2>
        {renderStepContent()}
        {/* <button onClick={prevStep}>Back</button> */}
        <div className='setup-buttons'>
          <Button onClick={nextStep}>Confirm</Button>
          <Button onClick={prevStep}>Back</Button>
        </div>
      </div>
    </div>
  )
}

export default Setup
