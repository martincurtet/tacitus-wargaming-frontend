import React from 'react'

import Droppable from './dndComponents/Droppable'
import Draggable from './dndComponents/Draggable'
import UnitIcon from './UnitIcon'

import '../styles/components/Tile.css'

const Tile = ({
    content, coordinates, highlighted, color,
    setStartingTile=()=>{}, setFinishingTile=()=>{}, setSelectedTile=()=>{},
    unitIconName, factionIconName, veterancyIconName,
    markerColor, handleToggleMarker=()=>{}, handleToggleFire=()=>{}, fire,
    identifier, identifierColor, terrain,
    painting=false
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

  const tileStyle = markerColor ? {
    background: `linear-gradient(45deg, ${color} 90%, ${markerColor} 90%)`,
    '--base-background': `linear-gradient(45deg, ${color} 90%, ${markerColor} 90%)`
  } : {
    background: color,
    '--base-background': color
  }

  const parseTerrainTokens = () => {
    if (!terrain || typeof terrain !== 'string') return []
    return terrain.split(/[+,]/).map(t => t.trim()).filter(Boolean)
  }

  const renderOverlays = () => {
    const tokens = parseTerrainTokens()

    const overlays = []

    // Fire active if either server flag or token present
    const fireActive = fire || tokens.includes('fire')

    // Fire as an underlay within overlays stack
    if (fireActive) {
      overlays.push(<div key='fire' className='overlay-fire' />)
    }

    if (tokens.length === 0) return <div className='tile-overlays'>{overlays}</div>

    const hasHigh2 = tokens.includes('high-ground-2')
    const hasHigh1 = tokens.includes('high-ground') && !hasHigh2
    const hasLow2 = tokens.includes('low-ground-2')
    const hasLow1 = tokens.includes('low-ground') && !hasLow2
    const hasImpR = tokens.includes('impassable-r')
    const hasImpB = tokens.includes('impassable-b')

    if (hasHigh2) {
      overlays.push(
        <div key='hg2-left' className='overlay-tri-bottom offset-left' />,
        <div key='hg2-right' className='overlay-tri-bottom offset-right' />
      )
    } else if (hasHigh1) {
      overlays.push(<div key='hg1' className='overlay-tri-bottom' />)
    }

    if (hasLow2) {
      overlays.push(
        <div key='lg2-left' className='overlay-tri-top offset-left' />,
        <div key='lg2-right' className='overlay-tri-top offset-right' />
      )
    } else if (hasLow1) {
      overlays.push(<div key='lg1' className='overlay-tri-top' />)
    }

    if (hasImpR) overlays.push(<div key='imp-r' className='overlay-stripe-right' />)
    if (hasImpB) overlays.push(<div key='imp-b' className='overlay-stripe-bottom' />)

    return <div className='tile-overlays'>{overlays}</div>
  }

  // RENDER
  return (
    <div
      id={coordinates}
      className={`tile ${highlighted ? 'red' : 'grey'}-border`}
      style={tileStyle}
      onMouseDown={() => { if (painting) setStartingTile(coordinates) }}
      onMouseUp={() => { if (painting) setFinishingTile(coordinates) }}
      onDoubleClick={() => setSelectedTile(coordinates)}
      onClick={handleClick}
    >
      {renderOverlays()}
      <div className='tile-content'>
        {content !== '' ? (
          content
        ) : (
          <Droppable id={coordinates} className='droppable-fill'>
            <div>
              {unitIconName !== undefined && unitIconName !== '' ? (
                <Draggable id={coordinates}>
                  <div onMouseDown={() => setSelectedTile(coordinates)}>
                    <UnitIcon
                      unitIconName={unitIconName}
                      factionIconName={factionIconName}
                      veterancyIconName={veterancyIconName}
                      markerColor={markerColor}
                      handleClick={handleClick}
                      identifier={identifier} identifierColor={identifierColor}
                    />
                  </div>
                </Draggable>
              ) : null}
            </div>
          </Droppable>
        )}
      </div>
    </div>
  )
}

export default Tile
