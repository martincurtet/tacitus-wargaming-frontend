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

  const [inputFactionColor, setInputFactionColor] = useState('#777777')
  const [isEditFactionModalOpen, setIsEditFactionModalOpen] = useState(false)
  const [inputEditFaction, setInputEditFaction] = useState('')
  const [isDeleteFactionModalOpen, setIsDeleteFactionModalOpen] = useState(false)
  const [selectedFactionIndex, setSelectedFactionIndex] = useState(-1)

  // ADD FACTION MODAL
  const openAddFactionModal = (i) => {
    setSelectedFactionIndex(i)
    setIsAddFactionModalOpen(true)
  }

  const closeAddFactionModal = () => {
    setSelectedFactionIndex(-1)
    setIsAddFactionModalOpen(false)
  }

  const changeInputFactionCode = (e) => {
    console.log(`changing to ${e.target.value}`)
    setInputFactionCode(e.target.value)
  }

  const addFaction = () => {
    if (inputFactionCode !== '') {
      socket.emit('add-faction', {
        roomUuid: params.battleuuid,
        factionCode: inputFactionCode,
      })
      setIsAddFactionModalOpen(false)
    }
  }

  // EDIT FACTION
  const openEditFactionModal = (i) => {
    setSelectedFactionIndex(i)
    setInputEditFaction(factions[i].name)
    setInputFactionColor(factions[i].color)
    setIsEditFactionModalOpen(true)
  }

  const closeEditFactionModal = () => {
    setSelectedFactionIndex(-1)
    setInputEditFaction('')
    setInputFactionColor('#777777')
    setIsEditFactionModalOpen(false)
  }

  const openDeleteFactionModal = (i) => {
    setSelectedFactionIndex(i)
    setIsDeleteFactionModalOpen(true)
  }

  const closeDeleteFactionModal = () => {
    setSelectedFactionIndex(-1)
    setIsDeleteFactionModalOpen(false)
  }

  const changeInputFactionColor = (e) => {
    setInputFactionColor(e.target.value)
  }

  const changeInputEditFaction = (e) => {
    setInputEditFaction(e.target.value)
  }

  const editFaction = () => {
    setFactions((prev) => {
      const tempArray = [...prev]
      tempArray[selectedFactionIndex] = { name: inputEditFaction, color: inputFactionColor }
      return tempArray
    })
    setInputEditFaction('')
    setIsEditFactionModalOpen(false)
  }

  const deleteFaction = () => {
    setFactions(factions.filter((f, i) => i !== selectedFactionIndex))
    setIsDeleteFactionModalOpen(false)
  }

  // useEffect(() => {
  //   if (factions.length !== 0 && !isAddFactionModalOpen && !isEditFactionModalOpen && !isDeleteFactionModalOpen) {
  //     socket.emit('update-factions', { uuid: params.battleuuid, factions: factions })
  //   }
  // }, [isAddFactionModalOpen, isEditFactionModalOpen, isDeleteFactionModalOpen])

  useEffect(() => {
    socket.on('faction-added', (data) => {
      setFactions(data.factions)
      setLog(data.log)
    })

    return () => {
      socket.off('faction-added')
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
            onMouseEnter={() => { console.log(`enter ${f.name}`) }}
            onMouseLeave={() => { console.log(`leave ${f.name}`) }}
          >
            {f.name}
            <div className='faction-buttons'>
              <Button className='faction-edit' size='small' onClick={() => openEditFactionModal(i)}>/</Button>
              <Button className='faction-delete' size='small' onClick={() => openDeleteFactionModal(i)}>x</Button>
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
      >
        Add faction:
        <select onChange={changeInputFactionCode}>
          <option value='' disabled selected>Select a faction</option>
          {factionShop.map(f => (
            <option key={f.code} value={f.code}>{f.name}</option>
          ))}
        </select>
      </Modal>
  
      <Modal
        isOpen={isEditFactionModalOpen}
        onCancel={closeEditFactionModal}
        // onSubmit={editFaction}
        onSubmit={() => {}}
      >
        Edit faction:
        <input type='text' value={inputEditFaction} onChange={changeInputEditFaction} />
        <input type='color' value={inputFactionColor} onChange={changeInputFactionColor} />
      </Modal>

      <Modal
        isOpen={isDeleteFactionModalOpen}
        onCancel={closeDeleteFactionModal}
        // onSubmit={deleteFaction}
        onSubmit={() => {}}
      >
        Are you sure you want to delete "{factions[selectedFactionIndex]?.name}"?
      </Modal>
    </div>
  )
}

export default Factions
