import React, { useState } from 'react'

import Droppable from './dndComponents/Droppable'
import Draggable from './dndComponents/Draggable'

import '../styles/components/Tile.css'

const Tile = ({ content, coordinates, terrain, color, setStartingTile, setFinishingTile, icon }) => {
  // const [highlighted, setHighlighted] = useState(false)

  return (
    <div
      // className={`tile ${highlighted ? 'red' : 'grey'}-border`}
      className={`tile grey-border`}
      style={{ backgroundColor: color }}
      onMouseDown={() => setStartingTile(coordinates)}
      onMouseUp={() => setFinishingTile(coordinates)}
      // onMouseOver={() => setHighlighted(true)}
      // onMouseLeave={() => setHighlighted(false)}
    >
      {content !== '' ? (
        content
      ) : (
        <Droppable id={coordinates}>
          {icon ? (
            <Draggable id={coordinates}>
              <img src={require(`../images/${icon}`)} alt='' width={32} height={32} />
            </Draggable>
          ) : null}
        </Droppable>
      )}
    </div>
  )
}

export default Tile
