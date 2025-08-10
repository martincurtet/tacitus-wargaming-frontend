import React from 'react'
import { useDroppable } from '@dnd-kit/core'

const Droppable = ({ id, children, className='', style={} }) => {
  const { isOver, setNodeRef } = useDroppable({ id: id })

  const mergedStyle = {
    color: isOver ? 'green' : undefined,
    ...style
  }

  return (
    <div id={id} ref={setNodeRef} className={className} style={mergedStyle} >
      {children}
    </div>
  )
}

export default Droppable
