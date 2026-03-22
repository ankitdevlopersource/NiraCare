import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  Truck,
  Plus,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';

export default function AmbulanceLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/app/ambulance-dashboard');
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in Firebase. Please enable it in the Firebase Console.');
      } else {
        setError(err.message || 'Failed to login. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    navigate('/app/ambulance-dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left Decoration Panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-600 to-rose-700 p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <Plus className="w-8 h-8 text-red-600" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter">NiraCare</span>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter mb-6 leading-none">
            Emergency<br/>Response<br/>Portal
          </h1>
          <p className="text-white/70 font-bold uppercase tracking-widest text-xs max-w-md">
            Dedicated portal for ambulance drivers and emergency medical technicians.
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-black text-lg">Ambulance Driver Login</p>
            </div>
            <p className="text-white/60 text-sm font-bold leading-relaxed">
              "Every second counts. Your swift response saves lives. Log in to manage emergency requests and navigate to critical patients."
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto space-y-10">
          <div className="md:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tighter">NiraCare</span>
          </div>

          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Enter your credentials to access the dashboard</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold text-sm"
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <p>{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Driver ID / Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                <input 
                  type="email"
                  placeholder="driver@niracare.com"
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:border-red-600 outline-none transition-all font-bold text-slate-900"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                <button 
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-red-600 transition-colors" />
                <input 
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:border-red-600 outline-none transition-all font-bold text-slate-900"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-red-200 hover:bg-red-700 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Access Dashboard'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black tracking-widest">
              <span className="bg-slate-50 px-4 text-slate-400">Quick Access</span>
            </div>
          </div>

          <button 
            onClick={handleDemoLogin}
            className="w-full bg-white text-slate-400 py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 border-2 border-slate-100 hover:border-slate-200 transition-all"
          >
            Demo Login (Bypass Auth)
          </button>

          <p className="text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
            Need help? <Link to="/register" className="text-red-600 hover:underline">Register your vehicle</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
