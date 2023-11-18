import React, { useEffect, useState } from 'react'
import Modal from './Modal'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'

const Factions = ({ factions, setFactions }) => {
  const params = useParams()

  const [isEditFactionOn, setIsEditFactionOn] = useState(false)
  const [isAddFactionModalOpen, setIsAddFactionModalOpen] = useState(false)
  const [inputAddFaction, setInputAddFaction] = useState('')
  const [inputFactionColor, setInputFactionColor] = useState('#777777')
  const [isEditFactionModalOpen, setIsEditFactionModalOpen] = useState(false)
  const [inputEditFaction, setInputEditFaction] = useState('')
  const [isDeleteFactionModalOpen, setIsDeleteFactionModalOpen] = useState(false)
  const [selectedFactionIndex, setSelectedFactionIndex] = useState(-1)

  const toggleEditFaction = () => {
    setIsEditFactionOn(prev => !prev)
  }

  const openAddFactionModal = (i) => {
    setSelectedFactionIndex(i)
    setIsAddFactionModalOpen(true)
  }

  const closeAddFactionModal = () => {
    setSelectedFactionIndex(-1)
    setInputAddFaction('')
    setIsAddFactionModalOpen(false)
  }

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

  const changeInputAddFaction = (e) => {
    setInputAddFaction(e.target.value)
  }

  const changeInputFactionColor = (e) => {
    setInputFactionColor(e.target.value)
  }

  const addFaction = () => {
    setFactions((prev) => [...prev, { name: inputAddFaction, color: inputFactionColor }])
    setInputAddFaction('')
    setIsAddFactionModalOpen(false)
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

  useEffect(() => {
    if (factions.length !== 0 && !isAddFactionModalOpen && !isEditFactionModalOpen && !isDeleteFactionModalOpen) {
      socket.emit('update-factions', { uuid: params.battleuuid, factions: factions })
    }
  }, [isAddFactionModalOpen, isEditFactionModalOpen, isDeleteFactionModalOpen])

  useEffect(() => {
    socket.on('factions-updated', (data) => {
      console.log('factions updated')
      setFactions(data.factions)
    })

    return () => {
      socket.off('factions-updated')
    }
  }, [])

  return (
    <div>
      <button onClick={toggleEditFaction}>Toggle Edit Factions</button>
      {isEditFactionOn? (<button onClick={openAddFactionModal}>Add Faction</button>) : null}
      <div className='faction-list'>
      {factions.map((f, i) => (
        <div className='faction-item' key={i}>
          {f.icon ? (
            <img src={require(`../images/${f.icon}`)} alt='' height={18} width={30} />
          ) : null}
          <p style={{ color: f.color }}>{f.name}</p>
          {isEditFactionOn ? (
            <>
              <button onClick={() => openEditFactionModal(i)}>Edit</button>
              <button onClick={() => openDeleteFactionModal(i)}>Delete</button>
            </>
          ) : null}
        </div>
      ))}
      </div>
      <Modal
        isOpen={isAddFactionModalOpen}
        onCancel={closeAddFactionModal}
        onSubmit={addFaction}
      >
        Add faction:
        <input type='text' value={inputAddFaction} onChange={changeInputAddFaction} />
        <input type='color' value={inputFactionColor} onChange={changeInputFactionColor} />
      </Modal>
  
      <Modal
        isOpen={isEditFactionModalOpen}
        onCancel={closeEditFactionModal}
        onSubmit={editFaction}
      >
        Edit faction:
        <input type='text' value={inputEditFaction} onChange={changeInputEditFaction} />
        <input type='color' value={inputFactionColor} onChange={changeInputFactionColor} />
      </Modal>

      <Modal
        isOpen={isDeleteFactionModalOpen}
        onCancel={closeDeleteFactionModal}
        onSubmit={deleteFaction}
      >
        Are you sure you want to delete "{factions[selectedFactionIndex]?.name}"?
      </Modal>
    </div>
  )
}

export default Factions
