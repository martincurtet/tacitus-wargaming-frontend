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
    identifier, identifierColor, dragging=false
  }) => {
  //
  const handleClick = (e) => {
    setSelectedTile(coordinates)
    if (e.shiftKey) {
      handleToggleMarker(coordinates)
    } else if (e.ctrlKey) {
    } else if (e.altKey) {
      handleToggleFire(coordinates)
    }
  }

  const tileStyle = fire ? {
    background: markerColor 
      ? `linear-gradient(45deg, ${color} 10%, #ff9a00 10%, #ff9a00 20%, ${color} 20%, ${color} 30%, #ff9a00 30%, #ff9a00 40%, ${color} 40%, ${color} 50%, #ff9a00 50%, #ff9a00 60%, ${color} 60%, ${color} 70%, #ff9a00 70%, #ff9a00 80%, ${color} 80%, ${color} 90%, ${markerColor} 90%)`
      : `linear-gradient(45deg, ${color} 10%, #ff9a00 10%, #ff9a00 20%, ${color} 20%, ${color} 30%, #ff9a00 30%, #ff9a00 40%, ${color} 40%, ${color} 50%, #ff9a00 50%, #ff9a00 60%, ${color} 60%, ${color} 70%, #ff9a00 70%, #ff9a00 80%, ${color} 80%, ${color} 90%)`,
    '--base-background': markerColor 
      ? `linear-gradient(45deg, ${color} 10%, #ff9a00 10%, #ff9a00 20%, ${color} 20%, ${color} 30%, #ff9a00 30%, #ff9a00 40%, ${color} 40%, ${color} 50%, #ff9a00 50%, #ff9a00 60%, ${color} 60%, ${color} 70%, #ff9a00 70%, #ff9a00 80%, ${color} 80%, ${color} 90%, ${markerColor} 90%)`
      : `linear-gradient(45deg, ${color} 10%, #ff9a00 10%, #ff9a00 20%, ${color} 20%, ${color} 30%, #ff9a00 30%, #ff9a00 40%, ${color} 40%, ${color} 50%, #ff9a00 50%, #ff9a00 60%, ${color} 60%, ${color} 70%, #ff9a00 70%, #ff9a00 80%, ${color} 80%, ${color} 90%)`
  } : markerColor ? {
    background: `linear-gradient(45deg, ${color} 90%, ${markerColor} 90%)`,
    '--base-background': `linear-gradient(45deg, ${color} 90%, ${markerColor} 90%)`
  } : {
    background: color,
    '--base-background': color
  }

  // RENDER
  return (
    <div
      id={coordinates}
      className={`tile ${highlighted ? 'red' : 'grey'}-border ${highGround ? 'high-ground' : ''} ${dragging ? 'dragging' : ''}`}
      style={tileStyle}
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
