import React, { useContext, useEffect, useState } from 'react'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { formatTimestamp } from '../functions/functions'
import { UserContext } from '../context/UserContext'

import Button from './Button'

import '../styles/components/Chat.css'

const Chat = ({ messages, setMessages, users, setLog }) => {
  //
  const params = useParams()
  const [user, setUser] = useContext(UserContext)
  const [inputMessage, setInputMessage] = useState('')

  const changeInputMessage = (e) => {
    setInputMessage(e.target.value)
  }

  const handlePressEnter = (e) => {
    if (e.key === 'Enter' && inputMessage.trim()) {
      sendMessage()
    }
  }

  const sendMessage = () => {
    if (!inputMessage.trim()) return
    socket.emit('send-message', {
      roomUuid: params.battleuuid,
      username: user.username,
      message: inputMessage
    })
    setInputMessage('')
  }

  useEffect(() => {
    socket.on('message-sent', (data) => {
      setMessages(data.messages)
      setLog(data.log)
    })

    return () => {
      socket.off('message-sent')
    }
  }, [])

  return (
    <div className='chat'>
      <div className='chat-users'>
        {users.map(u => (
          <span key={u.userUuid} style={{ color: u.userColor }}>
            <span className={`status-dot ${u.currentSocketId === '' ? 'dis' : ''}connected`} />
            <span title={u.username}>{u.username}</span>
          </span>
        ))}
      </div>
      <div className='chat-box'>
        {messages.map(m => (
          <p key={m.timestamp}>{formatTimestamp(m.timestamp, 'hh:min:ss')} {m.username === 'System' ? null : `${m.username}:`} {m.message}</p>
        ))}
        <div className='chat-send'>
          <input
            type='text'
            value={inputMessage}
            onChange={changeInputMessage}
            onKeyDown={handlePressEnter}
            />
          <Button color='blue' onClick={sendMessage}>Send</Button>
        </div>
      </div>
    </div>
  )
}

export default Chat
