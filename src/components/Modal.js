import React from 'react'
import '../styles/components/Modal.css'
import Button from './Button'

const Modal = ({ isOpen, hasCancel=true, onCancel, cancelColor='blue', cancelText='Cancel', onSubmit, submitColor='green', submitText='Submit', children }) => {
  return isOpen ? (
    <div className='modal-overlay'>
      <div className='modal'>
        {children}
        <div className='modal-buttons'>
          {hasCancel && <Button color='blue' onClick={onCancel}>{cancelText}</Button>}
          <Button
            color={submitColor}
            onClick={onSubmit}
          >
            {submitText}
          </Button>
        </div>
      </div>
    </div>
  ) : null
}

export default Modal