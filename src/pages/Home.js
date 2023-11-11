import React from 'react'
import { socket } from '../connections/socket'
import '../styles/pages/Home.css'

const Home = () => {
  const createRoom = () => {
    socket.connect()
  }

  return (
    <div className='page-home'>
      <h1>Tacitus Wargaming</h1>
      <button
        onClick={createRoom}
      >
        Create Room
      </button>
    </div>
  )
}

export default Home
