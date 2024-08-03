import React, { useContext, useEffect, useState } from 'react'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { formatTimestamp } from '../functions/functions'
import { UserContext } from '../context/UserContext'

import Button from './Button'

import '../styles/components/Chat.css'

const Chat = ({ messages, setMessages, setLog }) => {
  //
  const params = useParams()
  const [user, setUser] = useContext(UserContext)
  const [inputMessage, setInputMessage] = useState('')

  const changeInputMessage = (e) => {
    setInputMessage(e.target.value)
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
      {messages.map(m => (
        <p key={m.timestamp}>{formatTimestamp(m.timestamp, 'hh:min:ss')} {m.username === 'System' ? null : `${m.username}:`} {m.message}</p>
      ))}
      <div className='chat-send'>
        <input
          type='text'
          value={inputMessage}
          onChange={changeInputMessage}
        />
        <Button color='blue' onClick={sendMessage}>Send</Button>
      </div>
    </div>
  )
}

export default Chat
