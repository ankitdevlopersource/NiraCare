import React from 'react';
import { 
  Menu, 
  Bell, 
  Plus, 
  MapPin, 
  ArrowRight,
  Users,
  Hospital as HospitalIcon,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { HOSPITALS, QUICK_ACCESS } from '../constants';
import { IconWrapper } from '../components/IconWrapper';

export default function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'patient'; // Default to patient
  const { openSidebar } = useOutletContext<{ openSidebar: () => void }>();

  // Get real user data from localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // Redirect to role-specific dashboards if not a patient
  React.useEffect(() => {
    if (user?.role === 'hospital') {
      navigate('/app/hospital-dashboard');
    } else if (user?.role === 'ambulance') {
      navigate('/app/ambulance-dashboard');
    } else if (user?.role === 'owner' || user?.role === 'admin') {
      navigate('/app/owner-dashboard');
    }
  }, [user, navigate]);

  const isPatient = (user?.role || role) === 'patient';
  const userName = user?.name || 'Guest User';
  const userTitle = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Visitor';
  
  const theme = {
    bg: 'bg-emerald-600',
    text: 'text-emerald-600',
    light: 'bg-emerald-50',
    shadow: 'shadow-emerald-200',
    gradient: 'from-emerald-600 to-teal-700'
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Dynamic Hero Header */}
      <section className={`relative pt-8 pb-32 px-6 overflow-hidden bg-gradient-to-br ${theme.gradient}`}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black rounded-full blur-3xl"></div>
        </div>

        <header className="relative z-10 flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={openSidebar}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all text-white shadow-xl"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <Plus className={`w-6 h-6 ${theme.text}`} />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tighter">NiraCare</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all text-white">
              <Bell className="w-6 h-6" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </button>
            <div 
              className="w-12 h-12 rounded-2xl border-2 border-white/30 shadow-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform" 
              onClick={() => navigate(isPatient ? '/' : '/admin')}
            >
              <img src={isPatient ? "https://i.pravatar.cc/150?u=ankit" : "https://i.pravatar.cc/150?u=arjun"} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center md:text-left text-white"
          >
            <p className="text-white/70 font-bold uppercase tracking-widest text-xs mb-2">Welcome Back,</p>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-none mb-4">
              {userName}
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/10">
                {userTitle} Account
              </span>
              <span className="px-4 py-1.5 bg-emerald-400/30 backdrop-blur-md rounded-full text-xs font-bold border border-white/10 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                System Online
              </span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="w-48 h-48 md:w-64 md:h-64 bg-white/10 backdrop-blur-2xl rounded-[3rem] p-4 border border-white/20 shadow-2xl">
              <img 
                src={isPatient ? "https://img.freepik.com/free-vector/patient-character-background_1270-84.jpg" : "https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg"} 
                alt="User Illustration" 
                className="w-full h-full object-contain rounded-[2rem]"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white rounded-2xl shadow-2xl flex items-center justify-center border-4 border-emerald-600">
              <Activity className={`w-8 h-8 ${theme.text}`} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area - Overlapping Hero */}
      <main className="relative z-20 -mt-20 px-6 space-y-10">
        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!isPatient && (
            <motion.button 
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/app/referral?role=${role}`)}
              className="bg-white p-8 rounded-[3rem] flex items-center justify-between shadow-xl shadow-slate-200 group border border-slate-100"
            >
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 ${theme.bg} rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-100`}>
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Emergency</p>
                  <p className="text-2xl font-black text-slate-900">New Referral</p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <ArrowRight className="w-6 h-6" />
              </div>
            </motion.button>
          )}

          <motion.button 
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/app/hospitals?role=${role}`)}
            className="bg-slate-900 p-8 rounded-[3rem] flex items-center justify-between shadow-xl shadow-slate-900/20 group border border-slate-800"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md">
                <HospitalIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest mb-1">Real-time</p>
                <p className="text-2xl font-black text-white">Bed Availability</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-slate-900 transition-all text-white">
              <ArrowRight className="w-6 h-6" />
            </div>
          </motion.button>
        </div>

        {/* Quick Access Bento Grid */}
        <section>
          <div className="flex items-center justify-between mb-6 px-2">
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">Quick Services</h4>
            <button className="text-emerald-600 text-sm font-bold hover:underline flex items-center gap-1">
              Customize <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {QUICK_ACCESS.map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <button 
                  onClick={() => navigate(`/app${item.path}`)}
                  className={`w-full aspect-square ${item.color} rounded-[2.5rem] flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all border-4 border-white relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <IconWrapper name={item.icon} className="w-10 h-10 group-hover:scale-110 transition-transform relative z-10" />
                  <span className="text-xs font-black uppercase tracking-widest relative z-10">{item.label}</span>
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Nearby Hospitals - Horizontal Scroll */}
        <section className="pb-10">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-xl">
                <MapPin className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">Nearby Facilities</h4>
            </div>
            <button 
              onClick={() => navigate(`/app/hospitals?role=${role}`)}
              className="text-slate-400 text-sm font-bold flex items-center gap-1 hover:text-slate-900 transition-colors"
            >
              View Map <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-6 px-2 -mx-2">
            {HOSPITALS.map((hospital) => (
              <motion.div 
                key={hospital.id}
                whileHover={{ y: -10 }}
                className="flex-shrink-0 w-[300px] bg-white rounded-[3rem] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100"
              >
                <div className="relative h-44">
                  <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl backdrop-blur-md ${
                      hospital.type === 'Full' ? 'bg-red-500/90 text-white' : 
                      hospital.type === 'ICU' ? 'bg-orange-500/90 text-white' : 
                      'bg-emerald-500/90 text-white'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      {hospital.bedsAvailable > 0 ? `${hospital.bedsAvailable} ${hospital.type} Beds` : 'Full'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h5 className="text-lg font-black text-slate-900 leading-tight mb-4">{hospital.name}</h5>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>{hospital.distance} Away</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/app/book-bed?id=${hospital.id}`)}
                      className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
