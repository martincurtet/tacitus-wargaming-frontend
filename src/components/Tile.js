import React from 'react'
import '../styles/components/Tile.css'

const Tile = ({ content, color }) => {
  return (
    <div
      className='tile'
      style={{ backgroundColor: color }}
    >
      {content}
    </div>
  )
}

export default Tile
