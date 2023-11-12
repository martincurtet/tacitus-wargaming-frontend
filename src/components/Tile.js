import React from 'react'
import '../styles/components/Tile.css'
import { integerToLetter } from '../functions/functions'

const Tile = ({ rowIndex, columnIndex }) => {
  const isTableHeader = rowIndex === 0 && columnIndex === 0
  const isRowHeader = columnIndex === 0
  const isColumnHeader = rowIndex === 0

  const tileContent = isTableHeader ? '' : isRowHeader ? rowIndex : isColumnHeader ? (columnIndex) : ''

  return (
    <div className='tile'>
      {tileContent}
    </div>
  )
}

export default Tile
