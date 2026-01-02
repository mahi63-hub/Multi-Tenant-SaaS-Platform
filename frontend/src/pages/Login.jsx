import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Mail, Lock, Building2, ArrowRight, Loader2, LogIn } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    tenantSubdomain: '' 
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
      const response = await api.post('/auth/login', formData);
      
      // Save token and user info
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data));
      
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      
      {/* Background Decoration (Subtle Blobs) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-slate-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative z-10">
        
        {/* Header Section */}
        <div className="px-8 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-4">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 mt-2 text-sm">Enter your credentials to access your workspace.</p>
        </div>

        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Workspace Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Workspace (Optional)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  name="tenantSubdomain"
                  placeholder="e.g. demo"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 sm:text-sm"
                  value={formData.tenantSubdomain}
                  onChange={handleChange}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">Leave empty if you are a Super Admin.</p>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@company.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 sm:text-sm"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
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
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400 sm:text-sm"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-center text-xs text-slate-500 uppercase tracking-wide mb-3">
              No account yet?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center text-sm">
              <Link 
                to="/register" 
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors font-medium border border-slate-200"
              >
                Register User
              </Link>
              <Link 
                to="/register-tenant" 
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors font-medium border border-slate-200"
              >
                Register Org
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Simple Footer Copyright */}
      <div className="absolute bottom-4 text-slate-400 text-xs">
        &copy; {new Date().getFullYear()} SaaS Platform. All rights reserved.
      </div>
    </div>
  );
}