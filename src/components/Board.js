import React, { useEffect, useState } from 'react'
import { cellRange, integerToLetter, terrainToHex } from '../functions/functions'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'

import Modal from './Modal'
import Tile from './Tile'

import { DndContext } from '@dnd-kit/core'
import Droppable from './dndComponents/Droppable'
import Draggable from './dndComponents/Draggable'

import '../styles/components/Board.css'

const Board = ({
    board, setBoard,
    units, setUnits,
    setLog
  }) => {

  //
  const params = useParams()
  const MAX_GRID_SIZE = Number(process.env.REACT_APP_MAX_GRID_SIZE)

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

  const changeInputBoardSizeR = (e) => {
    if (
      /^[0-9\b]+$/.test(e.target.value)
      && e.target.value >= 1
      && e.target.value <= MAX_GRID_SIZE
    ) {
      setInputBoardSizeR(e.target.value)
    } else {
      console.error(`Invalid row number`)
    }
  }
  const changeInputBoardSizeC = (e) => {
    if (
      /^[0-9\b]+$/.test(e.target.value)
      && e.target.value >= 1
      && e.target.value <= MAX_GRID_SIZE
    ) {
      setInputBoardSizeC(e.target.value)
    } else {
      console.error(`Invalid column number`)
    }
  }

  const submitBoardSizeModal = () => {
    socket.emit('update-board-size', {
      uuid: params.battleuuid,
      rows: Number(inputBoardSizeR),
      columns: Number(inputBoardSizeC)
    })
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
          tileIcon = units.find(u => u.code === tile.unit).icon
        }
        tempTiles.push({
          key: `r${r}c${c}`,
          coordinates: `${integerToLetter(c)}${r}`,
          content: tileContent,
          color: tileColor,
          icon: tileIcon
        })
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
    if (isPaintOn) return
    // console.log(e)
    const { over } = e // get information
    if (over === null) return // if dropping in a non-droppable zone

    if (e.active.id === over.id) return // if dropping in same zone (only for cells)

    let unitCode
    let startingCell
    let droppingCell

    // CASE 1 - FROM drop-zone TO cell
    if (e.active.id.length !== 2) {
      if (over.id === 'drop-zone') return // dropping in same zone
      unitCode = e.active.id
      startingCell = 'drop-zone'
      droppingCell = over.id
    }

    // CASE 2 - FROM cell TO drop-zone
    else if (over.id === 'drop-zone') {
      unitCode = board[e.active.id].unit
      startingCell = e.active.id
      droppingCell = 'drop-zone'
    }

    // CASE 3 - FROM cell TO cell
    else {
      unitCode = board[e.active.id].unit
      startingCell = e.active.id
      droppingCell = over.id
    }

    // update socket
    socket.emit('update-board-unit', { uuid: params.battleuuid, unitCode: unitCode, startingCell: startingCell, droppingCell: droppingCell })
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

  const findUnitIcon = (unitCode) => {
    for (const key in units) {
      if (units.hasOwnProperty(key) && units[key].code === unitCode) {
        return units[key].icon
      }
    }
    // console.log(`Couldn't get icon for ${unitCode}`)
    // console.log(units)
    return 'normal.png'
  }

  useEffect(() => {
    // console.log('the use effect that puts units on the board')
    // find a way to not trigger if hd/casu/fatigue/notes changes
    if (units.length !== 0) {
      let tempBoard = board
      tempBoard['drop-zone'] = []
      units.map((u) => {
        if (!isUnitOnBoard(u.code)) {
          // console.log(`unit ${u.code} is not on board`)
          tempBoard['drop-zone'].push(u.code)
        }
      })
      socket.emit('update-board', { uuid: params.battleuuid, board: tempBoard })
    }
  }, [units])

  useEffect(() => {
    generateTiles()
  }, [board])

  useEffect(() => {
    // PAINTING FUNCTION
    if (finishingTile !== null && isPaintOn) {
      const cells = cellRange(startingTile, finishingTile)
      socket.emit('update-board-terrain', { uuid: params.battleuuid, terrain: inputTerrain, zone: cells })
    }
  }, [finishingTile])

  // SOCKET LISTENERS
  useEffect(() => {
    socket.on('board-size-updated', (data) => {
      // console.log(data.rows)
      // console.log(data.columns)
      setBoard(prev => ({
        ...prev,
        'rows': data.rows,
        'columns': data.columns
      }))
      setLog(data.log)
    })
    socket.on('board-terrain-updated', (data) => {
      // console.log(data.board)
      setBoard(data.board)
      setLog(data.log)
    })
    socket.on('board-unit-updated', (data) => {
      setBoard(data.board)
      setLog(data.log)
    })

    return () => {
      socket.off('board-size-updated')
      socket.off('board-terrain-updated')
      socket.off('board-unit-updated')
    }
  }, [])

  // RENDER
  return (
    <div className='board'>
      <DndContext onDragEnd={handleDragEnd}>
      <button onClick={toggleToolbar}>Toggle Board Toolbar</button>
        <Droppable id={'drop-zone'}>
          <div className='unit-drop'>
            {board['drop-zone'] !== undefined ? board['drop-zone'].map(u => (
              <Draggable id={u} key={u} >
                <div className='unit-drop-item' tooltip={u} >
                  <img
                    src={require(`../images/${findUnitIcon(u)}`)}
                    alt=''
                    width={32}
                    height={32}
                  />
                </div>
              </Draggable>
            )) : null}
          </div>
        </Droppable>
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
        {tiles.map((t, i) => (
          <Tile
            key={t.key}
            coordinates={t.coordinates}
            content={t.content}
            color={t.color}
            setStartingTile={setStartingTile}
            setFinishingTile={setFinishingTile}
            icon={t.icon}
          />
        ))}
      </div>
      </DndContext>

      <Modal
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
      </Modal>
    </div>
  )
}

export default Board
