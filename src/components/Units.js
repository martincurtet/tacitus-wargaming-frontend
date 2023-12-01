import React, { useEffect, useState } from 'react'
import Modal from './Modal'

import { DndContext } from '@dnd-kit/core'
import Draggable from './dndComponents/Draggable'
import Droppable from './dndComponents/Droppable'

import '../styles/components/Units.css'

const Units = ({ factions, unitShop, units, setUnits }) => {
  const [isUnitManagerModalOpen, setIsUnitManagerModalOpen] = useState(false)
  const [unitManagerUnits, setUnitManagerUnits] = useState([])

  const veterancies = [
    { id: 0, name: 'Militia', icon: require('../images/militia.png'), next: 1 },
    { id: 1, name: 'Normal', icon: require('../images/normal.png'), next: 2 },
    { id: 2, name: 'Veteran', icon: require('../images/veteran.png'), next: 3 },
    { id: 3, name: 'Elite', icon: require('../images/elite.png'), next: 0 }
  ]

  const openUnitManagerModal = () => {
    setIsUnitManagerModalOpen(true)
  }
  
  const closeUnitManagerModal = () => {
    setIsUnitManagerModalOpen(false)
  }

  const submitUnitManagerModal = () => {
    setUnits(unitManagerUnits)
    closeUnitManagerModal()
  }

  const handleDragEnd = (e) => {
    const { over } = e
    if (over === null) return
    addUnitToFaction(e.active.id, over.id)
  }

  const addUnitToFaction = (unitCode, factionCode) => {
    console.log(`Unit ${unitCode} added to faction ${factionCode}`)
    let hdPerMen = unitShop.find(u => u.code === unitCode).hdPerMen
    setUnitManagerUnits(prev => {
      return [
        ...prev,
        {
          code: `${factionCode}-${unitCode}-0`,
          name: unitShop.find(u => u.code === unitCode).name,
          veterancy: '0',
          identifier: '', // check if faction+veterancy+unit already exists
          faction: factions.find(f => f.code === factionCode).name,
          men: '20', // default value?
          hdPerMen: hdPerMen,
          maxHd: parseInt(hdPerMen) * 20,
          hd: parseInt(hdPerMen) * 20,
          casualties: '0',
          fatigue: '0',
          notes: ''
        },
      ]
    })
  }

  const veterancyChange = (unitCode) => {
    let unit = unitManagerUnits.find(u => u.code === unitCode)
    setUnitManagerUnits(prev => {
      return prev.map(u => {
        if (u.code === unitCode) {
          return {
            ...u,
            code: '', // update third code item
            veterancy: veterancies[unit.veterancy].next
          }
        }
        return u
      })
    })
  }

  const menChange = (code, men) => {
    console.log(code, men)
    setUnitManagerUnits((prev) =>
      prev.map((u) =>
        u.code === code ? {...u, men: men, maxHd: men * u.hdPerMen, hd: men * u.hdPerMen } : u
      )
    )
  }

  useEffect(() => {
    setUnitManagerUnits(units)
    console.log(units)
  }, [units])

  return (
    <div>
      <button onClick={openUnitManagerModal}>Unit Manager</button>
      <div>
      {units.map((u, i) => (
        <div key={u.code}>
          {/* indicate faction by icon */}
          <p>
            <img src={require(`../images/${factions.find(f => f.name === u.faction).icon}`)} alt='' height={18} width={30} />
            {veterancies[u.veterancy].name} {u.name} {u.men} men
            <input className='small-input' type='number' value={u.hd} /> / {u.maxHd}
            <input className='small-input' type='number' value={u.casualties} /> casualties
            <input className='small-input' type='number' value={u.fatigue} /> fatigue
            <textarea>{u.notes}</textarea>
          </p>
        </div>
      ))}
      </div>

      <Modal
        isOpen={isUnitManagerModalOpen}
        onCancel={closeUnitManagerModal}
        onSubmit={submitUnitManagerModal}
       >
        <DndContext onDragEnd={handleDragEnd}>
          <div className='unit-store'>
            {unitShop.map((u) => (
              <Draggable id={u.code} key={u.code}>
                <div className='unit-item' tooltip={`${u.name}\nHD per men: ${u.hdPerMen}`}>
                  {u.icon ? (
                    <img src={require(`../images/${u.icon}`)} alt='' height={32} width={32} />
                  ) : null}
                </div>
              </Draggable>
            ))}
          </div>
          <div className='faction-panels'>
            {factions.map((f) => (
              <Droppable key={f.code} id={f.code}>
                <div className='faction-panel'>
                  <div className='faction-panel-title'>{f.name}</div>
                  {unitManagerUnits.map((u) => {
                    if (u.faction === f.name) {
                      return (
                        // <Draggable id={`${f.name}${u.name}`} key={u.name}>
                        <div key={u.code} className='faction-unit'>
                          <button onClick={() => veterancyChange(u.code)}>
                            <img src={veterancies[u.veterancy].icon} height={16} width={16} />
                          </button>
                          {veterancies[u.veterancy].name} {u.name} {u.identifier} {u.id}
                          <div>
                          <input
                            type='number'
                            value={u.men}
                            onChange={(e) => menChange(u.code, parseInt(e.target.value))}
                          /> men {u.maxHd} HD</div>
                        </div>
                        // </Draggable>
                      )
                    }
                  })}
                </div>
              </Droppable>
            ))}
          </div>
        </DndContext>
      </Modal>
    </div>
  )
}

export default Units
