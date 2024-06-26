import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../connections/socket'

import Modal from '../components/Modal'
import Board from '../components/Board'
import Tracker from '../components/Tracker'
import Chat from '../components/Chat'
import Log from '../components/Log'

import '../styles/pages/Battle.css'
import { UserContext } from '../context/UserContext'

const Battle = () => {
  // PARAMS
  const params = useParams()

  // USERNAME VARIABLES
  const [user, setUser] = useContext(UserContext)
  const [username, setUsername] = useState('')
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(user.username === '')
  const [inputUsername, setInputUsername] = useState('')

  console.log(user.username)

  // BATTLE VARIABLES
  const [board, setBoard] = useState({})
  const [factionShop, setFactionShop] = useState([])
  const [factions, setFactions] = useState([])
  const [log, setLog] = useState([])
  const [messages, setMessages] = useState([])
  const [unitShop, setUnitShop] = useState([])
  const [units, setUnits] = useState([])
  const [users, setUsers] = useState([]) // TODO add users in the chat

  // USERNAME FUNCTIONS
  const changeInputUsername = (e) => {
    if (/^[a-zA-Z0-9]*$/.test(e.target.value)) {
      setInputUsername(e.target.value)
    }
  }

  const submitUsernameModal = () => {
    setUser({
      ...user,
      username: inputUsername
    })
    setInputUsername('')
    setIsUsernameModalOpen(false)
  }

  // JOIN ROOM
  useEffect(() => {
    if (user.username !== '') {
      if (!socket.connected) {
        socket.connect()
      }
      socket.emit('join-room', { uuid: params.battleuuid, username: user.username })
    }
  }, [user.username, params])

  // SOCKET LISTENERS
  useEffect(() => {
    socket.on('room-joined', (data) => {
      setBoard(data.board)
      setFactionShop(data.factionShop)
      setFactions(data.factions)
      setLog(data.log)
      setMessages(data.messages)
      setUnitShop(data.unitShop)
      setUnits(data.units)
      setUsers(data.users)
    })

    socket.on('board-updated', (data) => {
      setBoard(data.board)
      setLog(data.log)
    })

    return () => {
      socket.off('room-joined')
      socket.off('board-updated')
    }
  }, [])

  // RENDER
  return (
    <div className='page-battle'>
      {user.username !== '' ? (
        <>
          <Board board={board} setBoard={setBoard} units={units} setUnits={setUnits} setLog={setLog} />
          <Tracker setBoard={setBoard} factionShop={factionShop} setFactionShop={setFactionShop} factions={factions} setFactions={setFactions} unitShop={unitShop} units={units} setUnits={setUnits} setLog={setLog} />
          <Log log={log} setLog={setLog} />
          <Chat messages={messages} setMessages={setMessages} setLog={setLog} />
        </>
      ) : null }

      <Modal
        isOpen={isUsernameModalOpen}
        hasCancel={false}
        onSubmit={submitUsernameModal}
      >
        <h3>Choose a username</h3>
        <input
          type='text'
          value={inputUsername}
          onChange={changeInputUsername}
        />
      </Modal>
    </div>
  )
}

export default Battle
