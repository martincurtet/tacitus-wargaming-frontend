import React, { useEffect, useState } from 'react'
import Modal from './Modal'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { debounce } from '../functions/functions'

import { DndContext } from '@dnd-kit/core'
import Draggable from './dndComponents/Draggable'
import Droppable from './dndComponents/Droppable'

import '../styles/components/Units.css'

const Units = ({ setLog, setBoard, factions, unitShop, units, setUnits }) => {
  // TODO move stuff to tracker

  //
  const params = useParams()

  // UNIT MANAGER VARIABLES
  const [isUnitManagerModalOpen, setIsUnitManagerModalOpen] = useState(false)
  const [unitManagerUnits, setUnitManagerUnits] = useState([])

  // const veterancies = [
  //   { id: 0, name: 'Militia', icon: require('../images/militia.png'), next: 1 },
  //   { id: 1, name: 'Normal', icon: require('../images/normal.png'), next: 2 },
  //   { id: 2, name: 'Veteran', icon: require('../images/veteran.png'), next: 3 },
  //   { id: 3, name: 'Elite', icon: require('../images/elite.png'), next: 0 }
  // ]

  const openUnitManagerModal = () => {
    setIsUnitManagerModalOpen(true)
  }
  
  const closeUnitManagerModal = () => {
    setIsUnitManagerModalOpen(false)
  }

  const cancelUnitManagerModal = () => {
    setUnitManagerUnits(units)
    closeUnitManagerModal()
  }

  const submitUnitManagerModal = () => {
    socket.emit('update-units', { uuid: params.battleuuid, units: unitManagerUnits })
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
      let currentFaction = factions.find(f => f.code === factionCode)
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
          maxHd: parseInt(currentUnit.hdPerMen) * 20,
          hd: parseInt(currentUnit.hdPerMen) * 20,
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
        u.code === code ? {...u, men: men, maxHd: men * u.hdPerMen, hd: men * u.hdPerMen } : u
      )
    )
  }

  const hdChange = (code, hd) => {
    console.log(code, hd)
    // min max values of hd
    // DONT UPDATE UNIT, SEND CHANGE
    // setUnits((prev) =>
    //   prev.map((u) =>
    //     u.code === code ? {...u, hd: hd } : u
    //   )
    // )
    let tempUnit = units.find(u => u.code === code)
    tempUnit.hd = hd
    unitInformationChange(code, tempUnit)
  }

  const casualtiesChange = (code, casualties) => {
    console.log(code, casualties)
    // DONT UPDATE UNIT, SEND CHANGE
    // setUnits((prev) =>
    //   prev.map((u) =>
    //     u.code === code ? {...u, casualties: casualties } : u
    //   )
    // )
    let tempUnit = units.find(u => u.code === code)
    tempUnit.casualties = casualties
    unitInformationChange(code, tempUnit)
  }

  const fatigueChange = (code, fatigue) => {
    console.log(code, fatigue)
    // DONT UPDATE UNIT, SEND CHANGE
    // setUnits((prev) =>
    //   prev.map((u) =>
    //     u.code === code ? {...u, fatigue: fatigue } : u
    //   )
    // )
    let tempUnit = units.find(u => u.code === code)
    tempUnit.fatigue = fatigue
    unitInformationChange(code, tempUnit)
  }

  const notesChange = (code, notes) => {
    let tempUnit = units.find(u => u.code === code)
    tempUnit.notes = notes
    unitInformationChange(code, tempUnit)
  }

  const dbNotesChange = debounce(notesChange, 1000)

  const debouncedNotesChange = (code, notes) => {
    dbNotesChange(code, notes)
  }

  const unitInformationChange = (unitCode, unitData) => {
    socket.emit('update-unit', { uuid: params.battleuuid, unitCode: unitCode, unitData: unitData })
  }

  useEffect(() => {
    setUnitManagerUnits(units)
  }, [units])

  useEffect(() => {
    socket.on('units-updated', (data) => {
      setUnits(data.units)
      setBoard(data.board)
      setLog(data.log)
    })

    socket.on('unit-updated', (data) => {
      setUnits(data.units)
      setLog(data.log)
    })

    return () => {
      socket.off('units-updated')
      socket.off('unit-updated')
    }
  }, [])

  return (
    <div>
      <button onClick={openUnitManagerModal}>Unit Manager</button>
      <div>
      {units.map((u, i) => (
        <div key={u.code}>
          {/* indicate faction by icon */}
          <p>
            <img src={require(`../images/${factions.find(f => f.name === u.faction).icon}`)} alt='' height={18} width={30} />
            {/* {veterancies[u.veterancy].name} */}
            {u.name} {u.identifier} {u.men} men
            <input
              className='small-input'
              type='number'
              value={u.hd}
              onChange={(e) => hdChange(u.code, e.target.value)}
              min={0}
              max={u.maxHd}
              step={1}
            /> / {u.maxHd} HD
            <input
              className='small-input'
              type='number'
              value={u.casualties}
              onChange={(e) => casualtiesChange(u.code, e.target.value)}
              min={0}
              max={u.men}
              step={1}
            /> casualties
            <input
              className='small-input'
              type='number'
              value={u.fatigue}
              onChange={(e) => fatigueChange(u.code, e.target.value)}
              min={0}
              max={10}
              step={1}
            /> fatigue
            <textarea
              onChange={(e) => debouncedNotesChange(u.code, e.target.value)}
            >
              {u.notes}
            </textarea>
          </p>
        </div>
      ))}
      </div>

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
                          {/* <button onClick={() => veterancyChange(u.code)}> */}
                            {/* <img src={veterancies[u.veterancy].icon} height={16} width={16} /> */}
                          {/* </button> */}
                          {u.name} {u.identifier}
                          <div>
                          <input
                            type='number'
                            value={u.men}
                            onChange={(e) => menChange(u.code, parseInt(e.target.value))}
                          /> men {u.maxHd} HD <button>x</button></div>
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
