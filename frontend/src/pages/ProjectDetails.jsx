import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, Calendar, CheckCircle, Clock, Trash2, Plus, 
  MoreVertical, Activity, AlertCircle, Save, X 
} from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', status: 'todo' });
  const [loading, setLoading] = useState(true);

  const fetchProjectData = async () => {
    try {
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data.data);
      
      const tasksRes = await api.get(`/tasks?projectId=${id}`); 
      setTasks(tasksRes.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load project details');
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjectData(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if(!newTask.title.trim()) return;
    try {
      await api.post('/tasks', { ...newTask, projectId: id });
      toast.success('Task added successfully');
      setNewTask({ title: '', status: 'todo' });
      setShowTaskForm(false);
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    // Optimistic UI update (optional, but makes it feel faster)
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      toast.success(`Task marked as ${newStatus.replace('_', ' ')}`);
      fetchProjectData(); // Sync to be sure
    } catch (error) {
      toast.error('Failed to update status');
      fetchProjectData(); // Revert on error
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchProjectData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  // Calculate Progress
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-slate-50 text-slate-500">
      <div className="flex flex-col items-center animate-pulse">
        <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-medium">Loading Project...</p>
      </div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen flex justify-center items-center bg-slate-50">
        <div className="text-center">
            <h2 className="text-xl font-bold text-slate-700">Project Not Found</h2>
            <Link to="/projects" className="text-indigo-600 hover:underline mt-2 inline-block">Return to Projects</Link>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Breadcrumb / Back Link */}
        <Link 
            to="/projects" 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group"
        >
            <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" /> 
            Back to Projects
        </Link>

        {/* Project Header Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          {/* Decorative Background Icon */}
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <Activity className="h-48 w-48 text-indigo-600 transform rotate-12 translate-x-10 -translate-y-10" />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{project.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                        project.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                        {project.status}
                    </span>
                </div>
                <p className="text-slate-500 text-lg max-w-2xl">{project.description || "No description provided."}</p>
              </div>
              
              <div className="flex items-center text-sm font-medium text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                Created {new Date(project.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Progress Section */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <span className="text-2xl font-bold text-indigo-600">{completedCount}</span>
                        <span className="text-slate-400 text-sm font-medium"> / {tasks.length} tasks completed</span>
                    </div>
                    <span className="text-indigo-600 font-bold">{progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2.5 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>
          </div>
        </div>

        {/* Tasks Section Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-indigo-500" /> 
            Project Tasks
          </h2>
          {!showTaskForm && (
              <button 
                onClick={() => setShowTaskForm(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 text-sm font-bold"
              >
                <Plus className="h-4 w-4" /> Add New Task
              </button>
          )}
        </div>

        {/* Inline Task Creation Form */}
        {showTaskForm && (
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100 ring-4 ring-indigo-50/50 animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700">Create New Task</h3>
                <button onClick={() => setShowTaskForm(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                </button>
            </div>
            <form onSubmit={handleCreateTask} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input 
                  autoFocus
                  className="w-full border-slate-200 bg-slate-50 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  required
                />
              </div>
              <div className="flex gap-3">
                <select 
                    className="border-slate-200 bg-slate-50 text-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
                    value={newTask.status}
                    onChange={(e) => setNewTask({...newTask, status: e.target.value})}
                >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                </select>
                <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2">
                    <Save className="h-4 w-4" /> Save
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Task List */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div 
                key={task.id} 
                className={`group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                    task.status === 'done' 
                    ? 'bg-slate-50 border-slate-100 opacity-75 hover:opacity-100' 
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200'
                }`}
            >
              <div className="flex items-center gap-4 mb-3 sm:mb-0">
                {/* Status Icon */}
                <button 
                    onClick={() => handleUpdateStatus(task.id, task.status === 'done' ? 'todo' : 'done')}
                    className={`flex-shrink-0 p-2 rounded-lg transition-all duration-300 ${
                    task.status === 'done' 
                        ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
                        : task.status === 'in_progress' 
                        ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                >
                  {task.status === 'done' ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                </button>

                {/* Task Content */}
                <div>
                  <p className={`font-medium text-base transition-all ${
                      task.status === 'done' ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'
                  }`}>
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                     {task.status === 'done' ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="relative">
                    <select 
                    className="appearance-none bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wide rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer hover:bg-white transition-colors"
                    value={task.status}
                    onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                    >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                    </select>
                    <MoreVertical className="h-3 w-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

                <button 
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all"
                  title="Delete Task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {tasks.length === 0 && !showTaskForm && (
            <div className="text-center py-12 px-6 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                 <CheckCircle className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-bold text-lg">No tasks yet</h3>
              <p className="text-slate-500 mb-6 max-w-sm mx-auto">Get started by breaking this project down into smaller, manageable tasks.</p>
              <button 
                onClick={() => setShowTaskForm(true)}
                className="text-indigo-600 font-bold hover:text-indigo-700 flex items-center justify-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" /> Create First Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}