import React, { useEffect, useState } from 'react'
import { cellRange, integerToLetter, terrainToHex } from '../functions/functions'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import Tile from './Tile'
import Modal from './Modal'
import '../styles/components/Board.css'

import { DndContext } from '@dnd-kit/core'
import Droppable from './dndComponents/Droppable'
import Draggable from './dndComponents/Draggable'

const Board = ({ board, setBoard, units, setUnits }) => {
  const params = useParams()

  // BOARD SIZE VARIABLES
  const [isBoardSizeModalOpen, setIsBoardSizeModalOpen] = useState(false)
  const [inputBoardSizeR, setInputBoardSizeR] = useState(8)
  const [inputBoardSizeC, setInputBoardSizeC] = useState(8)
  const [tiles, setTiles] = useState([])
  const tileSize = 40
  
  // BOARD PAINT VARIABLES
  const [isToolbarOpen, setIsToolbarOpen] = useState(false)
  const [isPaintOn, setIsPaintOn] = useState(false)
  const [inputTerrain, setInputTerrain] = useState('plains')
  const [startingTile, setStartingTile] = useState(null)
  const [finishingTile, setFinishingTile] = useState(null)

  //
  const openBoardSizeModal = () => {
    setIsBoardSizeModalOpen(true)
  }

  const closeBoardSizeModal = () => {
    setIsBoardSizeModalOpen(false)
  }

  const changeInputBoardSizeC = (e) => {
    if (/^[0-9\b]+$/.test(e.target.value) && e.target.value >= 1 && e.target.value <= 30) {
      setInputBoardSizeC(e.target.value)
    } else {
      console.log(`Invalid column number`)
    }
  }

  const changeInputBoardSizeR = (e) => {
    if (/^[0-9\b]+$/.test(e.target.value) && e.target.value >= 1 && e.target.value <= 30) {
      setInputBoardSizeR(e.target.value)
    } else {
      console.log(`Invalid row number`)
    }
  }

  const submitBoardSizeModal = () => {
    console.log('submitting size modal')
    socket.emit('update-board', { uuid: params.battleuuid, board: {
      ...board,
        'rows': Number(inputBoardSizeR),
        'columns': Number(inputBoardSizeC)
    } })
    setIsBoardSizeModalOpen(false)
  }

  //
  const generateTiles = () => {
    let tempTiles = []
    for (let r = 0; r <= board['rows']; r++) {
      for (let c = 0; c <= board['columns']; c++) {
        const tile = board[`${integerToLetter(c)}${r}`] || null
        let tileContent = (c === 0 && r === 0) ? '' : c === 0 ? r : r === 0 ? integerToLetter(c) : ''
        let tileColor = '#d9ead3'
        let tileIcon = ''
        if (c === 0 || r === 0) tileColor = '#ffffff'
        if (tile?.terrain) {
          tileColor = terrainToHex(tile.terrain)
        }
        if (tile?.unit) {
          console.log(`Unit: ${tile.unit}`)
          tileIcon = units.find(u => u.code === tile.unit).icon
        }
        tempTiles.push(
          <Tile
            key={`r${r}c${c}`}
            coordinates={`${integerToLetter(c)}${r}`}
            content={tileContent}
            color={tileColor}
            setStartingTile={setStartingTile}
            setFinishingTile={setFinishingTile}
            icon={tileIcon}
          />
        )
      }
    }
    setTiles(tempTiles)
  }

  const toggleToolbar = () => {
    setIsPaintOn(false)
    setIsToolbarOpen(prev =>!prev)
  }

  const togglePaint = () => {
    setIsPaintOn(prev => !prev)
  }

  const handleDragEnd = (e) => {
    const { over } = e
    if (over === null) return
    console.log(`Moving unit ${e.active.id} to tile ${over.id}`)
    let tempBoard = board
    if (tempBoard[over.id]) {
      tempBoard[over.id] = { ...tempBoard[over.id], unit: tempBoard[e.active.id].unit }
      tempBoard[e.active.id] = {}
    } else {
      tempBoard[over.id] = { unit: tempBoard[e.active.id].unit }
      tempBoard[e.active.id] = {}
    }
    socket.emit('update-board', { uuid: params.battleuuid, board: tempBoard })
  }

  const isUnitOnBoard = (unitCode) => {
    // console.log(`checking ${unitCode}`)
    for (const key in board) {
      if (board.hasOwnProperty(key) && board[key].unit === unitCode) {
        return true
      }
    }
    return false
  }

  useEffect(() => {
    // console.log(isUnitOnBoard('KAR-SPE-0'))
  }, [units])

  useEffect(() => {
    generateTiles()
  }, [board, isPaintOn])

  useEffect(() => {
    if (finishingTile !== null && isPaintOn) {
      const cells = cellRange(startingTile, finishingTile)
      let tempBoard = board
      cells.forEach(cell => {
        tempBoard[cell] = { ...tempBoard[cell], terrain: inputTerrain }
      })
      socket.emit('update-board', { uuid: params.battleuuid, board: tempBoard })
    }
  }, [finishingTile])

  // RENDER
  return (
    <div className='board'>
      <DndContext onDragEnd={handleDragEnd}>
      <button onClick={toggleToolbar}>Toggle Board Toolbar</button>
        <div className='unit-drop'>
          <Droppable id={'drop-zone'}>
          {units.map(u => (
            isUnitOnBoard(u.code) ? null :(
              <Draggable id={u.code} key={u.code}>
                <img src={require(`../images/${u.icon}`)} alt='' width={32} height={32} />
              </Draggable>
            )
          ))}
          </Droppable>
        </div>
      {isToolbarOpen ? (
        <div className='board-toolbar'>
          <button onClick={openBoardSizeModal}>Edit Size</button>
          <button onClick={togglePaint}>Toggle Paint</button>
          {isPaintOn ? (
            <select
              onChange={e => setInputTerrain(e.target.value)}
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
          ) : null}
        </div>
      ) : null}
      <div
        className={`board-grid ${isPaintOn ? 'paint-cursor' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${board['columns']+1}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${board['rows']+1}, ${tileSize}px)`,
        }}
      >
        {tiles}
      </div>
      </DndContext>

      <Modal
        isOpen={isBoardSizeModalOpen}
        onCancel={closeBoardSizeModal}
        onSubmit={submitBoardSizeModal}
      >
        <label>Number of columns</label>
        <input
          type='number'
          value={inputBoardSizeC}
          onChange={changeInputBoardSizeC}
          min={1}
          max={30}
          step={1}
        />
        <label>Number of rows</label>
        <input
          type='number'
          value={inputBoardSizeR}
          onChange={changeInputBoardSizeR}
          min={1}
          max={30}
          step={1}
        />
      </Modal>
    </div>
  )
}

export default Board
