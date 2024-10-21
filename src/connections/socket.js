import { io } from 'socket.io-client'

const URL = 'https://tacitus-wargaming-backend.onrender.com/'

export const socket = io(URL, {
  autoConnect: false
})
