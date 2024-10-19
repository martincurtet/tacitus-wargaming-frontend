import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../connections/socket'
import { UserContext } from '../context/UserContext'

import SetupFactions from './SetupFactions'
import SetupUnits from './SetupUnits.'
import SetupInitiative from './SetupInitiative'
import SetupBoard from './SetupBoard'
import Button from './Button'
import Modal from './Modal'

import '../styles/components/Setup.css'

const Setup = ({
  step, setStep,
  board, setBoard,
  boardSize, setBoardSize,
  users, setUsers,
  factionShop, factions, setFactions,
  unitShop, units, setUnits,
  setLog
}) => {
  //
  const params = useParams()
  const [user, setUser] = useContext(UserContext)
  const [nextStepLocked, setNextStepLocked] = useState(true)
  const [stepLockDescription, setStepLockDescription] = useState('test')

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
            setLog={setLog}
          />
        )
      case 4:
        return (
          <SetupBoard
            board={board} setBoard={setBoard}
            boardSize={boardSize} setBoardSize={setBoardSize}
            factions={factions}
            units={units} setUnits={setUnits}
            setLog={setLog}
          />
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
    let stepDescription = ''
    if (user.isHost) {
      switch (parseInt(step)) {
        case 1:
          // At least one faction
          isStepLocked = factions.length <= 0
          stepDescription = 'Add at least one faction'
          break
        case 2:
          // At least one unit
          isStepLocked = units.length <= 0
          stepDescription = 'Add at least one unit'
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
          stepDescription = 'All units have been assigned initiative'
          break
        case 4:
          // All units have been placed on the map
          let allUnitsPlaced = true
          units.forEach(u => {
            if (u.coordinates === '') {
              allUnitsPlaced = false
            }
          })
          isStepLocked = !allUnitsPlaced
          stepDescription = 'All units have been placed'
          break
        default:
          break
      }
      setNextStepLocked(isStepLocked)
      setStepLockDescription(stepDescription)
    }
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
      <div className='setup-main'>
        <div className='setup-left'>Users
          {users.map(u => (
            <div key={u.userUuid} style={{ color: u.userColor }}><span className={`status-dot ${u.currentSocketId === '' ? 'dis' : ''}connected`}></span>{u.username} </div>
          ))}
        </div>
        <div className='setup-box'>
          <h2 className='setup-title'>{stepTitles[step]}</h2>
          {renderStepContent()}
          {/* <button onClick={prevStep}>Back</button> */}
          {/* <div className='setup-buttons'>
            <Button
              disabled={nextStepLocked}
              onClick={openNextStepModal}
            >
              Confirm
            </Button>
            <Button onClick={prevStep}>Back</Button>
          </div> */}
        </div>
        <div className='setup-right'>
          {nextStepLocked && <p>{stepLockDescription}</p>}
          <Button
            disabled={nextStepLocked}
            onClick={openNextStepModal}
          >
            Confirm
          </Button>
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
