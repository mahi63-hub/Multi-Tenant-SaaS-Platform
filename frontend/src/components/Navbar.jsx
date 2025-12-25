import { Link } from 'react-router-dom'
import '../styles/navbar.css'

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>📊 SaaS Platform</h2>
        </Link>

        <div className="navbar-menu">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/projects" className="nav-link">Projects</Link>
          <Link to="/tasks" className="nav-link">Tasks</Link>
        </div>

        <div className="navbar-user">
          <span className="user-name">{user?.fullName}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  )
}
