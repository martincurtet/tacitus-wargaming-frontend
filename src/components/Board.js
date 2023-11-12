import React from 'react'
import Tile from './Tile'

const Board = ({ board, setBoard }) => {
  // TODO
  // show board
  // add grid size
  // edit board modal

  //
  let boardSize = [8, 8] // rows, columns
  let tiles = []

  //
  const generateTiles = () => {
    for (let r = 0; r <= boardSize[0]; r++) {
      for (let c = 0; c <= boardSize[1]; c++) {
        tiles.push(<Tile rowIndex={r} columnIndex={c} />)
      }
    }
  }

  generateTiles()

  return (
    <div>{tiles}</div>
  )
}

export default Board
