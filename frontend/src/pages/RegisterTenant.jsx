import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Building2, Globe, User, Mail, Lock, ArrowRight, Loader2, Rocket } from 'lucide-react';

export default function RegisterTenant() {
  const [formData, setFormData] = useState({
    tenantName: '',
    subdomain: '',
    adminFullName: '',
    adminEmail: '',
    adminPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/register-tenant', formData);
      toast.success('Organization registered! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      
      {/* Background Decoration (Matches other auth screens) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative z-10">
        
        {/* Header Section */}
        <div className="px-8 pt-8 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 mb-4">
            <Rocket className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Setup Organization</h2>
          <p className="text-slate-500 mt-2 text-sm">Launch a new workspace for your team.</p>
        </div>

        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* --- SECTION 1: COMPANY DETAILS --- */}
            <div className="space-y-4">
               <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company Name
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input 
                    name="tenantName" 
                    required 
                    placeholder="e.g. Acme Inc." 
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400 sm:text-sm"
                    onChange={handleChange} 
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Workspace Subdomain
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                    </div>
                    <input 
                    name="subdomain" 
                    required 
                    placeholder="e.g. acme" 
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-900 placeholder:text-slate-400 sm:text-sm lowercase"
                    onChange={handleChange} 
                    />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 pl-1 flex items-center gap-1">
                    Your URL: <span className="font-mono text-emerald-600 bg-emerald-50 px-1 rounded">{formData.subdomain || 'company'}.saas-platform.com</span>
                </p>
              </div>
            </div>

            {/* DIVIDER */}
            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center">
                    <span className="px-2 bg-white text-xs font-medium text-slate-400 uppercase tracking-widest">Admin Account</span>
                </div>
            </div>

            {/* --- SECTION 2: ADMIN DETAILS --- */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Admin Full Name
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input 
                    name="adminFullName" 
                    required 
                    placeholder="Jane Doe" 
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 sm:text-sm"
                    onChange={handleChange} 
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Admin Email
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input 
                    type="email" 
                    name="adminEmail" 
                    required 
                    placeholder="admin@acme.com" 
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 sm:text-sm"
                    onChange={handleChange} 
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                </label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input 
                    type="password" 
                    name="adminPassword" 
                    required 
                    placeholder="••••••••" 
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 sm:text-sm"
                    onChange={handleChange} 
                    />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 mt-6"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Setting up...
                </>
              ) : (
                <>
                  Launch Organization <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors flex items-center justify-center gap-1 group">
               Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}