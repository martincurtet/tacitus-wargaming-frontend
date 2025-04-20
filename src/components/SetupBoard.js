import React, { useEffect, useState } from 'react'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { DndContext } from '@dnd-kit/core'
import { integerToLetter } from '../functions/functions'

import Draggable from './dndComponents/Draggable'
import Droppable from './dndComponents/Droppable'
import UnitIcon from './UnitIcon'
import Tile from './Tile'

import '../styles/components/SetupBoard.css'

const SetupBoard = ({ board, setBoard, boardSize, setBoardSize, factions, units, setUnits, setLog }) => {
  //
  const MAX_GRID_SIZE = Number(process.env.REACT_APP_MAX_GRID_SIZE) || 60

  const veterancyMap = {
    0: {
      iconName: 'militia.png'
    },
    1: {
      iconName: 'normal.png'
    },
    2: {
      iconName: 'veteran.png'
    },
    3: {
      iconName: 'elite.png'
    }
  }

  //
  const params = useParams()
  const [inputRowNumber, setInputRowNumber] = useState(boardSize['rowNumber'])
  const [inputColumnNumber, setInputColumnNumber] = useState(boardSize['columnNumber'])
  const [paintToggle, setPaintToggle] = useState(false)
  const [inputTerrain, setInputTerrain] = useState('plains')
  const [startingTile, setStartingTile] = useState(null)
  const [finishingTile, setFinishingTile] = useState(null)

  const handleInputRowNumberChange = (e) => {
    let rowNumber = parseInt(e.target.value.replace(/[^0-9]/g, ''))
    if (isNaN(rowNumber) || rowNumber < 1) rowNumber = 1
    if (rowNumber > 100) rowNumber = 100
    setInputRowNumber(rowNumber)
    updateBoardSize(rowNumber, inputColumnNumber)
  }

  const handleInputColumnNumberChange = (e) => {
    let columnNumber = parseInt(e.target.value.replace(/[^0-9]/g, ''))
    setInputColumnNumber(columnNumber)
    if (isNaN(columnNumber) || columnNumber < 1) columnNumber = 1
    if (columnNumber > 100) columnNumber = 100
    updateBoardSize(inputRowNumber, columnNumber)
  }

  const updateBoardSize = (rowNumber, columnNumber) => {
    socket.emit('update-board-size', {
      roomUuid: params.battleuuid,
      boardSize: {
        'rowNumber': rowNumber,
        'columnNumber': columnNumber
      }
    })
  }

  const togglePaint = () => {
    setPaintToggle(prev => !prev)
  }

  const handleInputTerrainChange = (e) => {
    setInputTerrain(e.target.value)
  }

  //
  useEffect(() => {
    if (finishingTile !== null && paintToggle) {
      socket.emit('update-board-terrain', {
        roomUuid: params.battleuuid,
        startCell: startingTile,
        endCell: finishingTile,
        terrainType: inputTerrain
      })
    }
  }, [finishingTile])

  //
  const renderUnits = () => {
    // check units without coordinates
    let unassignedUnits = []
    units.map(u => {
      if (u.coordinates === '') {
        return (
          unassignedUnits.push(
            <Draggable id={`${u.factionCode}-${u.unitCode}${u.identifier !== '' ? `-${u.identifier}` : ''}`} key={`${u.factionCode}-${u.unitCode}${u.identifier !== '' ? `-${u.identifier}` : ''}`}>
              <UnitIcon
                className='sidebar-units-image'
                tooltip={`${u.factionCode}-${u.unitCode}${u.identifier !== '' ? `-${u.identifier}` : ''}`}
                unitIconName={u.iconName}
                factionIconName={factions.find(f => f.code === u.factionCode).icon}
                veterancyIconName={veterancyMap[u.veterancy].iconName}
                identifier={u.identifier} identifierColor={u.fontColor}
              />
            </Draggable>
          )
        )
      }})
    return unassignedUnits
  }

  const renderBoard = () => {
    let tiles = []
    for (let r = 0; r <= boardSize['rowNumber']; r++) {
      for (let c = 0; c <= boardSize['columnNumber']; c++) {
        const tileCoordinates = `${integerToLetter(c)}${r}`
        const tile = board[tileCoordinates] || null
        let tileColor = tile?.terrainColor || '#d9ead3'
        if (c === 0 || r === 0) tileColor = '#ffffff'
        const tileContent = (c === 0 && r === 0) ? '' : c === 0 ? r : r === 0 ? integerToLetter(c) : ''
        tiles.push(
          <Tile
            key={`r${r}c${c}`}
            coordinates={tileCoordinates}
            content={tileContent}
            terrain={tile?.terrainType}
            color={tileColor}
            setStartingTile={setStartingTile}
            setFinishingTile={setFinishingTile}
            unitIconName={tile?.unitIcon}
            factionIconName={tile?.factionIcon}
            veterancyIconName={tile?.veterancyIcon}
            fire={tile?.fire} highGround={tile?.impassable}
            identifier={tile?.identifier}
            identifierColor={tile?.identifierColor}
          />
        )
      }
    }
    return tiles
  }

  const handleDragEnd = (e) => {
    if (paintToggle) return

    const { active, over } = e
    if (over === null) return

    if (over.id === '00') return

    let unitFullCode = ''
    let coordinates = ''

    if (active.id.includes('-')) {
      // unit-unassigned to tile
      if (over.id === 'unit-unassigned') return
      unitFullCode = active.id
      coordinates = over.id
    } else if (over.id === 'unit-unassigned') {
      // tile to unit-unassigned (disabled)
      return
    } else {
      // tile to tile
      if (active.id === over.id) return
      unitFullCode = board[active.id].unitFullCode
      coordinates = over.id
    }
    
    if (board[coordinates]?.unitFullCode !== undefined && board[coordinates]?.unitFullCode !== '') return

    //
    socket.emit('update-unit-coordinates', {
      roomUuid: params.battleuuid,
      unitFullCode: unitFullCode,
      coordinates: coordinates
    })
  }

  // SOCKET EVENTS
  useEffect(() => {
    socket.on('board-size-updated', (data) => {
      setBoardSize(data.boardSize)
      setLog(data.log)
      setInputRowNumber(data.boardSize['rowNumber'])
      setInputColumnNumber(data.boardSize['columnNumber'])
    })

    socket.on('board-terrain-updated', (data) => {
      setBoard(data.board)
      setLog(data.log)
    })

    socket.on('unit-coordinates-updated', (data) => {
      setBoard(data.board)
      setUnits(data.units)
      setLog(data.log)
    })

    return () => {
      socket.off('board-size-updated')
      socket.off('board-terrain-updated')
      socket.off('unit-coordinates-updated')
    }
  }, [setBoardSize, setLog])

  // RENDER
  return (
    <div className='setup-board'>
      <DndContext
        onDragEnd={handleDragEnd}
      >
        <div className='setup-board-sidebar'>
          <div className='sidebar-board-size'>
            <label>Number of rows </label>
            <input
              type='number'
              value={inputRowNumber}
              onChange={(e) => setInputRowNumber(e.target.value)}
              onBlur={handleInputRowNumberChange}
              min={1}
              max={MAX_GRID_SIZE}
              step={1}
            />
            <label>Number of columns </label>
            <input
              type='number'
              value={inputColumnNumber}
              onChange={(e) => setInputColumnNumber(e.target.value)}
              onBlur={handleInputColumnNumberChange}
              min={1}
              max={MAX_GRID_SIZE}
              step={1}
            />
          </div>
          <div className='sidebar-terrain'>
            <input
              type='checkbox'
              checked={paintToggle}
              onChange={togglePaint}
            />
            <select
              onChange={handleInputTerrainChange}
              value={inputTerrain}
            >
              <option value='plains'>Plains</option>
              <option value='forest'>Forest</option>
              <option value='mud'>Mud</option>
              <option value='jungle'>Jungle</option>
              <option value='undergrowth'>Undergrowth</option>
              <option value='marsh'>Marsh</option>
              <option value='high-ground'>High Ground</option>
              <option value='shallow-water'>Shallow Water</option>
              <option value='deep-water'>Deep Water</option>
              <option value='fire'>Fire</option>
              <option value='road'>Road</option>
            </select>
          </div>
          <Droppable id={'unit-unassigned'}>
            <div className='sidebar-units'>
              {renderUnits()}
            </div>
          </Droppable>
        </div>
        <div
          className={`setup-board-grid ${paintToggle ? 'paint-cursor' : ''}`}
          style={{
            gridTemplateColumns: `repeat(${boardSize['columnNumber']+1}, 40px)`,
            gridTemplateRows: `repeat(${boardSize['rowNumber']+1}, 40px)`,
          }}
        >
          {renderBoard()}
        </div>
      </DndContext>
    </div>
  )
}

export default SetupBoard
