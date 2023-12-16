import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '../connections/socket'

import '../styles/pages/Home.css'

const Home = () => {
  // VARIABLES - STATES
  const navigate = useNavigate()

  // FUNCTIONS
  const createRoom = () => {
    socket.connect()
    socket.emit('create-room')
  }

  // SOCKET LISTENERS
  useEffect(() => {
    socket.on('room-created', (data) => {
      navigate(`/${data.uuid}`)
    })

    return () => {
      socket.off('room-created')
    }
  }, [navigate])

  // RENDER
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
