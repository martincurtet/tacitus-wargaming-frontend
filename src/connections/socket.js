import { io } from 'socket.io-client'

const URL = 'https://luminous-crumble-c87247.netlify.app'

export const socket = io(URL, {
  autoConnect: false
})
