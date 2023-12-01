import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../connections/socket'
import Modal from '../components/Modal'
import Board from '../components/Board'
import '../styles/pages/Battle.css'
import Tracker from '../components/Tracker'
import Chat from '../components/Chat'
import Log from '../components/Log'

const Battle = () => {
  //
  const params = useParams()

  // USERNAME VARIABLES
  const [username, setUsername] = useState('')
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(true)
  const [inputUsername, setInputUsername] = useState('Tacitus')

  // BATTLE VARIABLES
  const [board, setBoard] = useState({})
  const [factions, setFactions] = useState([])
  const [log, setLog] = useState([])
  const [messages, setMessages] = useState([])
  const [unitShop, setUnitShop] = useState([])
  const [units, setUnits] = useState([])
  const [users, setUsers] = useState([])

  // USERNAME FUNCTIONS
  const changeInputUsername = (e) => {
    if (/^[a-zA-Z0-9]*$/.test(e.target.value)) {
      setInputUsername(e.target.value)
    }
  }

  const submitUsernameModal = () => {
    if(inputUsername.length > 0 && inputUsername.length <= 20) {
      setUsername(inputUsername)
      setInputUsername('')
      setIsUsernameModalOpen(false)
    }
  }

  useEffect(() => {
    if (username !== '') {
      if (!socket.connected) {
        socket.connect()
      }
      socket.emit('join-room', { uuid: params.battleuuid, username: username })
    }
  }, [username, params])

  // SOCKET LISTENERS
  useEffect(() => {
    socket.on('room-joined', (data) => {
      setBoard(data.board)
      setFactions(data.factions)
      setLog(data.log)
      setMessages(data.messages)
      setUnitShop(data.unitShop)
      setUnits(data.units)
      setUsers(data.users)
    })

    socket.on('board-updated', (data) => {
      setBoard(data.board)
    })

    return () => {
      socket.off('room-joined')
      socket.off('board-updated')
    }
  }, [])

  // RENDER
  return (
    <div className='page-battle'>
      {username !== '' ? (
        <>
          <Board board={board} setBoard={setBoard} />
          <Tracker factions={factions} setFactions={setFactions} unitShop={unitShop} units={units} setUnits={setUnits} />
          <Log log={log} setLog={setLog} />
          <Chat messages={messages} setMessages={setMessages} />
        </>
      ) :  null }
      <Modal
        isOpen={isUsernameModalOpen}
        hasCancel={false}
        onSubmit={submitUsernameModal}
      >
        <div>Choose a username</div>
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
