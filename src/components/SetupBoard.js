import React, { useEffect, useState } from 'react'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { integerToLetter } from '../functions/functions'

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
    const rowNumber= parseInt(e.target.value)
    setInputRowNumber(rowNumber)
    updateBoardSize(rowNumber, inputColumnNumber)
  }

  const handleInputColumnNumberChange = (e) => {
    const columnNumber = parseInt(e.target.value)
    setInputColumnNumber(columnNumber)
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
    units.map(u => (
      unassignedUnits.push(
        <UnitIcon
          className='sidebar-units-image'
          tooltip={`${u.factionCode}-${u.unitCode}${u.identifier !== '' ? `-${u.identifier}` : ''}`}
          unitIconName={u.iconName}
          factionIconName={factions.find(f => f.code === u.factionCode).icon}
          veterancyIconName={veterancyMap[u.veterancy].iconName}
        />
      )
    ))
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
            icon={''}
          />
        )
      }
    }
    return tiles
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

    return () => {
      socket.off('board-size-updated')
      socket.off('board-terrain-updated')
    }
  }, [setBoardSize, setLog])

  // RENDER
  return (
    <div className='setup-board'>
      <div className='setup-board-sidebar'>
        <div className='sidebar-row'>
          <label>Number of rows</label>
          <input
            type='number'
            value={inputRowNumber}
            onChange={handleInputRowNumberChange}
            min={1}
            max={MAX_GRID_SIZE}
            step={1}
          />
        </div>
        <div className='sidebar-column'>
          <label>Number of columns</label>
          <input
            type='number'
            value={inputColumnNumber}
            onChange={handleInputColumnNumberChange}
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
        <div className='sidebar-units'>
          {renderUnits()}
        </div>
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
    </div>
  )
}

export default SetupBoard
