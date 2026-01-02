import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Folder, Calendar, User, Trash2, X, Search, LayoutGrid } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    
    try {
      await api.post('/projects', newProject);
      toast.success('Project Created Successfully!');
      setNewProject({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (error) {
      toast.error('Error creating project');
    }
  };

  const handleDelete = async (e, projectId) => {
    e.preventDefault(); // Stop clicking the card link
    e.stopPropagation(); 
    
    if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project Deleted');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Projects</h1>
            <p className="text-slate-500 mt-2 text-lg">Manage and track your ongoing work.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 font-bold shadow-sm ${
              showForm 
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/30'
            }`}
          >
            {showForm ? (
              <><X className="h-5 w-5" /> Cancel</>
            ) : (
              <><Plus className="h-5 w-5" /> New Project</>
            )}
          </button>
        </div>

        {/* Create Form (Slide Down Animation) */}
        {showForm && (
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-indigo-100 ring-4 ring-indigo-50/50 animate-in slide-in-from-top-4 fade-in duration-300 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Folder className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Create New Project</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Project Name</label>
                <input 
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-lg rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
                  placeholder="e.g. Website Redesign Q4"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 min-h-[100px]"
                  placeholder="Briefly describe the project goals..."
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end pt-2">
                <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-64 bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                        <div className="h-12 w-12 bg-slate-100 rounded-xl mb-4"></div>
                        <div className="h-6 bg-slate-100 rounded w-3/4 mb-3"></div>
                        <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
                        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        ) : (
        <>
            {/* Projects Grid */}
            {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                <Link to={`/projects/${project.id}`} key={project.id} className="group block h-full">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:shadow-indigo-100 hover:border-indigo-200 transition-all duration-300 h-full flex flex-col relative transform hover:-translate-y-1">
                    
                    {/* Top Section */}
                    <div className="flex justify-between items-start mb-5">
                        <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl shadow-md flex items-center justify-center text-white font-bold text-lg">
                            {project.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                                project.status === 'active' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                                {project.status}
                            </span>
                            
                            {/* Delete Button - Z-index ensures it's clickable above the link */}
                            <button 
                                onClick={(e) => handleDelete(e, project.id)}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all z-20 opacity-0 group-hover:opacity-100"
                                title="Delete Project"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">{project.name}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">{project.description || "No description provided."}</p>
                    
                    {/* Footer */}
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
                            <User className="h-3.5 w-3.5 text-indigo-400" />
                            {project.creator?.fullName || 'User'}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                    </div>
                </Link>
                ))}
            </div>
            ) : (
                /* Empty State */
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="bg-indigo-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <LayoutGrid className="h-10 w-10 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">No projects yet</h3>
                    <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto">Your workspace is empty. Create your first project to start tracking tasks and progress.</p>
                    <button 
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5"
                    >
                        <Plus className="h-5 w-5" /> Create Project
                    </button>
                </div>
            )}
        </>
        )}
      </div>
    </div>
  );
}