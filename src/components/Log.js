import React, { useEffect } from 'react'
import { socket } from '../connections/socket'

const Log = ({ log, setLog }) => {
  // useEffect(() => {
  //   socket.on('log-updated', (data) => {
  //     setLog(data.log)
  //   })

  //   return () => {
  //     socket.off('log-updated')
  //   }
  // }, [])
  return (
    <div>
      {log.map(l => (
        <p key={l.timestamp}>{l.log}</p>
      ))}
    </div>
  )
}

export default Log
