import React from 'react'
import '../styles/components/Tile.css'

const Tile = ({ rowIndex, columnIndex}) => {
  return (
    <div className='tile'>
      {columnIndex}{rowIndex}
    </div>
  )
}

export default Tile
