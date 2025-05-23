import React, { useContext, useEffect, useState } from 'react'
import Modal from './Modal'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

import Button from './Button'

import '../styles/components/SetupFactions.css'

const SetupFactions = ({ users, setUsers, factionShop, factions, setFactions, setLog }) => {
  const params = useParams()
  const [user, setUser] = useContext(UserContext)

  const [isAddFactionModalOpen, setIsAddFactionModalOpen] = useState(false)
  const [inputFactionCode, setInputFactionCode] = useState('')

  const [inputStratAbility, setInputStratAbility] = useState({})

  const [isRemoveFactionModalOpen, setIsRemoveFactionModalOpen] = useState(false)
  const [selectedFactionIndex, setSelectedFactionIndex] = useState(-1)

  // ADD FACTION MODAL
  const openAddFactionModal = () => {
    setIsAddFactionModalOpen(true)
  }

  const closeAddFactionModal = () => {
    setIsAddFactionModalOpen(false)
  }

  const changeInputFactionCode = (e) => {
    setInputFactionCode(e.target.value)
  }

  const addFaction = () => {
    if (inputFactionCode !== '') {
      let exists = factions.find(f => f.code === inputFactionCode)
      if (!exists) {
        socket.emit('add-faction', {
          roomUuid: params.battleuuid,
          factionCode: inputFactionCode,
        })
        closeAddFactionModal()
      }
    }
  }

  // CHANGE USER STRAT ABILITY
  const handleInputStratAbility = (value, userUuid) => {
    const stratAbility = parseInt(value, 10)
    if (!isNaN(stratAbility) && stratAbility >= 0 && stratAbility <= 5) {
      socket.emit('change-strat-ability', {
        roomUuid: params.battleuuid,
        userUuid: userUuid,
        stratAbility: value
      })
    }
  }

  // REMOVE FACTION
  const openRemoveFactionModal = (i) => {
    setSelectedFactionIndex(i)
    setIsRemoveFactionModalOpen(true)
  }

  const closeRemoveFactionModal = () => {
    setSelectedFactionIndex(-1)
    setIsRemoveFactionModalOpen(false)
  }

  const removeFaction = () => {
    socket.emit('remove-faction', {
      roomUuid: params.battleuuid,
      factionCode: factions[selectedFactionIndex].code,
    })
    closeRemoveFactionModal()
  }

  // ASSIGN FACTION TO USERS
  const assignFactionToUser = (factionCode) => {
    if (user.userFaction !== factionCode) {
      socket.emit('assign-faction', {
        roomUuid: params.battleuuid,
        userUuid: user.userUuid,
        factionCode: factionCode
      })
    }
  }

  useEffect(() => {
    socket.on('faction-added', (data) => {
      setFactions(data.factions)
      setLog(data.log)
    })

    socket.on('faction-removed', (data) => {
      setUsers(data.users)
      setFactions(data.factions)
      setLog(data.log)
    })

    socket.on('faction-assigned', (data) => {
      let assignedUser = data.users.find(u => u.userUuid === user.userUuid)
      setUser({
        ...user,
        userFaction: assignedUser.faction,
        isSpectator: assignedUser.faction === ''
      })
      setUsers(data.users)
      setFactions(data.factions)
      setLog(data.log)
      setInputStratAbility(() => {
        const initialState = {}
        data.users.forEach(u => {
          initialState[u.userUuid] = parseInt(u.stratAbility) || 0
        })
        return initialState
      })
    })

    socket.on('strat-ability-changed', (data) => {
      setUsers(data.users)
      setFactions(data.factions)
      setLog(data.log)
      setInputStratAbility(() => {
        const initialState = {}
        data.users.forEach(u => {
          initialState[u.userUuid] = parseInt(u.stratAbility) || 0
        })
        return initialState
      })
    })

    return () => {
      socket.off('faction-added')
      socket.off('faction-removed')
      socket.off('faction-assigned')
      socket.off('strat-ability-changed')
    }
  }, [setFactions, setLog, setUser, setUsers, user])

  return (
    <div className='setup-factions'>
      <div className='no-faction' onClick={() => {assignFactionToUser('')}}>
        <div>Unassigned users:</div>
        {users.map(u => {
          if (u.faction === '') {
            return (
              <span key={u.userUuid} style={{ color: u.userColor }}><span className={`status-dot ${u.currentSocketId === '' ? 'dis' : ''}connected`}></span>{u.username} </span>
            )
          } else { return null }
        })}
      </div>
      <div className='faction-list'>
        {factions.map((f, i) => (
          <div
            key={f.code}
            className='faction-item'
            style={{ borderColor: f.color }}
            onClick={() => {assignFactionToUser(f.code)}}
          >
            {f.name} ({f.stratAbility})
            <div className='faction-buttons'>
              <Button className='faction-remove' size='small' onClick={() => openRemoveFactionModal(i)}>x</Button>
            </div>
            <hr></hr>
            {users.map(u => {
              if (u.faction === f.code) {
                return (
                  <div className='faction-user' key={u.userUuid}>
                    <span className={`status-dot ${u.currentSocketId === '' ? 'dis' : ''}connected`}></span>
                    <span>{u.username}</span>
                    <input
                      disabled={u.userUuid !== user.userUuid}
                      type='number'
                      value={inputStratAbility[u.userUuid] || 0}
                      onChange={e => handleInputStratAbility(e.target.value, u.userUuid)}
                      min={1}
                      step={1}
                      max={5}
                    />
                  </div>
                )
              } else {
                return null
              }
            })}
          </div>
        ))}
        {factions.length < 4 && (
          <Button size='small' onClick={openAddFactionModal}>Add a faction</Button>
        )}
      </div>

      <Modal
        isOpen={isAddFactionModalOpen}
        onCancel={closeAddFactionModal}
        onSubmit={addFaction}
        submitText='Add'
      >
        Add faction:
        <select
          onChange={changeInputFactionCode}
          defaultValue={'DEFAULT'}
        >
          <option value='DEFAULT' disabled>Select a faction</option>
          {factionShop.map(f => {
            let exists = factions.find(fa => fa.code === f.code)
            return (
              <option key={f.code} value={f.code} disabled={exists}>{f.name}</option>
            )
          })}
        </select>
      </Modal>
  
      <Modal
        isOpen={isRemoveFactionModalOpen}
        onCancel={closeRemoveFactionModal}
        onSubmit={removeFaction}
        submitColor='red'
        submitText='Remove'
      >
        Are you sure you want to remove "{factions[selectedFactionIndex]?.name}"?
      </Modal>
    </div>
  )
}

export default SetupFactions
