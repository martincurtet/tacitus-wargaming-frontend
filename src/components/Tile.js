import React, { useState } from 'react'
import '../styles/components/Tile.css'

const Tile = ({ content, coordinates, color, setStartingTile, setFinishingTile }) => {
  const [highlighted, setHighlighted] = useState(false)

  return (
    <div
      className={`tile ${highlighted ? 'red' : 'grey'}-border`}
      style={{ backgroundColor: color }}
      onMouseDown={() => setStartingTile(coordinates)}
      onMouseUp={() => setFinishingTile(coordinates)}
      onMouseOver={() => setHighlighted(true)}
      onMouseLeave={() => setHighlighted(false)}
    >
      {content}
    </div>
  )
}

export default Tile
