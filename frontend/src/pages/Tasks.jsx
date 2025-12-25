import { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/projects.css'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'medium',
    projectId: ''
  })
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchProjects()
  }, [])

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tasks`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTasks(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

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
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${import.meta.env.VITE_API_URL}/tasks`,
        newTask,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewTask({ title: '', description: '', priority: 'medium', projectId: '' })
      setShowForm(false)
      fetchTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdateTask = async (taskId, status) => {
    try {
      const token = localStorage.getItem('token')
      await axios.put(
        `${import.meta.env.VITE_API_URL}/tasks/${taskId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  if (loading) return <div className="loading">Loading tasks...</div>

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Tasks</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {showForm && (
        <form className="project-form" onSubmit={handleCreateTask}>
          <select
            value={newTask.projectId}
            onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
            required
          >
            <option value="">Select Project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({...newTask, title: e.target.value})}
            required
          />

          <textarea
            placeholder="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({...newTask, description: e.target.value})}
          />

          <select
            value={newTask.priority}
            onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <button type="submit">Create Task</button>
        </form>
      )}

      <div className="tasks-list">
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <div>
              <h4>{task.title}</h4>
              <p>{task.description}</p>
              <span className={`priority priority-${task.priority || 'medium'}`}>
                {task.priority || 'medium'}
              </span>
            </div>
            <select 
              value={task.status || 'pending'}
              onChange={(e) => handleUpdateTask(task.id, e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <p className="empty-message">No tasks yet. Create one to get started!</p>
      )}
    </div>
  )
}
