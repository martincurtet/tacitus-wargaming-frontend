import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../connections/socket'
import { UserContext } from '../context/UserContext'
import Button from './Button'
import Modal from './Modal'

import '../styles/components/SetupUnits.css'

const SetupUnits = ({ unitShop, units, setUnits, factions, registerBulkAdditionHandler }) => {
  const params = useParams()
  const [user, setUser] = useContext(UserContext)
  const [indexFactionSelected, setIndexFactionSelected] = useState(user.isHost ? 0 : -1)
  const [inputMen, setInputMen] = useState({})
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [bulkInput, setBulkInput] = useState('')
  const [bulkError, setBulkError] = useState('')

  const DEFAULT_MEN_VALUE = Number(process.env.DEFAULT_MEN_VALUE) || 20

  const validFactionCodes = useMemo(() => factions.map(f => f.code.toUpperCase()), [factions])
  const validUnitCodes = useMemo(() => unitShop.map(u => u.code.toUpperCase()), [unitShop])
  const existingFactionCounts = useMemo(() => {
    return units.reduce((accumulator, unit) => {
      const factionCode = (unit.factionCode || '').toUpperCase()
      if (factionCode !== '') {
        accumulator[factionCode] = (accumulator[factionCode] || 0) + 1
      }
      return accumulator
    }, {})
  }, [units])

  const buildInputMenMap = useCallback((unitsData) => {
    const map = {}
    unitsData.forEach((unit) => {
      map[`${unit.factionCode}-${unit.unitCode}-${unit.identifier}`] = parseInt(unit.men, 10) || DEFAULT_MEN_VALUE
    })
    return map
  }, [DEFAULT_MEN_VALUE])

  // FUNCTIONS
  const selectFaction = (index) => {
    if (user.isHost) {
      setIndexFactionSelected(index)
    }
  }

  const addUnit = (unitCode) => {
    let selectedFaction = ''
    if (user.userFaction === '') {
      selectedFaction = factions[indexFactionSelected]?.code
    } else {
      selectedFaction = user.userFaction
    }
    if (user.isHost) {
      selectedFaction = factions[indexFactionSelected]?.code
    }
    if (units.filter(u => u.factionCode === factions[indexFactionSelected]?.code).length < 100) {
      socket.emit('add-unit', {
        roomUuid: params.battleuuid,
        factionCode: selectedFaction,
        unitCode: unitCode
      })
    }
  }

  const openBulkModal = useCallback(() => {
    setBulkInput('')
    setBulkError('')
    setIsBulkModalOpen(true)
  }, [])

  const closeBulkModal = useCallback(() => {
    setIsBulkModalOpen(false)
  }, [])

  useEffect(() => {
    if (typeof registerBulkAdditionHandler !== 'function') {
      return undefined
    }
    registerBulkAdditionHandler(openBulkModal)
    return undefined
  }, [openBulkModal, registerBulkAdditionHandler])

  useEffect(() => {
    setInputMen(buildInputMenMap(units))
  }, [units, buildInputMenMap])

  const handleBulkConfirm = () => {
    setBulkError('')
    const lines = bulkInput.split('\n').map(line => line.trim()).filter(Boolean)

    if (lines.length === 0) {
      setBulkError('Enter at least one line with faction, unit, men, and copies.')
      return
    }

    let totalCopies = 0
    const unitsPayload = []
    const factionCounts = { ...existingFactionCounts }

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index]
      const parts = line.split(/[\s,]+/).filter(Boolean)

      if (parts.length !== 4) {
        setBulkError(`Line ${index + 1} must contain exactly four values.`)
        return
      }

      const [rawFactionCode, rawUnitCode, rawMen, rawCopies] = parts
      const factionCode = rawFactionCode.toUpperCase()
      const unitCode = rawUnitCode.toUpperCase()

      if (!validFactionCodes.includes(factionCode)) {
        setBulkError(`Line ${index + 1}: Unknown faction code "${rawFactionCode}".`)
        return
      }

      if (!validUnitCodes.includes(unitCode)) {
        setBulkError(`Line ${index + 1}: Unknown unit code "${rawUnitCode}".`)
        return
      }

      const men = Number(rawMen)
      const copies = Number(rawCopies)

      if (!Number.isInteger(men) || men < 1 || men > 99999) {
        setBulkError(`Line ${index + 1}: Men value must be an integer between 1 and 99999.`)
        return
      }

      if (!Number.isInteger(copies) || copies < 1) {
        setBulkError(`Line ${index + 1}: Copies value must be an integer greater than 0.`)
        return
      }

      totalCopies += copies

      if (totalCopies > 100) {
        setBulkError('Total number of copies cannot exceed 100.')
        return
      }

      const currentCount = factionCounts[factionCode] || 0
      if (currentCount + copies > 100) {
        setBulkError(`Line ${index + 1}: Adding ${copies} copies exceeds 100 units for faction ${factionCode}.`)
        return
      }
      factionCounts[factionCode] = currentCount + copies

      for (let copy = 0; copy < copies; copy += 1) {
        unitsPayload.push({ factionCode, unitCode, men })
      }
    }

    socket.emit('add-units-bulk', {
      roomUuid: params.battleuuid,
      units: unitsPayload
    })

    closeBulkModal()
  }

  const removeUnit = (factionCode, unitCode, identifier) => {
    socket.emit('remove-unit', {
      roomUuid: params.battleuuid,
      factionCode: factionCode,
      unitCode: unitCode,
      identifier: identifier
    })
  }

  const handleInputMen = (factionCode, unitCode, identifier, value) => {
    let men = parseInt(value.replace(/[^0-9]/g, '') || '0', 10)
    if (isNaN(men) || men < 1) men = 1
    if (men > 99999) men = 99999
    socket.emit('change-men', {
      roomUuid: params.battleuuid,
      factionCode: factionCode,
      unitCode: unitCode,
      identifier: identifier,
      men: men
    })
  }

  // SOCKET LISTENER
  useEffect(() => {
    socket.on('unit-added', (data) => {
      setUnits(data.units)
      setInputMen(buildInputMenMap(data.units))
    })

    socket.on('unit-removed', (data) => {
      setUnits(data.units)
      setInputMen(buildInputMenMap(data.units))
    })

    socket.on('men-changed', (data) => {
      setInputMen(buildInputMenMap(data.units))
      setUnits(data.units)
    })

    socket.on('units-bulk-added', (data) => {
      setUnits(data.units)
      setInputMen(buildInputMenMap(data.units))
    })

    return () => {
      socket.off('unit-added')
      socket.off('unit-removed')
      socket.off('men-changed')
      socket.off('units-bulk-added')
    }
  }, [])

  // RENDER
  return (
    <div className='setup-units'>
      <div className='unit-store'>
        {unitShop.map((u) => (
          <div key={u.code} className='unit-item' tooltip={`${u.name}\nHD per men: ${u.hdPerMen}`}>
            {u.icon ? (
              <img
                src={`/images/${u.icon}`}
                onClick={() => addUnit(u.code)}
                alt=''
                height={48}
                width={48} />
            ) : null}
          </div>
        ))}
      </div>

      <div className='faction-panels'>
        {factions.map((f, i) => (
          <div
            key={f.code}
            className={`faction-panel ${!user.isHost && user.isSpectator ? '' : (!user.isHost && user.userFaction === f.code ? 'selected' : (factions[indexFactionSelected]?.code === f.code ? 'selected' : ''))}`}
            style={{ borderColor: f.color }}
            onClick={() => selectFaction(i)}
          >
            <div className='faction-panel-title'>
              <img src={`/images/${f.icon}`} alt='' height={18} width={30} />
              {f.name}
            </div>
            {units.map((u) => {
              if (u.factionCode === f.code) {
                return (
                  <div key={`${u.unitCode}-${u.identifier}`} className='faction-unit'>
                    <div className='faction-unit-name'>
                      <div>{u.name} {u.identifier}</div>
                      <Button color='none' size='small' onClick={() => removeUnit(f.code, u.unitCode, u.identifier)}>x</Button>
                    </div>
                    <div>
                    <input
                      disabled={!user.isHost && f.code !== user.userFaction}
                      type='number'
                      value={inputMen[`${u.factionCode}-${u.unitCode}-${u.identifier}`] || 20}
                      onChange={(e) => handleInputMen(f.code, u.unitCode, u.identifier, e.target.value)}
                      min={1}
                      max={99999}
                      step={1}
                    /> men {u.maxHd} HD </div>
                  </div>
                )
              }
            })}
          </div>
        ))}
      </div>

      <Modal
        isOpen={isBulkModalOpen}
        onCancel={closeBulkModal}
        onSubmit={handleBulkConfirm}
        submitText='Confirm'
      >
        <div className='bulk-addition-modal'>
          <h3>Bulk Unit Addition</h3>
          <p>Enter one unit per line as faction, unit, men, copies.</p>
          {bulkError && <div className='bulk-addition-error'>{bulkError}</div>}
          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder='KAR, VHINF, 25, 3'
          />
        </div>
      </Modal>
    </div>
  )
}

export default SetupUnits
