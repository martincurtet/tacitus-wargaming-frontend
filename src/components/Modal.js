import React from 'react'
import '../styles/components/Modal.css'

const Modal = ({ isOpen, hasCancel=true, onCancel, onSubmit, children }) => {
  return isOpen ? (
    <div className='modal-overlay'>
      <div className='modal'>
        {children}
        <div className='modal-buttons'>
          {hasCancel && <button onClick={onCancel}>Cancel</button>}
          <button onClick={onSubmit}>Submit</button>
        </div>
      </div>
    </div>
  ) : null
}

export default Modal