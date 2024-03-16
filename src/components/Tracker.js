import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../connections/socket'
import Modal from './Modal'
import Units from './Units'
import Button from './Button'

import { DndContext } from '@dnd-kit/core'
import Draggable from './dndComponents/Draggable'
import Droppable from './dndComponents/Droppable'

import '../styles/components/Tracker.css'

const Tracker = ({
    setBoard,
    factionShop, setFactionShop,
    factions, setFactions,
    unitShop,
    units, setUnits,
    setLog
  }) => {

  //
  const params = useParams()

  // FACTIONS
  const [selectedFaction, setSelectedFaction] = useState([])
  const [unitManagerFactions, setUnitManagerFactions] = useState([])

  // UNIT MANAGER VARIABLES
  const [isUnitManagerModalOpen, setIsUnitManagerModalOpen] = useState(false)
  const [unitManagerUnits, setUnitManagerUnits] = useState([])

  // UNIT MANAGER FUNCTIONS
  const openUnitManagerModal = () => {
    setIsUnitManagerModalOpen(true)
  }
  
  const closeUnitManagerModal = () => {
    setIsUnitManagerModalOpen(false)
  }

  const cancelUnitManagerModal = () => {
    setUnitManagerUnits(units)
    setUnitManagerFactions(factions)
    closeUnitManagerModal()
  }

  const submitUnitManagerModal = () => {
    socket.emit('update-factions-units', { uuid: params.battleuuid, factions: unitManagerFactions, units: unitManagerUnits })
    // socket.emit('update-factions', { uuid: params.battleuuid, factions: unitManagerFactions })
    // socket.emit('update-units', { uuid: params.battleuuid, units: unitManagerUnits })
    closeUnitManagerModal()
  }

  const handleDragEnd = (e) => {
    const { over } = e
    if (over === null) return
    addUnitToFaction(e.active.id, over.id)
  }

  const addUnitToFaction = (unitCode, factionCode) => {
    let duplicateUnits = unitManagerUnits.filter(
      u => u.code.split('-').slice(0, 2).join('-') === `${factionCode}-${unitCode}`
    )

    let code = `${factionCode}-${unitCode}`
    let identifier = ''
    if (duplicateUnits.length === 1) {
      // add A to this unit
      setUnitManagerUnits((prev) =>
        prev.map((u) =>
          u.code === `${factionCode}-${unitCode}` ? {...u, code: `${u.code}-A`, identifier: 'A' } : u
        )
      )
      // add B to the other one
      code = `${code}-B`
      identifier = 'B'
    } else if (duplicateUnits.length > 1) {
      // order the array
      duplicateUnits.sort((a, b) => {
        if (a.identifier < b.identifier) return -1
        if (a.identifier > b.identifier) return 1
        return 0
      })
      // find last id and get next one
      let lastIdentifier = duplicateUnits[duplicateUnits.length - 1].identifier
      identifier = String.fromCharCode(lastIdentifier.charCodeAt(0) + 1)
      code = `${code}-${identifier}`
    }

    setUnitManagerUnits(prev => {
      let currentUnit = unitShop.find(u => u.code === unitCode)
      let currentFaction = factionShop.find(f => f.code === factionCode)
      return [
        ...prev,
        {
          code: code,
          name: currentUnit.name,
          veterancy: currentUnit.veterancy,
          identifier: identifier,
          faction: currentFaction.name,
          icon: currentUnit.icon,
          men: '20', // default value?
          hdPerMen: currentUnit.hdPerMen,
          maxHd: (parseInt(currentUnit.hdPerMen) * 20).toString(),
          hd: (parseInt(currentUnit.hdPerMen) * 20).toString(),
          casualties: '0',
          fatigue: '0',
          notes: ''
        },
      ]
    })
  }

  const menChange = (code, men) => {
    // console.log(code, men)
    setUnitManagerUnits((prev) =>
      prev.map((u) =>
        u.code === code ? {...u, men: men.toString(), maxHd: (men * u.hdPerMen).toString(), hd: (men * u.hdPerMen).toString() } : u
      )
    )
  }

  useEffect(() => {
    setUnitManagerUnits(units)
  }, [units])

  useEffect(() => {
    // socket.on('units-updated', (data) => {
    //   setUnits(data.units)
    //   setBoard(data.board)
    //   setLog(data.log)
    // })

    // socket.on('factions-updated', (data) => {
    //   setFactions(data.factions)
    //   setLog(data.log)
    // })

    socket.on('factions-units-updated', (data) => {
      setFactions(data.factions)
      setUnits(data.units)
      setBoard(data.board)
      setLog(data.log)
    })

    return () => {
      // socket.off('units-updated')
      // socket.off('factions-updated')
      socket.off('factions-units-updated')
    }
  }, [])

  const handleSelectFaction = (e) => {
    setSelectedFaction(e.target.value)
  }

  const addFaction = () => {
    const newFaction = factionShop.find(f => f.code == selectedFaction)
    let existingFaction = (unitManagerFactions.find(f => f.code == newFaction.code))
    if (existingFaction !== undefined) return
    setUnitManagerFactions((prev) => [...prev, newFaction])
  }

  const deleteFaction = (code) => {
    setUnitManagerFactions(unitManagerFactions.filter(f => f.code !== code))
  }

  const deleteUnit = (code) => {
    setUnitManagerUnits(unitManagerUnits.filter(u => u.code !== code))
  }

  return (
    <div className='tracker'>
      {/* <Factions
        factionShop={factionShop}
        factions={factions} setFactions={setFactions}
        setLog={setLog}
      /> */}
      <div className='tracker-toolbar'>
        <Button color='beige' onClick={openUnitManagerModal}>Unit Manager</Button>
      </div>
      <Units
        setLog={setLog}
        factions={factions}
        units={units}
        setUnits={setUnits}
      />
    
      <Modal
        isOpen={isUnitManagerModalOpen}
        onCancel={cancelUnitManagerModal}
        onSubmit={submitUnitManagerModal}
       >
        <DndContext onDragEnd={handleDragEnd}>
          <div className='unit-store'>
            {unitShop.map((u) => (
              <Draggable id={u.code} key={u.code}>
                <div className='unit-item' tooltip={`${u.name}\nHD per men: ${u.hdPerMen}`}>
                  {u.icon ? (
                    <img src={require(`../images/${u.icon}`)} alt='' height={48} width={48} />
                  ) : null}
                </div>
              </Draggable>
            ))}
          </div>

          <div className='faction-add-buttons'>
          <select onChange={handleSelectFaction}>
            <option disabled selected value>Choose a faction</option>
            {factionShop.map((f) =>
              <option value={f.code} key={f.code}>{f.name}</option>
            )}
          </select>
          <Button color='beige' onClick={addFaction}>Add</Button>
          </div>

          <div className='faction-panels'>
            {unitManagerFactions.map((f) => (
              <Droppable key={f.code} id={f.code}>
                <div className='faction-panel'>
                  <div className='faction-panel-title'>
                    <img src={require(`../images/${f.icon}`)} alt='' height={18} width={30} />
                    {f.name}
                    <Button
                      color='none'
                      size='small'
                      onClick={() => deleteFaction(f.code)}
                    >X</Button>
                  </div>
                  {unitManagerUnits.map((u) => {
                    if (u.faction === f.name) {
                      return (
                        // <Draggable id={`${f.name}${u.name}`} key={u.name}>
                        <div key={u.code} className='faction-unit'>
                          <div className='faction-unit-name'>
                            <div>{u.name} {u.identifier}</div>
                            <Button color='none' size='small' onClick={() => deleteUnit(u.code)}>x</Button>
                          </div>
                          <div>
                          <input
                            type='number'
                            value={u.men}
                            onChange={(e) => menChange(u.code, parseInt(e.target.value))}
                          /> men {u.maxHd} HD </div>
                        </div>
                        // </Draggable>
                      )
                    }
                  })}
                </div>
              </Droppable>
            ))}
          </div>
          {/* <button>Add a faction</button>
          <select>
            {factionShop.map((f) => (
              <option>{f.name}</option>
            ))}
          </select> */}
        </DndContext>
      </Modal>
    </div>
  )
}

export default Tracker
