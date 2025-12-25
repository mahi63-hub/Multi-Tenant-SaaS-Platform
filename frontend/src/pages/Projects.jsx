import { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/projects.css'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/projects`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setProjects(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${import.meta.env.VITE_API_URL}/projects`,
        newProject,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewProject({ name: '', description: '' })
      setShowForm(false)
      fetchProjects()
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  if (loading) return <div className="loading">Loading projects...</div>

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Projects</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {showForm && (
        <form className="project-form" onSubmit={handleCreateProject}>
          <input
            type="text"
            placeholder="Project name"
            value={newProject.name}
            onChange={(e) =>
              setNewProject({ ...newProject, name: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Description"
            value={newProject.description}
            onChange={(e) =>
              setNewProject({ ...newProject, description: e.target.value })
            }
          />
          <button type="submit">Create Project</button>
        </form>
      )}

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <span className="project-status">{project.status || 'active'}</span>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <p className="empty-message">
          No projects yet. Create one to get started!
        </p>
      )}
    </div>
  )
}
