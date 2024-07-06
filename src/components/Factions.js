import React, { useEffect, useState } from 'react'
import Modal from './Modal'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import '../styles/components/Factions.css'
import Button from './Button'

const Factions = ({ users, factionShop, factions, setFactions, setLog }) => {
  const params = useParams()

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
    console.log(`changing to ${e.target.value}`)
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

  useEffect(() => {
    socket.on('faction-added', (data) => {
      setFactions(data.factions)
      setLog(data.log)
    })
    socket.on('faction-removed', (data) => {
      setFactions(data.factions)
      setLog(data.log)
    })

    return () => {
      socket.off('faction-added')
      socket.off('faction-removed')
    }
  }, [])

  return (
    <div className='factions'>
      <div className='no-faction' onClick={() => {console.log(`clicked on no faction`)}}>
        <div>Unassigned users:</div>
        {users.map(u => {
          if (u.faction === '') {
            return (
              <span>{u.username}</span>
            )
          }
        })}
      </div>
      <div className='faction-list'>
        {factions.map((f, i) => (
          <div
            className='faction-item'
            style={{ borderColor: f.color }}
            onClick={() => {console.log(`clicked on faction ${f.name}`)}}
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
                    {u.username}
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
