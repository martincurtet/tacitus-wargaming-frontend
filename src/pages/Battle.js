import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../connections/socket'
import { UserContext } from '../context/UserContext'

import Setup from '../components/Setup'
import Modal from '../components/Modal'
import Board from '../components/Board'
import Tracker from '../components/Tracker'
import Chat from '../components/Chat'
import Log from '../components/Log'

import '../styles/pages/Battle.css'
import Units from '../components/Units'

const Battle = () => {
  // PARAMS
  const params = useParams()
  const DEFAULT_BOARD_ROW_NUMBER = Number(process.env.DEFAULT_BOARD_ROW_NUMBER) || 30
  const DEFAULT_BOARD_COLUMN_NUMBER = Number(process.env.DEFAULT_BOARD_COLUMN_NUMBER) || 30

  // USERNAME VARIABLES
  const [user, setUser] = useContext(UserContext)
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(user.username === '')
  const [inputUsername, setInputUsername] = useState('')

  const [isUserFactionModalOpen, setIsUserFactionModalOpen] = useState(false)
  const [inputUserFaction, setInputUserFaction] = useState('')
  const [inputStratAbility, setInputStratAbility] = useState(0)

  // BATTLE VARIABLES
  const [step, setStep] = useState(1)
  const [boardSize, setBoardSize] = useState({
    'rowNumber': DEFAULT_BOARD_ROW_NUMBER,
    'columnNumber': DEFAULT_BOARD_COLUMN_NUMBER
  })
  const [board, setBoard] = useState({})
  const [factionShop, setFactionShop] = useState([])
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
  
  const handleInputStratAbility = (e) => {
    const stratAbility = parseInt(e.target.value, 10)
    if (!isNaN(stratAbility) && stratAbility >= 0 && stratAbility <= 5) {
      setInputStratAbility(stratAbility)
    }
  }

  const submitUserFactionModal = () => {
    socket.emit('assign-faction', {
      roomUuid: params.battleuuid,
      userUuid: user.userUuid,
      factionCode: inputUserFaction,
      stratAbility: inputStratAbility
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
      setBoardSize(data.boardSize)
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

      {step >= 5 ? (
        <div className='battle'>
          <Board
            board={board} setBoard={setBoard} boardSize={boardSize}
            setUnits={setUnits}
            setLog={setLog}
          />
          {/* <Tracker
            setBoard={setBoard}
            factionShop={factionShop} setFactionShop={setFactionShop} factions={factions} setFactions={setFactions}
            unitShop={unitShop} units={units} setUnits={setUnits}
            setLog={setLog}
          /> */}
          <Units
            setBoard={setBoard}
            factions={factions}
            units={units} setUnits={setUnits}
            setLog={setLog}
          />
          <Log log={log} setLog={setLog} />
          <Chat messages={messages} setMessages={setMessages} users={users} setLog={setLog} />
        </div>
      ): (
        <Setup
          step={step} setStep={setStep}
          board={board} setBoard={setBoard}
          boardSize={boardSize} setBoardSize={setBoardSize}
          users={users} setUsers={setUsers}
          unitShop={unitShop} units={units} setUnits={setUnits}
          factionShop={factionShop} factions={factions} setFactions={setFactions}
          setLog={setLog}
        />
      )}

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
            <option value=''>Spectator</option>
            {factions.map(f => {
              return (
              <option key={f.code} value={f.code}>{f.name}</option>
            )})}
          </select>
        </div>
        {inputUserFaction !== '' && (
          <div>Strategic Ability:
            <input
              type='number'
              value={inputStratAbility}
              onChange={handleInputStratAbility}
              min={1}
              step={1}
              max={5}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}

export default Battle
