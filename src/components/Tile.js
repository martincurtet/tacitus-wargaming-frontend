import React, { useState } from 'react'

import Droppable from './dndComponents/Droppable'
import Draggable from './dndComponents/Draggable'

import '../styles/components/Tile.css'
import UnitIcon from './UnitIcon'

const Tile = ({
    content,
    coordinates,
    color,
    setStartingTile=()=>{}, setFinishingTile=()=>{},
    unitIconName, factionIconName, veterancyIconName
  }) => {
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
          {unitIconName !== undefined && unitIconName !== '' ? (
            <Draggable id={coordinates}>
              <UnitIcon
                unitIconName={unitIconName}
                factionIconName={factionIconName}
                veterancyIconName={veterancyIconName}
              />
            </Draggable>
          ) : null}
        </Droppable>
      )}
    </div>
  )
}

export default Tile
