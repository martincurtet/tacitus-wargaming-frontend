import React, { useEffect, useState } from 'react'
import Tile from './Tile'
import '../styles/components/Board.css'
import Modal from './Modal'

const Board = ({ board, setBoard }) => {
  // TODO
  // show board
  // add grid size
  // edit board modal

  //
  const [boardSize, setBoardSize] = useState([8, 8]) // rows, columns
  const [tiles, setTiles] = useState([])
  const tileSize = 32

  // BOARD SIZE VARIABLES
  const [isBoardSizeModalOpen, setIsBoardSizeModalOpen] = useState(false)
  const [inputBoardSizeC, setInputBoardSizeC] = useState(8)
  const [inputBoardSizeR, setInputBoardSizeR] = useState(8)

  //
  const openBoardSizeModal = () => {
    setIsBoardSizeModalOpen(true)
  }

  const closeBoardSizeModal = () => {
    setIsBoardSizeModalOpen(false)
  }

  const changeInputBoardSizeC = (e) => {
    if (!/0-9/.test(e.target.value) && e.target.value >= 1 && e.target.value <= 30) {
      setInputBoardSizeC(e.target.value)
    } else {
      console.log(`Invalid column number`)
    }
  }

  const changeInputBoardSizeR = (e) => {
    if (!/0-9/.test(e.target.value) && e.target.value >= 1 && e.target.value <= 30) {
      setInputBoardSizeR(e.target.value)
    } else {
      console.log(`Invalid row number`)
    }
  }

  const submitBoardSizeModal = () => {
    setBoardSize([Number(inputBoardSizeR), Number(inputBoardSizeC)])
    setIsBoardSizeModalOpen(false)
    generateTiles()
  }

  //
  const generateTiles = () => {
    let tempTiles = []
    for (let r = 0; r <= boardSize[0]; r++) {
      for (let c = 0; c <= boardSize[1]; c++) {
        tempTiles.push(<Tile key={`r${r}c${c}`} rowIndex={r} columnIndex={c} />)
      }
      setTiles(tempTiles)
    }
  }

  // TODO put in a use effect
  useEffect(() => {
    generateTiles()
  }, [boardSize])

  return (
    <div className='board'>
      <div className='board-toolbar'>
        <button onClick={openBoardSizeModal}>Edit Board</button>
      </div>
      <div
        className='board-grid'
        style={{
          gridTemplateColumns: `repeat(${boardSize[1]+1}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${boardSize[0]+1}, ${tileSize}px)`
        }}
      >
        {tiles}
      </div>

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
