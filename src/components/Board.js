import React, { useContext, useEffect, useState } from 'react'
import { integerToLetter, terrainToHex } from '../functions/functions'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { DndContext, DragOverlay } from '@dnd-kit/core'
import { UserContext } from '../context/UserContext'

import Tile from './Tile'
import UnitIcon from './UnitIcon'

import '../styles/components/Board.css'

const Board = ({
    board, setBoard, boardSize,
    setUnits,
    setLog,
    paintToggle,
    inputTerrain
  }) => {

  //
  const params = useParams()
  const [user] = useContext(UserContext)
  const [selectedTile, setSelectedTile] = useState('')
  // const [paintToggle, setPaintToggle] = useState(false)
  // const [inputTerrain, setInputTerrain] = useState('plains')
  const [startingTile, setStartingTile] = useState(null)
  const [finishingTile, setFinishingTile] = useState(null)
  const [activeId, setActiveId] = useState(null)

  // Additive terrain painter (battle screen): delegate composition to backend
  useEffect(() => {
    if (finishingTile !== null && paintToggle) {
      const startCell = startingTile
      const endCell = finishingTile
      const token = (inputTerrain ?? '').toString().trim().toLowerCase()
      if (!startCell || !endCell || !token) return

      socket.emit('update-board-terrain', {
        roomUuid: params.battleuuid,
        startCell,
        endCell,
        terrainType: token
      })

      // Reset selection to avoid stale range carrying over
      setStartingTile(null)
      setFinishingTile(null)
    }
  }, [finishingTile, paintToggle, inputTerrain, startingTile, params.battleuuid])

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (e) => {
    setActiveId(null)
    const { active, over } = e
    if (over === null) return
    if (over.id === '00') return
    if (active.id === over.id) return

    let unitFullCode = board[active.id]?.unitFullCode
    let coordinates = over.id
  
    if (board[coordinates]?.unitFullCode !== undefined && board[coordinates]?.unitFullCode !== '') return

    // Optimistic update - immediately update local state
    const updatedBoard = { ...board }
    updatedBoard[active.id] = { ...(updatedBoard[active.id] || {}) }
    delete updatedBoard[active.id].unitIcon
    delete updatedBoard[active.id].factionIcon
    delete updatedBoard[active.id].veterancyIcon
    delete updatedBoard[active.id].unitIdentifier
    delete updatedBoard[active.id].identifierColor
    delete updatedBoard[active.id].unitFullCode

    updatedBoard[coordinates] = { ...(updatedBoard[coordinates] || {}) }
    updatedBoard[coordinates].unitIcon = board[active.id]?.unitIcon || ''
    updatedBoard[coordinates].factionIcon = board[active.id]?.factionIcon || ''
    updatedBoard[coordinates].veterancyIcon = board[active.id]?.veterancyIcon || ''
    updatedBoard[coordinates].unitIdentifier = board[active.id]?.unitIdentifier || ''
    updatedBoard[coordinates].identifierColor = board[active.id]?.identifierColor || ''
    updatedBoard[coordinates].unitFullCode = unitFullCode || ''

    setBoard(updatedBoard)

    socket.emit('update-unit-coordinates', {
      roomUuid: params.battleuuid,
      unitFullCode: unitFullCode,
      coordinates: coordinates
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Delete') {
      socket.emit('kill-unit', {
        roomUuid: params.battleuuid,
        coordinates: selectedTile
      })
    }
  }

  const handleToggleMarker = (coordinates) => {
    socket.emit('toggle-marker', {
      roomUuid: params.battleuuid,
      userUuid: user.userUuid,
      coordinates: coordinates
    })
  }

  const handleToggleFire = (coordinates) => {
    socket.emit('toggle-fire', {
      roomUuid: params.battleuuid,
      userUuid: user.userUuid,
      coordinates: coordinates
    })
  }

  // SOCKET EVENTS
  useEffect(() => {
    socket.on('unit-coordinates-updated', (data) => {
      setBoard(data.board)
      setUnits(data.units)
      setLog(data.log)
    })

    socket.on('unit-killed', (data) => {
      setBoard(data.board)
      setUnits(data.units)
      setLog(data.log)
    })

    socket.on('marker-toggled', (data) =>{
      setBoard(data.board)
      setLog(data.log)
    })

    socket.on('fire-toggled', (data) => {
      setBoard(data.board)
      setLog(data.log)
    })

    socket.on('markers-removed', (data) => {
      setBoard(data.board)
      setLog(data.log)
    })

    socket.on('board-terrain-updated', (data) => {
      // Treat server snapshot as source of truth
      setBoard(data.board)
      setLog(data.log)
    })

    return () => {
      socket.off('unit-coordinates-updated')
      socket.off('unit-killed')
      socket.off('marker-toggled')
      socket.off('fire-toggled')
      socket.off('board-terrain-updated')
    }
  }, [setBoard, setUnits, setLog])

  // RENDER FUNCTIONS
  const renderBoard = () => {
    let tiles = []
    for (let r = 0; r <= boardSize['rowNumber']; r++) {
      for (let c = 0; c <= boardSize['columnNumber']; c++) {
        const tileCoordinates = `${integerToLetter(c)}${r}`
        const tile = board[tileCoordinates] || null
        // Derive base color from terrainType tokens if present
        const terrainType = tile?.terrainType || ''
        const tokens = terrainType ? terrainType.split(/[+,]/).map(t => t.trim()).filter(Boolean) : []
        const baseToken = tokens.find(t => (
          t === 'plains' || t === 'forest' || t === 'mud' || t === 'jungle' ||
          t === 'undergrowth' || t === 'marsh' || t === 'shallow-water' ||
          t === 'deep-water' || t === 'road'
        ))
        let tileColor = (baseToken ? terrainToHex(baseToken) : (tile?.terrainColor || '#d9ead3'))
        if (c === 0 || r === 0) tileColor = '#ffffff'
        const tileContent = (c === 0 && r === 0) ? '' : c === 0 ? r : r === 0 ? integerToLetter(c) : ''
        tiles.push(
          <Tile
            key={`r${r}c${c}`}
            coordinates={tileCoordinates}
            highlighted={tileCoordinates === selectedTile}
            content={tileContent}
            terrain={tile?.terrainType}
            color={tileColor}
            unitIconName={tile?.unitIcon}
            factionIconName={tile?.factionIcon}
            veterancyIconName={tile?.veterancyIcon}
            setSelectedTile={setSelectedTile}
            markerColor={tile?.markerColor}
            handleToggleMarker={handleToggleMarker}
            handleToggleFire={handleToggleFire}
            fire={tile?.fire}
            identifier={tile?.unitIdentifier}
            identifierColor={tile?.identifierColor}
            setStartingTile={setStartingTile}
            setFinishingTile={setFinishingTile}
            painting={paintToggle}
          />
        )
      }
    }
    return tiles
  }

  // Drag Overlay Component
  const renderDragOverlay = () => {
    if (!activeId) return null
    
    const tile = board[activeId] || null
    if (!tile || !tile.unitIcon) return null

    return (
      <UnitIcon
        className='drag-overlay-unit'
        unitIconName={tile.unitIcon}
        factionIconName={tile.factionIcon}
        veterancyIconName={tile.veterancyIcon}
        identifier={tile.unitIdentifier}
        identifierColor={tile.identifierColor}
      />
    )
  }

  // RENDER
  return (
    <div className='board'>
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className={`board-grid ${paintToggle ? 'paint-cursor' : ''}`}
          style={{
            gridTemplateColumns: `repeat(${boardSize['columnNumber']+1}, 40px)`,
            gridTemplateRows: `repeat(${boardSize['rowNumber']+1}, 40px)`,
          }}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {renderBoard()}
        </div>
        <DragOverlay dropAnimation={null}>
          {renderDragOverlay()}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default Board
