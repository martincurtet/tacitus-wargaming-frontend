import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../connections/socket'
import { UserContext } from '../context/UserContext'

import Setup from '../components/Setup'
import Modal from '../components/Modal'
// import Board from '../components/Board'
// import Tracker from '../components/Tracker'
// import Chat from '../components/Chat'
// import Log from '../components/Log'

import '../styles/pages/Battle.css'

const Battle = () => {
  // PARAMS
  const params = useParams()

  // USERNAME VARIABLES
  const [user, setUser] = useContext(UserContext)
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(user.username === '')
  const [inputUsername, setInputUsername] = useState('')

  // BATTLE VARIABLES
  const [step, setStep] = useState(1)
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

  // LOAD LOCAL DATA
  // useEffect(() => {
  //   if (user.userUuid !== '') {
  //     const twUserData = JSON.parse(sessionStorage.getItem('twUserData'))
  //     setUser(twUserData)
  //   }
  // }, [])

  // JOIN ROOM
  useEffect(() => {
    if (user.username !== '') {
      if (!socket.connected) {
        socket.connect()
      }
      socket.emit('join-room', {
        roomUuid: params.battleuuid,
        userUuid: user.userUuid,
        username: user.username
      })
    }
  }, [user.username, params])

  // SOCKET LISTENERS
  useEffect(() => {
    socket.on('room-joined', (data) => {
      // Set Local Data
      sessionStorage.setItem('twUserData', JSON.stringify({
        userUuid: data.userUuid,
        username: data.username,
        userColor: data.userColor,
        isUserHost: data.isUserHost
      }))
      // Set Context Data
      setUser({
        ...user,
        userUuid: data.userUuid,
        username: data.username,
        userColor: data.userColor,
        isUserHost: data.isUserHost
      })
      // Set State Data
      setStep(data.step)
      setBoard(data.board)
      setFactionShop(data.factionShop)
      setFactions(data.factions)
      setLog(data.log)
      setMessages(data.messages)
      setUnitShop(data.unitShop)
      setUnits(data.units)
      setUsers(data.users)
    })

    socket.on('user-joined', (data) => {
      setMessages(data.messages)
      setUsers(data.users)
      setLog(data.log)
    })

    socket.on('user-left', (data) => {
      setMessages(data.messages)
      setUsers(data.users)
      setLog(data.log)
    })

    // socket.on('board-updated', (data) => {
    //   setBoard(data.board)
    //   setLog(data.log)
    // })

    return () => {
      socket.off('room-joined')
      socket.off('user-joined')
      socket.off('user-left')
      // socket.off('board-updated')
    }
  }, [])

  // RENDER
  return (
    <div className='page-battle'>
      {/* <div>Battle Page</div> */}
      {/* <div>Context:
        <p>{user.userUuid || 'no userUuid'}</p>
        <p>{user.username || 'no username'}</p>
        <p>{user.userColor || 'no color'}</p>
        <p>{user.isUserHost ? 'host' : 'player'}</p>
      </div> */}
      {/* {user.username !== '' ? (
        <>
          <Board board={board} setBoard={setBoard} units={units} setUnits={setUnits} setLog={setLog} />
          <Tracker setBoard={setBoard} factionShop={factionShop} setFactionShop={setFactionShop} factions={factions} setFactions={setFactions} unitShop={unitShop} units={units} setUnits={setUnits} setLog={setLog} />
          <Log log={log} setLog={setLog} />
          <Chat messages={messages} setMessages={setMessages} setLog={setLog} />
        </>
      ) : null } */}

      <Setup
        step={step} setStep={setStep}
        users={users} setUsers={setUsers}
        factionShop={factionShop} factions={factions} setFactions={setFactions}
        setLog={setLog}
      />

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
