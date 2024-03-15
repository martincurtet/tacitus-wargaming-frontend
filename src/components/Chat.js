import React, { useEffect, useState } from 'react'
import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'
import { formatTimestamp } from '../functions/functions'

import '../styles/components/Chat.css'

const Chat = ({ messages, setMessages, setLog }) => {
  const params = useParams()
  const [inputMessage, setInputMessage] = useState('')

  const changeInputMessage = (e) => {
    setInputMessage(e.target.value)
  }

  const sendMessage = () => {
    socket.emit('send-message', { uuid: params.battleuuid, message: inputMessage })
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
      <input
        type='text'
        value={inputMessage}
        onChange={changeInputMessage}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  )
}

export default Chat
