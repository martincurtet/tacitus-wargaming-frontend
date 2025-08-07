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
      handleToggleMarker(coordinates)
    } else if (e.ctrlKey) {
    } else if (e.altKey) {
      handleToggleFire(coordinates)
    }
  }

  const tileStyle = fire ? {
    background: markerColor 
      ? `linear-gradient(45deg, ${color} 10%, #ff9a00 10%, #ff9a00 20%, ${color} 20%, ${color} 30%, #ff9a00 30%, #ff9a00 40%, ${color} 40%, ${color} 50%, #ff9a00 50%, #ff9a00 60%, ${color} 60%, ${color} 70%, #ff9a00 70%, #ff9a00 80%, ${color} 80%, ${color} 90%, ${markerColor} 90%)`
      : `linear-gradient(45deg, ${color} 10%, #ff9a00 10%, #ff9a00 20%, ${color} 20%, ${color} 30%, #ff9a00 30%, #ff9a00 40%, ${color} 40%, ${color} 50%, #ff9a00 50%, #ff9a00 60%, ${color} 60%, ${color} 70%, #ff9a00 70%, #ff9a00 80%, ${color} 80%, ${color} 90%)`
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
      {highGround && (
        <>
          {/* Top triangle */}
          <div 
            className="high-ground-triangle top"
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '0 5px 5px 5px',
              borderColor: 'transparent transparent #071c30 transparent',
              zIndex: 0,
              pointerEvents: 'none'
            }}
          />
          {/* Bottom triangle */}
          <div 
            className="high-ground-triangle bottom"
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '5px 5px 0 5px',
              borderColor: '#071c30 transparent transparent transparent',
              zIndex: 0,
              pointerEvents: 'none'
            }}
          />
          {/* Left triangle */}
          <div 
            className="high-ground-triangle left"
            style={{
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '5px 5px 5px 0',
              borderColor: 'transparent #071c30 transparent transparent',
              zIndex: 0,
              pointerEvents: 'none'
            }}
          />
          {/* Right triangle */}
          <div 
            className="high-ground-triangle right"
            style={{
              position: 'absolute',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '5px 0 5px 5px',
              borderColor: 'transparent transparent transparent #071c30',
              zIndex: 0,
              pointerEvents: 'none'
            }}
          />
        </>
      )}
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
