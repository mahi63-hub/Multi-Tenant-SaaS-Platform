import { useEffect, useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Search, Mail, Shield, User, Trash2, Plus, X, CheckCircle, MoreVertical, Loader2, Users as UsersIcon } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'user' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- SAFE USER PARSING ---
  let currentUser = { role: 'user' };
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      currentUser = JSON.parse(storedUser);
    }
  } catch (error) {
    console.warn("Corrupted user data in Users page");
  }
  const isAdmin = currentUser.role === 'tenant_admin';
  // ------------------------

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/users', formData);
      toast.success('Team member added successfully');
      setShowModal(false);
      setFormData({ fullName: '', email: '', password: '', role: 'user' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this user from the team?")) return;
    
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User removed successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove user');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Team Members</h1>
            <p className="text-slate-500 mt-2 text-lg">Manage access and roles for your organization.</p>
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-0.5 font-bold shadow-sm"
            >
              <Plus className="h-5 w-5" /> Add Member
            </button>
          )}
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          {/* Loading Skeleton */}
          {loading ? (
             <div className="p-6 space-y-4">
               {[1, 2, 3, 4].map((i) => (
                 <div key={i} className="flex items-center justify-between animate-pulse">
                   <div className="flex items-center gap-4 w-1/3">
                     <div className="h-10 w-10 bg-slate-100 rounded-full"></div>
                     <div className="h-4 bg-slate-100 rounded w-full"></div>
                   </div>
                   <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                   <div className="h-4 bg-slate-100 rounded w-1/6"></div>
                 </div>
               ))}
             </div>
          ) : (
            <>
              {users.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                        {isAdmin && <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                  {user.fullName?.[0]?.toUpperCase() || 'U'}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-slate-900">{user.fullName}</div>
                                <div className="text-sm text-slate-500 flex items-center gap-1">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase tracking-wide border ${
                              user.role === 'tenant_admin' 
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                              {user.role === 'tenant_admin' ? 'Admin' : 'Member'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Active
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          
                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {user.id !== currentUser.id ? (
                                <button 
                                  onClick={() => handleDelete(user.id)}
                                  className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                  title="Remove Member"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              ) : (
                                <span className="text-xs text-slate-300 font-medium italic pr-2">Current User</span>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-20 px-6">
                    <div className="bg-slate-50 inline-block p-4 rounded-full mb-4">
                        <UsersIcon className="h-8 w-8 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No team members found</h3>
                    <p className="text-slate-500 mt-1 mb-6">Invite your colleagues to collaborate on projects.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Add Team Member</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors bg-white hover:bg-slate-100 rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Name Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="text" 
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="email" 
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Temporary Password</label>
                <div className="relative group">
                  <Shield className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <input 
                    type="password" 
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>

              {/* Role Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Access Level</label>
                <div className="relative">
                    <select 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-900 appearance-none cursor-pointer"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="user">Member (Standard Access)</option>
                      <option value="tenant_admin">Admin (Full Control)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-200 flex justify-center items-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}