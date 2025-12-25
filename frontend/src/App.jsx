import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import './styles/global.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (token && storedUser) {
      setIsAuthenticated(true)
      setUser(JSON.parse(storedUser))
    }
    
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <BrowserRouter>
      {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Dashboard user={user} /></ProtectedRoute>} 
        />
        <Route 
          path="/projects" 
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Projects user={user} /></ProtectedRoute>} 
        />
        <Route 
          path="/tasks" 
          element={<ProtectedRoute isAuthenticated={isAuthenticated}><Tasks user={user} /></ProtectedRoute>} 
        />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
