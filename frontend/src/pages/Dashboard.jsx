import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { Folder, CheckCircle, Clock, Plus, Activity, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    activeProjects: 0, 
    completedTasks: 0, 
    pendingTasks: 0 
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- SAFE USER PARSING ---
  let user = { fullName: 'User' };
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      user = JSON.parse(storedUser);
    }
  } catch (err) {
    console.warn("Corrupted user data in Dashboard, using default.");
  }
  // -------------------------

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch Projects
        const projectsRes = await api.get('/projects');
        const projects = projectsRes.data.data || [];

        // Simple Stats Calculation
        const activeProjects = projects.filter(p => p.status === 'active').length;
        
        setStats({
          activeProjects,
          completedTasks: 0, // Placeholder logic kept as is
          pendingTasks: 0    
        });

        setRecentProjects(projects.slice(0, 3)); 
        setLoading(false);
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        if (err.response && err.response.status !== 401) {
            setError("Failed to load dashboard data.");
        }
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center bg-slate-50 text-slate-500">
      <div className="flex flex-col items-center animate-pulse">
        <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="font-medium">Loading Dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="p-6 max-w-4xl mx-auto mt-10">
      <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3">
        <Activity className="h-5 w-5" />
        {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{user.fullName}</span> 👋
            </h1>
            <p className="text-slate-500 mt-2 text-lg">Here's an overview of your workspace.</p>
          </div>
          <Link 
            to="/projects" 
            className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 font-medium"
          >
            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" /> 
            New Project
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Projects Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Folder className="h-24 w-24 text-indigo-600 transform rotate-12 translate-x-4 -translate-y-4" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Folder className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Active Projects</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.activeProjects}</h3>
              </div>
            </div>
          </div>

          {/* Completed Tasks Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <CheckCircle className="h-24 w-24 text-emerald-600 transform rotate-12 translate-x-4 -translate-y-4" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Completed</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.completedTasks}</h3>
              </div>
            </div>
          </div>

          {/* Pending Tasks Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Clock className="h-24 w-24 text-amber-500 transform rotate-12 translate-x-4 -translate-y-4" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium uppercase tracking-wide">Pending</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-1">{stats.pendingTasks}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" /> Recent Activity
            </h2>
            <Link to="/projects" className="text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="p-4">
            {recentProjects.length > 0 ? (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link to={`/projects/${project.id}`} key={project.id} className="block group">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
                          {project.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors text-base">{project.name}</h4>
                          <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-2">
                             Updated {new Date(project.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                          project.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {project.status}
                        </span>
                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-slate-50 inline-block p-4 rounded-full mb-3">
                    <Folder className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-medium">No projects yet</h3>
                <p className="text-slate-500 text-sm mt-1">Create your first project to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}