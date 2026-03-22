import React from 'react';
import { 
  X, 
  Hospital, 
  UserRound, 
  Stethoscope, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  Settings,
  HelpCircle,
  Ambulance as AmbulanceIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  
  const loginOptions = [
    { id: 'doctor', label: 'Doctor Login', icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'hospital', label: 'Hospital Login', icon: Hospital, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'ambulance', label: 'Ambulance Login', icon: AmbulanceIcon, color: 'text-red-600', bg: 'bg-red-50' },
    { id: 'patient', label: 'Patient Login', icon: UserRound, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'owner', label: 'Owner Login', icon: ShieldCheck, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const handleLoginClick = (roleId: string) => {
    onClose();
    if (roleId === 'ambulance') {
      navigate('/ambulance-login');
    } else {
      navigate(`/login?role=${roleId}`);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('user');
    onClose();
    navigate('/');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />

          {/* Sidebar Content */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 bottom-0 w-80 bg-white z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Hospital className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900">NiraCare</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Login Options */}
            <div className="p-6 flex-grow overflow-y-auto">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Switch Role</p>
              <div className="space-y-3">
                {loginOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleLoginClick(option.id)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${option.bg} ${option.color} rounded-xl flex items-center justify-center`}>
                        <option.icon className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-700">{option.label} Portal</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>

              <div className="mt-10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Settings & Support</p>
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                  </button>
                  <button className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                    <HelpCircle className="w-5 h-5" />
                    <span className="font-medium">Help Center</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100">
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 p-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
              <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">Version 1.0.4 • NiraCare Inc.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
