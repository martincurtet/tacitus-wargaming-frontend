import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../connections/socket'

import SetupFactions from './SetupFactions'
import SetupUnits from './SetupUnits.'
import SetupInitiative from './SetupInitiative'
import SetupBoard from './SetupBoard'
import Button from './Button'
import Modal from './Modal'

import '../styles/components/Setup.css'

const Setup = ({
  step, setStep,
  users, setUsers,
  factionShop, factions, setFactions,
  unitShop, units, setUnits,
  setLog
}) => {
  //
  const params = useParams()
  const [nextStepLocked, setNextStepLocked] = useState(true)

  //
  const stepTitles = {
    1: 'Factions',
    2: 'Units',
    3: 'Initiative',
    4: 'Board'
  }

  // NEXT STEP CONFIRM MODAL
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  const openNextStepModal = () => {
    setIsConfirmModalOpen(true)
  }

  const closeNextStepModal = () => {
    setIsConfirmModalOpen(false)
  }

  //
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <SetupFactions
            users={users} setUsers={setUsers}
            factionShop={factionShop} factions={factions} setFactions={setFactions}
            setLog={setLog}
          />
        )
      case 2:
        return (
          <SetupUnits
            unitShop={unitShop} units={units} setUnits={setUnits}
            factions={factions}
          />
        )
      case 3:
        return (
          <SetupInitiative
            users={users}
            units={units} setUnits={setUnits}
            factions={factions}
          />
        )
      case 4:
        return (
          <SetupBoard />
        )
      default:
        return (
          <div>Error - no step</div>
        )
    }
  }

  // const prevStep = () => {
  // }

  const nextStep = () => {
    socket.emit('next-step', { roomUuid: params.battleuuid })
    closeNextStepModal()
  }

  useEffect(() => {
    let isStepLocked = true
    switch (parseInt(step)) {
      case 1:
        // At least one faction
        isStepLocked = factions.length <= 0
        break
      case 2:
        // At least one unit
        isStepLocked = units.length <= 0
        break
      case 3:
        // All units have been assigned initiative
        let allUnitsAssigned = true
        units.forEach(u => {
          if (u.initiative === null) {
            allUnitsAssigned = false
          }
        })
        isStepLocked = !allUnitsAssigned
        break
      case 4:
        // TBD
        break
      default:
        break
    }
    setNextStepLocked(isStepLocked)
  }, [step, factions, units])

  //
  useEffect(() => {
    socket.on('step-next', (data) => {
      setUnits(data.units)
      setStep(data.step)
    })

    return () => {
      socket.off('step-next')
    }
  }, [setStep])

  // RENDER
  return (
    <div className='setup'>
      <div className='stepper'>
        {Object.entries(stepTitles).map(([id, name]) => (
          <div key={id} className={`step ${step === parseInt(id) ? 'step-bold': ''}`}>
            <span>{id}</span>
            <span>{name}</span>
          </div>
        ))}
      </div>
      <div className='setup-box'>
        <h2 className='setup-title'>{stepTitles[step]}</h2>
        {renderStepContent()}
        {/* <button onClick={prevStep}>Back</button> */}
        <div className='setup-buttons'>
          <Button
            disabled={nextStepLocked}
            onClick={openNextStepModal}
          >
            Confirm
          </Button>
          {/* <Button onClick={prevStep}>Back</Button> */}
        </div>
      </div>

      <Modal
        isOpen={isConfirmModalOpen}
        onCancel={closeNextStepModal}
        onSubmit={nextStep}
      >
        Are you sure you want to move to the next step?
      </Modal>
    </div>
  )
}

export default Setup
