import React from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn,
  Stethoscope,
  Hospital,
  UserRound,
  ShieldCheck,
  Plus,
  ChevronRight,
  Ambulance,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get('role') || 'patient';
  
  const [step, setStep] = React.useState<'credentials' | 'otp'>('credentials');
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [otp, setOtp] = React.useState(['', '', '', '', '', '']);
  const [isSending, setIsSending] = React.useState(false);
  const [error, setError] = React.useState('');
  const [apiStatus, setApiStatus] = React.useState<any>(null);
  const [showForgotModal, setShowForgotModal] = React.useState(false);
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [resetStep, setResetStep] = React.useState<'request' | 'reset'>('request');
  const [newPassword, setNewPassword] = React.useState('');
  const [forgotMessage, setForgotMessage] = React.useState({ type: '', text: '' });
  const [isForgotLoading, setIsForgotLoading] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    const checkHealth = async (retries = 5) => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch('/api/health');
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await res.json();
            if (isMounted) setApiStatus(data);
            return;
          }
          if (isMounted) setApiStatus({ status: 'starting', message: 'Server is starting...' });
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (err: any) {
          if (isMounted) setApiStatus({ status: 'error', message: err.message });
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    };
    checkHealth();
    return () => { isMounted = false; };
  }, []);

  const roles = [
    { id: 'patient', label: 'Patient', icon: UserRound },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope },
    { id: 'hospital', label: 'Hospital', icon: Hospital },
    { id: 'ambulance', label: 'Ambulance', icon: Ambulance },
    { id: 'owner', label: 'Owner', icon: ShieldCheck },
  ];

  const getRoleConfig = () => {
    switch (role) {
      case 'doctor': return { 
        label: 'Doctor', 
        icon: Stethoscope, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-600',
        accent: 'from-emerald-600 to-teal-700',
        quote: "Saving lives through seamless collaboration and intelligent patient routing."
      };
      case 'hospital': return { 
        label: 'Hospital', 
        icon: Hospital, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-600',
        accent: 'from-emerald-600 to-teal-700',
        quote: "Optimizing healthcare capacity with real-time intelligence and precision."
      };
      case 'ambulance': return { 
        label: 'Ambulance', 
        icon: Ambulance, 
        color: 'text-red-600', 
        bg: 'bg-red-600',
        accent: 'from-red-600 to-orange-700',
        quote: "Rapid response and real-time tracking for life-saving emergency transport."
      };
      case 'owner': return { 
        label: 'Owner', 
        icon: ShieldCheck, 
        color: 'text-orange-600', 
        bg: 'bg-orange-600',
        accent: 'from-orange-600 to-red-700',
        quote: "Empowering healthcare ecosystems with data-driven leadership and control."
      };
      default: return { 
        label: 'Patient', 
        icon: UserRound, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-600',
        accent: 'from-emerald-600 to-teal-700',
        quote: "Your gateway to immediate, high-quality healthcare and emergency support."
      };
    }
  };

  const config = getRoleConfig();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setError('');
    try {
      const response = await api.login({ email, password });
      localStorage.setItem('user', JSON.stringify(response.user));
      
      // After successful MongoDB login, we can still show OTP for "extra security" simulation
      // or just navigate directly. Let's navigate directly for a better UX with real data.
      if (response.user.role === 'hospital') {
        navigate('/app/hospital-dashboard');
      } else if (response.user.role === 'doctor') {
        navigate('/app?role=doctor');
      } else if (response.user.role === 'ambulance') {
        navigate('/app/ambulance-dashboard');
      } else if (response.user.role === 'owner') {
        navigate('/app/owner-dashboard');
      } else {
        navigate('/app?role=patient');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'hospital') {
      navigate('/app/hospital-dashboard');
    } else if (role === 'doctor') {
      navigate('/app?role=doctor');
    } else if (role === 'ambulance') {
      navigate('/app/ambulance-dashboard');
    } else if (role === 'owner') {
      navigate('/app/owner-dashboard');
    } else {
      navigate('/app?role=patient');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header with Full Width Tabs */}
      <header className="w-full bg-blue-600 sticky top-0 z-30 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-black text-white text-xl tracking-tighter">NiraCare</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Secure Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm p-1.5 rounded-2xl w-full">
            {roles.map((r) => (
              <button
                key={r.id}
                disabled={step === 'otp'}
                onClick={() => {
                  if (r.id === 'ambulance') {
                    navigate('/ambulance-login');
                  } else {
                    setSearchParams({ role: r.id });
                  }
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  role === r.id 
                    ? 'bg-white text-blue-600 shadow-md scale-[1.02]' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                } ${step === 'otp' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <r.icon className={`w-4 h-4 ${role === r.id ? 'text-blue-600' : ''}`} />
                <span className="hidden sm:inline">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-start pt-8 pb-20 px-6">
        <motion.div 
          key={role}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100"
        >
          {/* Role Hero Section (Ambulance Style) */}
          <div className={`bg-gradient-to-br ${config.accent} p-12 text-white relative overflow-hidden`}>
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -top-10 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center backdrop-blur-xl mb-6 shadow-2xl"
              >
                <config.icon className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl font-black tracking-tight mb-3">
                {config.label} <span className="opacity-60 font-light italic">Login</span>
              </h1>
              <p className="text-white/80 font-medium max-w-md leading-relaxed">
                {config.quote}
              </p>
            </div>
          </div>

          <div className="p-10 lg:p-16">
            <AnimatePresence mode="wait">
              {step === 'credentials' ? (
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <form onSubmit={handleLogin} className="space-y-6">
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                      <div className="relative group">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-r border-slate-100 group-focus-within:border-blue-200 transition-colors`}>
                          <Mail className={`w-5 h-5 text-slate-400 group-focus-within:${config.color}`} />
                        </div>
                        <input 
                          required
                          type="email"
                          placeholder="name@healthcare.com"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-16 pr-4 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-bold text-slate-700">Password</label>
                        <button 
                          type="button" 
                          onClick={() => {
                            setShowForgotModal(true);
                            setForgotEmail(email);
                            setResetStep('request');
                            setForgotMessage({ type: '', text: '' });
                          }}
                          className={`text-xs font-bold ${config.color} hover:underline`}
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-r border-slate-100 group-focus-within:border-blue-200 transition-colors">
                          <Lock className={`w-5 h-5 text-slate-400 group-focus-within:${config.color}`} />
                        </div>
                        <input 
                          required
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-16 pr-12 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5 text-slate-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-1">
                      <input type="checkbox" id="remember" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                      <label htmlFor="remember" className="text-sm font-medium text-slate-600">Remember me for 30 days</label>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={isSending}
                      className={`w-full ${config.bg} text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-slate-200 mt-8 group disabled:opacity-70`}
                    >
                      {isSending ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Authenticating...
                        </div>
                      ) : (
                        <>
                          Sign In to {config.label} Portal
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="mb-10 text-center">
                    <button 
                      onClick={() => setStep('credentials')}
                      className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-6 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Login
                    </button>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Verify OTP</h2>
                    <p className="text-slate-500 mt-3">
                      Code sent to <span className="text-slate-900 font-bold">{email}</span>
                    </p>
                  </div>

                  <form onSubmit={handleVerifyOtp} className="space-y-8">
                    <div className="flex justify-center gap-3">
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          className="w-14 h-16 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e) }
                        />
                      ))}
                    </div>

                    <div className="text-center">
                      <p className="text-slate-500 font-medium">
                        Didn't receive the code? {' '}
                        <button type="button" className={`font-bold ${config.color} hover:underline`}>Resend OTP</button>
                      </p>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      className={`w-full ${config.bg} text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-slate-200 group`}
                    >
                      Verify & Login
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-12 pt-8 border-t border-slate-100 text-center">
              <p className="text-slate-500 font-medium">
                Don't have an account? {' '}
                <Link to={`/register?role=${role}`} className={`font-bold ${config.color} hover:underline`}>Create Account</Link>
              </p>
            </div>
          </div>
        </motion.div>

        <footer className="mt-12 text-center max-w-md">
          <p className="text-slate-400 text-xs font-medium leading-relaxed">
            By signing in, you agree to our <span className="text-slate-600 underline cursor-pointer">Terms of Service</span> and <span className="text-slate-600 underline cursor-pointer">Privacy Policy</span>.
            <br />© 2026 NiraCare Healthcare Logistics.
          </p>
        </footer>
      </main>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className={`bg-gradient-to-br ${config.accent} p-8 text-white relative`}>
                <button 
                  onClick={() => setShowForgotModal(false)}
                  className="absolute right-6 top-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Reset Password</h3>
                <p className="text-white/70 text-sm mt-1">
                  {resetStep === 'request' 
                    ? "Enter your email to receive reset instructions." 
                    : "Enter your new password below."}
                </p>
              </div>

              <div className="p-8">
                {forgotMessage.text && (
                  <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold ${
                    forgotMessage.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {forgotMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {forgotMessage.text}
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsForgotLoading(true);
                  setForgotMessage({ type: '', text: '' });
                  try {
                    if (resetStep === 'request') {
                      const res = await api.forgotPassword(forgotEmail);
                      setForgotMessage({ type: 'success', text: res.message });
                      setResetStep('reset');
                    } else {
                      const res = await api.resetPassword(forgotEmail, newPassword);
                      setForgotMessage({ type: 'success', text: res.message });
                      setTimeout(() => setShowForgotModal(false), 2000);
                    }
                  } catch (err: any) {
                    setForgotMessage({ type: 'error', text: err.message });
                  } finally {
                    setIsForgotLoading(false);
                  }
                }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
                    <input 
                      type="email"
                      required
                      disabled={resetStep === 'reset'}
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                      placeholder="name@healthcare.com"
                    />
                  </div>

                  {resetStep === 'reset' && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">New Password</label>
                      <input 
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  )}

                  <button 
                    type="submit"
                    disabled={isForgotLoading}
                    className={`w-full ${config.bg} text-white py-4 rounded-2xl font-bold shadow-lg shadow-slate-100 hover:scale-[1.02] transition-transform disabled:opacity-70`}
                  >
                    {isForgotLoading ? "Processing..." : (resetStep === 'request' ? "Send Reset Link" : "Update Password")}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
