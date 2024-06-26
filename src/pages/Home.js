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
    // if (validUsername) {
      socket.connect()
      socket.emit('create-room', { username: inputUsername })
    // }
  }

  // SOCKET LISTENERS
  useEffect(() => {
    socket.on('room-created', (data) => {
      // add user info to context
      setUser({
        ...user,
        username: data.username
      })
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
