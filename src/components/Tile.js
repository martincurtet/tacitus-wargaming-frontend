import React from 'react'

import Droppable from './dndComponents/Droppable'
import Draggable from './dndComponents/Draggable'
import UnitIcon from './UnitIcon'

import '../styles/components/Tile.css'

const Tile = ({
    content, coordinates, highlighted, color,
    setStartingTile=()=>{}, setFinishingTile=()=>{}, setSelectedTile=()=>{},
    unitIconName, factionIconName, veterancyIconName,
    markerColor, handleToggleMarker=()=>{}, handleToggleFire=()=>{}, fire, highGround,
    identifier, identifierColor
  }) => {
  //
  const handleClick = (e) => {
    setSelectedTile(coordinates)
    if (e.shiftKey) {
      console.log('Shift+Click triggered')
      handleToggleMarker(coordinates)
    } else if (e.ctrlKey) {
      console.log('Ctrl+Click triggered')
    } else if (e.altKey) {
      console.log('Alt+Click triggered')
      handleToggleFire(coordinates)
    }
  }

  const tileStyle = fire ? {
    background: markerColor 
      ? `linear-gradient(45deg, ${color} 10%, #ff9a00 10%, #ff9a00 20%, ${color} 20%, ${color} 30%, #ff9a00 30%, #ff9a00 40%, ${color} 40%, ${color} 50%, #ff9a00 50%, #ff9a00 60%, ${color} 60%, ${color} 70%, #ff9a00 70%, #ff9a00 80%, ${color} 80%, ${color} 90%, ${markerColor} 90%)`
      : `linear-gradient(45deg, ${color} 10%, #ff9a00 10%, #ff9a00 20%, ${color} 20%, ${color} 30%, #ff9a00 30%, #ff9a00 40%, ${color} 40%, ${color} 50%, #ff9a00 50%, #ff9a00 60%, ${color} 60%, ${color} 70%, #ff9a00 70%, #ff9a00 80%, ${color} 80%, ${color} 90%)`
  } : highGround ? {
    background: markerColor 
      ? `linear-gradient(45deg, ${color} 10%, #071c30 10%, #071c30 20%, ${color} 20%, ${color} 30%, #071c30 30%, #071c30 40%, ${color} 40%, ${color} 50%, #071c30 50%, #071c30 60%, ${color} 60%, ${color} 70%, #071c30 70%, #071c30 80%, ${color} 80%, ${color} 90%, ${markerColor} 90%)`
      : `linear-gradient(45deg, ${color} 10%, #071c30 10%, #071c30 20%, ${color} 20%, ${color} 30%, #071c30 30%, #071c30 40%, ${color} 40%, ${color} 50%, #071c30 50%, #071c30 60%, ${color} 60%, ${color} 70%, #071c30 70%, #071c30 80%, ${color} 80%, ${color} 90%)`
  } : markerColor ? {
    background: `linear-gradient(45deg, ${color} 90%, ${markerColor} 90%)`
  } : {
    background: color
  }

  // RENDER
  return (
    <div
      id={coordinates}
      className={`tile ${highlighted ? 'red' : 'grey'}-border`}
      style={tileStyle}
      onMouseDown={() => setStartingTile(coordinates)}
      onMouseUp={() => setFinishingTile(coordinates)}
      onDoubleClick={() => setSelectedTile(coordinates)}
      onClick={handleClick}
    >
      {content !== '' ? (
        content
      ) : (
        <Droppable id={coordinates} onClick={() => console.log('clicking on droppable')}>
          {unitIconName !== undefined && unitIconName !== '' ? (
            <Draggable id={coordinates} onClick={() => console.log('clicking on draggable')}>
              <UnitIcon
                unitIconName={unitIconName}
                factionIconName={factionIconName}
                veterancyIconName={veterancyIconName}
                markerColor={markerColor}
                handleClick={handleClick}
                identifier={identifier} identifierColor={identifierColor}
              />
            </Draggable>
          ) : null}
        </Droppable>
      )}
    </div>
  )
}

export default Tile
