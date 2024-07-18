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

  const [isUserFactionModalOpen, setIsUserFactionModalOpen] = useState(false)
  const [inputUserFaction, setInputUserFaction] = useState('')

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

  // USER FACTION MODAL
  const openUserFactionModal = () => {
    setIsUserFactionModalOpen(true)
  }

  const closeUserFactionModal = () => {
    setIsUserFactionModalOpen(false)
  }

  const handleUserFactionChange = (e) => {
    setInputUserFaction(e.target.value)
  }

  const submitUserFactionModal = () => {
    console.log(`sending assign faction`)
    socket.emit('assign-faction', {
      roomUuid: params.battleuuid,
      userUuid: user.userUuid,
      factionCode: inputUserFaction
    })
  }
  
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

  useEffect(() => {
    if (step > 1 && !isUsernameModalOpen && !user.isSpectator && user.userFaction === '') {
      openUserFactionModal()
    }
  }, [user])

  // SOCKET LISTENERS
  useEffect(() => {
    socket.on('room-joined', (data) => {
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
        ...user,
        userUuid: data.userUuid,
        username: data.username,
        userColor: data.userColor,
        isHost: data.isHost,
        isSpectator: data.isSpectator
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

  useEffect(() => {
    socket.on('faction-assigned', (data) => {
      console.log(`received faction assigned`)
      let assignedUser = data.users.find(u => u.userUuid === user.userUuid)
      setUser({
        ...user,
        userFaction: assignedUser.faction,
        isSpectator: assignedUser.faction === ''
      })
      setUsers(data.users)
      setFactions(data.factions)
      setLog(data.log)
      // setInputStratAbility(() => {
      //   const initialState = {}
      //   data.users.forEach(u => {
      //     initialState[u.userUuid] = parseInt(u.stratAbility) || 0
      //   })
      //   return initialState
      // })
      closeUserFactionModal()
    })

    return () => {
      socket.off('faction-assigned')
    }
  }, [user, setUser])

  // RENDER
  return (
    <div className='page-battle'>
      {/* <div>Battle Page</div> */}
      {/* <div>Context:
        <p>{user.userUuid || 'no userUuid'}</p>
        <p>{user.username || 'no username'}</p>
        <p>{user.userColor || 'no color'}</p>
        <p>{user.isHost ? 'host' : 'player'}</p>
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
        unitShop={unitShop} units={units} setUnits={setUnits}
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

      <Modal
        isOpen={isUserFactionModalOpen}
        hasCancel={false}
        onSubmit={submitUserFactionModal}
      >
        <div>Select a faction:
          <select onChange={handleUserFactionChange}>
            <option value='' disabled selected>Select a faction</option>
            {factions.map(f => {
              return (
              <option key={f.code} value={f.code}>{f.name}</option>
            )})}
          </select>
        </div>
      </Modal>
    </div>
  )
}

export default Battle
