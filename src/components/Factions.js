import React, { useContext, useEffect, useState } from 'react'
import Modal from './Modal'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

import Button from './Button'

import '../styles/components/Factions.css'

const Factions = ({ users, setUsers, factionShop, factions, setFactions, setLog }) => {
  const params = useParams()
  const [user, setUser] = useContext(UserContext)

  const [isAddFactionModalOpen, setIsAddFactionModalOpen] = useState(false)
  const [inputFactionCode, setInputFactionCode] = useState('')

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
    socket.emit('assign-faction', {
      roomUuid: params.battleuuid,
      userUuid: user.userUuid,
      factionCode: factionCode
    })
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
      setUsers(data.users)
      setLog(data.log)
    })

    return () => {
      socket.off('faction-added')
      socket.off('faction-removed')
      socket.off('faction-assigned')
    }
  }, [])

  return (
    <div className='factions'>
      <div className='no-faction' onClick={() => {assignFactionToUser('')}}>
        <div>Unassigned users:</div>
        {users.map(u => {
          if (u.faction === '') {
            return (
              <span><span className={`status-dot ${u.currentSocketId === '' ? 'dis' : ''}connected`}></span>{u.username} </span>
            )
          }
        })}
      </div>
      <div className='faction-list'>
        {factions.map((f, i) => (
          <div
            className='faction-item'
            style={{ borderColor: f.color }}
            onClick={() => {assignFactionToUser(f.code)}}
          >
            {f.name}
            <div className='faction-buttons'>
              <Button className='faction-remove' size='small' onClick={() => openRemoveFactionModal(i)}>x</Button>
            </div>
            <hr></hr>
            {users.map(u => {
              if (u.faction === f.code) {
                return (
                  <div className='faction-user'>
                    <span className={`status-dot ${u.currentSocketId === '' ? 'dis' : ''}connected`}></span>
                    <span>{u.username}</span>
                    <input
                      type='number'
                      min={1}
                      step={1}
                      max={5}
                    />
                  </div>
                )
              }
            })}
          </div>
        ))}
        <Button size='small' onClick={openAddFactionModal}>+</Button>
      </div>

      <Modal
        isOpen={isAddFactionModalOpen}
        onCancel={closeAddFactionModal}
        onSubmit={addFaction}
        submitText='Add'
      >
        Add faction:
        <select onChange={changeInputFactionCode}>
          <option value='' disabled selected>Select a faction</option>
          {factionShop.map(f => {
            let exists = factions.find(fa => fa.code === f.code)
            return (
            <option key={f.code} value={f.code} disabled={exists}>{f.name}</option>
          )})}
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

export default Factions
