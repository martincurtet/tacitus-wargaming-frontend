import React, { useEffect, useState } from 'react'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'

import '../styles/components/SetupBoard.css'

const SetupBoard = ({ boardSize, setBoardSize, setLog }) => {
  //
  const MAX_GRID_SIZE = Number(process.env.REACT_APP_MAX_GRID_SIZE) || 60

  //
  const params = useParams()
  const [inputRowNumber, setInputRowNumber] = useState(boardSize['rowNumber'])
  const [inputColumnNumber, setInputColumnNumber] = useState(boardSize['columnNumber'])
  const [inputTerrain, setInputTerrain] = useState('plains')

  // temp - remove when drag and drop is implemented
  const [inputStartCell, setInputStartCell] = useState('')
  const [inputEndCell, setInputEndCell] = useState('')

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

  const handleInputTerrainChange = (e) => {
    setInputTerrain(e.target.value)
    console.log(`changing input terrain to ${e.target.value}`)
  }

  //
  const handleInputStartCellChange = (e) => {
    setInputStartCell(e.target.value)
  }

  const handleInputEndCellChange = (e) => {
    setInputEndCell(e.target.value)
  }

  const handleTerrainDraw = () => {
    console.log(`drawing ${inputTerrain} from ${inputStartCell} to ${inputEndCell}`)
    socket.emit('update-board-terrain', {
      roomUuid: params.battleuuid,
      startCell: inputStartCell,
      endCell: inputEndCell,
      terrainType: inputTerrain
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

    return () => {
      socket.off('board-size-updated')
    }
  }, [setBoardSize, setLog])

  // RENDER
  return (
    <div className='setup-board'>
      <div>
        <label>Number of rows</label>
        <input
          type='number'
          value={inputRowNumber}
          onChange={handleInputRowNumberChange}
          min={1}
          max={MAX_GRID_SIZE}
          step={1}
        />
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
      <div>
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
        <div>
          <label>Start Cell</label>
          <input
            type='text'
            value={inputStartCell}
            onChange={handleInputStartCellChange}
          />
        </div>
        <div>
          <label>End Cell</label>
          <input
            type='text'
            value={inputEndCell}
            onChange={handleInputEndCellChange}
          />
        </div>
        <button onClick={handleTerrainDraw}>Draw</button>
      </div>
    </div>
  )
}

export default SetupBoard
