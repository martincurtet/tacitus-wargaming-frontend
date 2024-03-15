import React from 'react'
import '../styles/components/Modal.css'
import Button from './Button'

const Modal = ({ isOpen, hasCancel=true, onCancel, onSubmit, children }) => {
  return isOpen ? (
    <div className='modal-overlay'>
      <div className='modal'>
        {children}
        <div className='modal-buttons'>
          {hasCancel && <Button color='blue' onClick={onCancel}>Cancel</Button>}
          <Button
            color='green'
            onClick={onSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  ) : null
}

export default Modal