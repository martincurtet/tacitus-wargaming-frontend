import React from 'react'

import '../styles/components/Button.css'

const Button = ({ onClick, color='beige', size='medium', circle=false, disabled=false, className='', children }) => {
  return (
    <div
      className={`button button-${color} ${size}-button ${disabled ? 'button-disabled' : ''} ${circle ? 'button-circle' : ''} ${className}`}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </div>
  )
}

export default Button
