import React, { useEffect } from 'react'
import { integerToLetter } from '../functions/functions'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'

import Tile from './Tile'

import { DndContext } from '@dnd-kit/core'

import '../styles/components/Board.css'

const Board = ({
    board, setBoard, boardSize,
    setUnits,
    setLog
  }) => {

  //
  const params = useParams()

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

  // SOCKET EVENTS
  useEffect(() => {
    socket.on('unit-coordinates-updated', (data) => {
      setBoard(data.board)
      setUnits(data.units)
      setLog(data.log)
    })

    return () => {
      socket.off('unit-coordinates-updated')
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
            content={tileContent}
            terrain={tile?.terrainType}
            color={tileColor}
            unitIconName={tile?.unitIcon}
            factionIconName={tile?.factionIcon}
            veterancyIconName={tile?.veterancyIcon}
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
          className={`board-grid`}
          style={{
            gridTemplateColumns: `repeat(${boardSize['columnNumber']+1}, 40px)`,
            gridTemplateRows: `repeat(${boardSize['rowNumber']+1}, 40px)`,
          }}
        >
          {renderBoard()}
        </div>
      </DndContext>

      {/* <Modal
        isOpen={isBoardSizeModalOpen}
        onCancel={closeBoardSizeModal}
        onSubmit={submitBoardSizeModal}
      >
        <label>Number of rows</label>
        <input
          type='number'
          value={inputBoardSizeR}
          onChange={changeInputBoardSizeR}
          min={1}
          max={MAX_GRID_SIZE}
          step={1}
        />
        <label>Number of columns</label>
        <input
          type='number'
          value={inputBoardSizeC}
          onChange={changeInputBoardSizeC}
          min={1}
          max={MAX_GRID_SIZE}
          step={1}
        />
      </Modal> */}
    </div>
  )
}

export default Board
