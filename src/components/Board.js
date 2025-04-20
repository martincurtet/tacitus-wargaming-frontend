import React, { useContext, useEffect, useState } from 'react'
import { integerToLetter } from '../functions/functions'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { DndContext } from '@dnd-kit/core'
import { UserContext } from '../context/UserContext'

import Tile from './Tile'

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
  const [user, setUser] = useContext(UserContext)
  const [selectedTile, setSelectedTile] = useState('')
  // const [paintToggle, setPaintToggle] = useState(false)
  // const [inputTerrain, setInputTerrain] = useState('plains')
  const [startingTile, setStartingTile] = useState(null)
  const [finishingTile, setFinishingTile] = useState(null)

  // const togglePaint = () => {
  //   setPaintToggle(prev => !prev)
  // }

  // const handleInputTerrainChange = (e) => {
  //   setInputTerrain(e.target.value)
  // }

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

  const handleDragEnd = (e) => {
    const { active, over } = e
    if (over === null) return
    if (over.id === '00') return
    if (active.id === over.id) return

    let unitFullCode = board[active.id].unitFullCode
    let coordinates = over.id
  
    if (board[coordinates]?.unitFullCode !== undefined && board[coordinates]?.unitFullCode !== '') return

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

  const handleRemoveMarkers = () => {
    socket.emit('remove-markers', {
      roomUuid: params.battleuuid,
      userUuid: user.userUuid
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
        let tileColor = tile?.terrainColor || '#d9ead3'
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
            fire={tile?.fire} highGround={tile?.impassable}
            identifier={tile?.unitIdentifier}
            identifierColor={tile?.identifierColor}
            setStartingTile={setStartingTile}
            setFinishingTile={setFinishingTile}
          />
        )
      }
    }
    return tiles
  }

  // RENDER
  return (
    <div className='board'>
      <DndContext onDragEnd={handleDragEnd}>
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
      </DndContext>
      {/* <div className='board-toolbar'> */}
        {/* <Button onClick={handleRemoveMarkers}>Clear Markers</Button> */}
        {/* <input
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
        </select> */}
      {/* </div> */}
    </div>
  )
}

export default Board
