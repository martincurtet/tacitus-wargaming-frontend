import React, { useState } from 'react'
import '../styles/components/Tile.css'
import Droppable from './dndComponents/Droppable'
import Draggable from './dndComponents/Draggable'

const Tile = ({ content, coordinates, color, setStartingTile, setFinishingTile, icon }) => {
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
      {content !== '' ? (
        content
      ) : (
        <Droppable id={coordinates}>
          <Draggable id={coordinates}>
            {icon ? (
              <img src={require(`../images/${icon}`)} alt='' width={32} height={32} />
            ) : null}
          </Draggable>
        </Droppable>
      )}
    </div>
  )
}

export default Tile
