import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '../connections/socket'
import { UserContext } from '../context/UserContext'

import Button from '../components/Button'

import '../styles/pages/Home.css'
import '../styles/components/Select.css'

const Home = () => {
  // VARIABLES - STATES
  const navigate = useNavigate()
  const [user, setUser] = useContext(UserContext)
  const [inputUsername, setInputUsername] = useState('')
  const [validUsername, setValidUsername] = useState(false)
  const [userTyped, setUserTyped] = useState(false)

  // FUNCTIONS
  const changeInputUsername = (e) => {
    let value = e.target.value
    if (!userTyped) {
      setUserTyped(true)
    }
    if (/^[a-zA-Z0-9]*$/.test(value) && value !== '') {
      setValidUsername(true)
    } else {
      setValidUsername(false)
    }
    setInputUsername(value)
  }

  const createRoom = () => {
    socket.connect()
    socket.emit('create-room', { username: inputUsername })
  }

  // SOCKET LISTENERS
  useEffect(() => {
    socket.on('room-created', (data) => {
      // Set Local Data
      sessionStorage.setItem('twUserData', JSON.stringify({
        userUuid: data.userUuid,
        username: data.username,
        userColor: data.userColor,
        isHost: data.isHost,
        isSpectator: data.isSpectator
      }))
      // Set Context Data
      setUser({
        userUuid: data.userUuid,
        username: data.username,
        userColor: data.userColor,
        isHost: data.isHost,
        isSpectator: data.isSpectator
      })
      navigate(`/${data.roomUuid}`)
    })

    return () => {
      socket.off('room-created')
    }
  }, [])

  // RENDER
  return (
    <div className='page-home'>
      <h1>Tacitus Wargaming</h1>
      <div className='home-username'>
        <p>Choose a username</p>
        <input
          type='text'
          value={inputUsername}
          onChange={changeInputUsername}
        />
        {userTyped && !validUsername && (
          <p>Invalid Username</p>
        )}
      </div>
      <Button
        onClick={createRoom}
        disabled={!validUsername}
        color='beige'
      >
        Create Room
      </Button>
    </div>
  )
}

export default Home
