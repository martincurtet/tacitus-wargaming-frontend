import React from 'react'

import Droppable from './dndComponents/Droppable'
import Draggable from './dndComponents/Draggable'
import UnitIcon from './UnitIcon'

import '../styles/components/Tile.css'

const Tile = ({
    content, coordinates, highlighted, color,
    setStartingTile=()=>{}, setFinishingTile=()=>{}, setSelectedTile=()=>{},
    unitIconName, factionIconName, veterancyIconName, handleToggleMarker=()=>{}
  }) => {
  //

  const handleClick = (e) => {
    setSelectedTile(coordinates)
    if (e.shiftKey) {
      console.log('Shift+Click triggered')
      handleToggleMarker(coordinates)
    }
  }

  // RENDER
  return (
    <div
      id={coordinates}
      className={`tile ${highlighted ? 'red' : 'grey'}-border`}
      style={{ backgroundColor: color }}
      onMouseDown={() => setStartingTile(coordinates)}
      onMouseUp={() => setFinishingTile(coordinates)}
      onDoubleClick={() => setSelectedTile(coordinates)}
      onClick={handleClick}
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
