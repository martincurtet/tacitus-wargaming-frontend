import React from 'react'
import Tile from './Tile'

import '../styles/components/SetupBoard.css'

const SetupBoard = ({}) => {
  //
  const MAX_GRID_SIZE = Number(process.env.REACT_APP_MAX_GRID_SIZE) || 60

  // RENDER
  return (
    <div className='setup-board'>
      <div>
        <label>Number of rows</label>
        <input
          type='number'
          // value={}
          // onChange={}
          min={1}
          max={MAX_GRID_SIZE}
          step={1}
        />
        <label>Number of columns</label>
        <input
          type='number'
          // value={}
          // onChange={}
          min={1}
          max={MAX_GRID_SIZE}
          step={1}
        />
      </div>
      <div>
        <select
          // onChange={e => setInputTerrain(e.target.value)}
          // value={inputTerrain}
        >
          <option value='plains'>Plains</option>
          <option value='forest'>Forest</option>
          <option value='mud'>Mud</option>
          <option value='jungle'>Jungle</option>
          <option value='undergrowth'>Undergrowth</option>
          <option value='marsh'>Marsh</option>
          <option value='high-ground'>High Ground</option>
          <option value='shallow-water'>Shallow Water</option>
          <option value='deep-water'>Deep Water</option>
          <option value='fire'>Fire</option>
          <option value='road'>Road</option>
        </select>
      </div>
      <div className='board-grid'>
        <Tile content={''} icon={'Archer_1.png'} />
        <Tile content={''} icon={'Archer_1.png'} />
        <Tile content={''} icon={'Archer_1.png'} />
        <Tile content={''} icon={'Archer_1.png'} />
        <Tile content={''} icon={'Archer_1.png'} />
        <Tile content={''} icon={'Archer_1.png'} />
        <Tile content={''} icon={'Archer_1.png'} />
        <Tile content={''} icon={'Archer_1.png'} />
        <Tile content={''} icon={'Archer_1.png'} />
      </div>
    </div>
  )
}

export default SetupBoard
