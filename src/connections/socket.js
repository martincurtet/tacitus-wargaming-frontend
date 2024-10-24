import { io } from 'socket.io-client'

const ENV = process.env.REACT_APP_ENVIRONMENT

const URL = ENV === 'PROD' ? process.env.REACT_APP_SERVER_URL_PROD : process.env.REACT_APP_SERVER_URL_DEV

export const socket = io(URL, {
  autoConnect: false
})
