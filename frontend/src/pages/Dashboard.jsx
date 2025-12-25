import { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/dashboard.css'

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    teamMembers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const [projectsRes, tasksRes, usersRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/projects`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/tasks`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/users`, { headers })
      ])

      const completedTasks = tasksRes.data.data.filter(t => t.status === 'completed').length

      setStats({
        totalProjects: projectsRes.data.count || 0,
        totalTasks: tasksRes.data.count || 0,
        completedTasks,
        teamMembers: usersRes.data.count || 0
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading">Loading dashboard...</div>

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user?.fullName}!</h1>
        <p>Here's an overview of your organization</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p className="stat-value">{stats.totalProjects}</p>
        </div>

        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p className="stat-value">{stats.totalTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <p className="stat-value">{stats.completedTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Team Members</h3>
          <p className="stat-value">{stats.teamMembers}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <a href="/projects" className="btn btn-primary">View Projects</a>
          <a href="/tasks" className="btn btn-secondary">View Tasks</a>
        </div>
      </div>
    </div>
  )
}
