import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import Home from './pages/Home'
import Battle from './pages/Battle'

import './styles/index.css'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
      <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />}/>
          <Route path='/:battleuuid' element={<Battle />}/>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
)
