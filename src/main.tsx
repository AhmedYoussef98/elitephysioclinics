import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { ClinicHoursProvider } from './context/ClinicHoursContext'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <ClinicHoursProvider>
        <App />
      </ClinicHoursProvider>
    </AuthProvider>
  </BrowserRouter>
)
