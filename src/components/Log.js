import React, { useEffect } from 'react'
import { formatTimestamp } from '../functions/functions'

import { socket } from '../connections/socket'
import { useParams } from 'react-router-dom'

import Button from './Button'
import '../styles/components/Log.css'

const Log = ({ log }) => {
  //
  const params = useParams()

  // const handleDownload = () => {
  //   socket.emit('download-file', {
  //     roomUuid: params.battleuuid
  //   })
  // }

  useEffect(() => {
    socket.on('file-downloaded', (data) => {
      const jsonData = JSON.stringify(data.room)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = 'data.json'
      link.href = url
      link.click()
      URL.revokeObjectURL(url)
    })

    return () => {
      socket.off('file-downloaded')
    }
  }, [])

  // RENDER
  return (
    <div className='log'>
      {log.map(l => (
        <p>[{formatTimestamp(l.timestamp, 'hh:min:ss')}] {l.log}</p>
      ))}
      {/* <Button
        onClick={handleDownload}
      >
        Download
      </Button> */}
    </div>
  )
}

export default Log
