import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../connections/socket'

import SetupFactions from './SetupFactions'
import SetupUnits from './SetupUnits.'
import Button from './Button'
import Modal from './Modal'

import '../styles/components/Setup.css'
import SetupInitiative from './SetupInitiative'

const Setup = ({
  step, setStep,
  users, setUsers,
  factionShop, factions, setFactions,
  unitShop, units, setUnits,
  setLog
}) => {
  //
  const params = useParams()

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
            units={units}
            setUnits={setUnits}
          />
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

  // const prevStep = () => {
  //   // setStateStep(prev => prev - 1)
  // }

  const nextStep = () => {
    // setStateStep(prev => prev + 1)
    socket.emit('next-step', { roomUuid: params.battleuuid })
    closeNextStepModal()
  }

  //
  useEffect(() => {
    socket.on('step-next', (data) => {
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
          <Button onClick={openNextStepModal}>Confirm</Button>
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
