import React from 'react'

import '../styles/components/Button.css'

const Button = ({ onClick, color='beige', size='medium', disabled=false, children }) => {
  return (
    <div
      className={`button button-${color} ${size}-button ${disabled ? 'button-disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  )
}

export default Button
