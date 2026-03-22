import React from 'react';
import { 
  Home as HomeIcon, 
  ClipboardList, 
  Plus, 
  MessageCircle, 
  UserCircle,
  ShieldCheck,
  Hospital,
  Ambulance,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useLocation, Outlet, useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isChatPage = location.pathname === '/app/ai-assistant' || location.pathname === '/app/ai-chatbot';
  const isMapPage = location.pathname === '/app/live-map';
  const hideBottomNav = isChatPage || isMapPage;

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const getProfilePath = () => {
    return '/app/profile';
  };

  const getHomePath = () => {
    switch (user.role) {
      case 'hospital':
        return '/app/hospital-dashboard';
      case 'ambulance':
        return '/app/ambulance-dashboard';
      case 'owner':
      case 'admin':
        return '/app/owner-dashboard?tab=overview';
      default:
        return '/app';
    }
  };

  const getReferralPath = () => {
    if (isOwner) return '/app/owner-dashboard?tab=users&role=hospital';
    return '/app/referral';
  };

  const isOwner = user.role === 'owner' || user.role === 'admin';

  return (
    <div className="w-full bg-slate-50 min-h-screen relative shadow-2xl overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="max-w-7xl mx-auto">
        <Outlet context={{ openSidebar: () => setIsSidebarOpen(true) }} />
      </div>

      {/* Bottom Navigation */}
      {!hideBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 py-3 flex items-center justify-center z-50">
          <div className="max-w-7xl w-full flex items-center justify-between">
            <button 
              onClick={() => navigate(getHomePath())}
              className="flex flex-col items-center gap-1 group"
            >
              {isOwner || user.role === 'hospital' || user.role === 'ambulance' ? (
                <LayoutDashboard className={`w-6 h-6 transition-colors ${isActive(getHomePath()) ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
              ) : (
                <HomeIcon className={`w-6 h-6 transition-colors ${isActive(getHomePath()) ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
              )}
              <span className={`text-[10px] font-bold transition-colors ${isActive(getHomePath()) ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`}>
                {isOwner || user.role === 'hospital' || user.role === 'ambulance' ? 'Dashboard' : 'Home'}
              </span>
            </button>
            <button 
              onClick={() => navigate(getReferralPath())}
              className="flex flex-col items-center gap-1 group"
            >
              {isOwner ? (
                <Hospital className={`w-6 h-6 transition-colors ${isActive('/app/owner-dashboard') && searchParams.get('role') === 'hospital' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
              ) : (
                <ClipboardList className={`w-6 h-6 transition-colors ${isActive('/app/referral') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
              )}
              <span className={`text-[10px] font-bold transition-colors ${
                isOwner 
                  ? (isActive('/app/owner-dashboard') && searchParams.get('role') === 'hospital' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600')
                  : (isActive('/app/referral') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600')
              }`}>
                {isOwner ? 'Hospitals' : 'Referral'}
              </span>
            </button>
            
            <div className="relative -top-8 flex flex-col items-center">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (isOwner) {
                    navigate('/app/owner-dashboard?tab=approvals');
                  } else if (user.role === 'patient' || !user.role) {
                    navigate('/app/report-accident');
                  } else {
                    navigate('/app/referral');
                  }
                }}
                className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 border-4 border-white"
              >
                {isOwner ? <ShieldCheck className="w-8 h-8 text-white" /> : <Plus className="w-8 h-8 text-white" />}
              </motion.button>
              {(user.role === 'patient' || !user.role) && !isOwner && (
                <span className="text-[10px] font-bold text-blue-600 mt-1 uppercase tracking-widest">Emergency</span>
              )}
            </div>

            <button 
              onClick={() => navigate(isOwner ? '/app/owner-dashboard?tab=users&role=ambulance' : '/app/messages')}
              className="flex flex-col items-center gap-1 group"
            >
              {isOwner ? (
                <Ambulance className={`w-6 h-6 transition-colors ${isActive('/app/owner-dashboard') && searchParams.get('role') === 'ambulance' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
              ) : (
                <MessageCircle className={`w-6 h-6 transition-colors ${isActive('/app/messages') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
              )}
              <span className={`text-[10px] font-bold transition-colors ${
                isOwner 
                  ? (isActive('/app/owner-dashboard') && searchParams.get('role') === 'ambulance' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600')
                  : (isActive('/app/messages') ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600')
              }`}>
                {isOwner ? 'Ambulances' : 'Messages'}
              </span>
            </button>
            <button 
              onClick={() => navigate(getProfilePath())}
              className="flex flex-col items-center gap-1 group"
            >
              <UserCircle className={`w-6 h-6 transition-colors ${isActive(getProfilePath()) ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`} />
              <span className={`text-[10px] font-bold transition-colors ${isActive(getProfilePath()) ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600'}`}>Profile</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
