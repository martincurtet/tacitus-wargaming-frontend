import React from 'react'

import '../styles/components/Button.css'

const Button = ({ onClick, color='beige', size='medium', children }) => {
  return (
    <div
      className={`button button-${color} ${size}-button`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Button
