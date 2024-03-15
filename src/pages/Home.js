import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '../connections/socket'

import '../styles/pages/Home.css'

import Button from '../components/Button'

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
      <Button
        onClick={createRoom}
        color='beige'
      >
        Create Room
      </Button>

      <div style={{ height: '50px' }}></div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <Button color='beige' size='large'>Beige</Button>
        <Button color='blue' size='large'>Blue</Button>
        <Button color='green' size='large'>Green</Button>
        <Button color='red' size='large'>Red</Button>
      </div>

      <div style={{ height: '50px' }}></div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <Button color='beige'>Beige</Button>
        <Button color='blue'>Blue</Button>
        <Button color='green'>Green</Button>
        <Button color='red'>Red</Button>
      </div>

      <div style={{ height: '50px' }}></div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        <Button color='beige' size='small'>Beige</Button>
        <Button color='blue' size='small'>Blue</Button>
        <Button color='green' size='small'>Green</Button>
        <Button color='red' size='small'>Red</Button>
      </div>
    </div>
  )
}

export default Home
