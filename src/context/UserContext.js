import React, { createContext, useState } from 'react'

const emptyUserData = {
  userUuid: '',
  username: '',
  userColor: '',
  isUserHost: false
}

const defaultUserData = JSON.parse(localStorage.getItem('twUserData') ?? JSON.stringify(emptyUserData))

const UserContext = createContext()

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(defaultUserData)

  return (
    <UserContext.Provider value={[user, setUser]}>
      {children}
    </UserContext.Provider>
  )
}

export { UserContext, UserProvider }
