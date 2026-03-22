import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, 
  Hospital, 
  UserRound, 
  ShieldCheck, 
  Ambulance as AmbulanceIcon,
  Plus,
  ArrowRight
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const roles = [
    { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Refer patients & check beds' },
    { id: 'hospital', label: 'Hospital', icon: Hospital, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Manage beds & admissions' },
    { id: 'patient', label: 'Patient', icon: UserRound, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Book beds & find hospitals' },
    { id: 'ambulance', label: 'Ambulance', icon: AmbulanceIcon, color: 'text-red-600', bg: 'bg-red-50', desc: 'Emergency transport services' },
    { id: 'owner', label: 'Owner', icon: ShieldCheck, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'System administration' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <Plus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">NiraCare</h1>
        </div>
        <p className="text-slate-500 font-medium text-lg">Smart Healthcare Referral & Bed Booking</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {roles.map((role, idx) => (
          <motion.button
            key={role.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/login?role=${role.id}`)}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all border border-slate-100 flex flex-col items-start text-left group relative overflow-hidden"
          >
            <div className={`w-16 h-16 ${role.bg} ${role.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              <role.icon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{role.label}</h2>
            <p className="text-slate-500 mb-6">{role.desc}</p>
            <div className="flex items-center gap-2 text-blue-600 font-bold">
              <span>Continue as {role.label}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors -z-10"></div>
          </motion.button>
        ))}
      </div>

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-slate-400 text-sm font-medium"
      >
        © 2026 NiraCare Inc. • All Rights Reserved
      </motion.p>
    </div>
  );
}
