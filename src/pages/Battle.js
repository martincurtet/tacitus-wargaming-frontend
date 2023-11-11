import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { socket } from '../connections/socket'
import Modal from '../components/Modal'

const Battle = () => {
  const params = useParams()

  // USERNAME VARIABLES
  const [username, setUsername] = useState('')
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(true)
  const [inputUsername, setInputUsername] = useState('Tacitus')

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

  return (
    <div>
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
