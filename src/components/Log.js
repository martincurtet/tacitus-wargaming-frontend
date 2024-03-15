import React, { useEffect } from 'react'
import { socket } from '../connections/socket'
import '../styles/components/Log.css'
import { formatTimestamp } from '../functions/functions'

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
    <div className='log'>
      {log.map(l => (
        <p key={l.timestamp}>[{formatTimestamp(l.timestamp, 'hh:min:ss')}] {l.log}</p>
      ))}
    </div>
  )
}

export default Log
