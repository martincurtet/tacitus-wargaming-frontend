import React, { useState } from 'react'
import Modal from './Modal'
import '../styles/components/Tracker.css'

const Tracker = ({ factions, setFactions }) => {
  const [isAddFactionModalOpen, setIsAddFactionModalOpen] = useState(false)
  const [inputAddFaction, setInputAddFaction] = useState('')
  const [inputFactionColor, setInputFactionColor] = useState('#777777')
  const [isEditFactionModalOpen, setIsEditFactionModalOpen] = useState(false)
  const [inputEditFaction, setInputEditFaction] = useState('')
  const [isDeleteFactionModalOpen, setIsDeleteFactionModalOpen] = useState(false)
  const [selectedFactionIndex, setSelectedFactionIndex] = useState(-1)

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

  return (
    <div>
      <button onClick={openAddFactionModal}>Add Faction</button>
      <div className='faction-list'>
      {factions.map((f, i) => (
        <div className='faction-item' key={i}>
          <p style={{ color: f.color }}>{f.name}</p>
          <button onClick={() => openEditFactionModal(i)}>Edit</button>
          <button onClick={() => openDeleteFactionModal(i)}>Delete</button>
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

export default Tracker
