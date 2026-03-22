import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Hospital as HospitalIcon, 
  TrendingUp, 
  Clock, 
  MoreVertical,
  Mail,
  UserCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, bookingData] = await Promise.all([
          api.getUsers(),
          api.getBookings()
        ]);
        setUsers(userData);
        setBookings(bookingData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Users', value: users.length.toString(), change: '+12%', icon: Users, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Total Bookings', value: bookings.length.toString(), change: '+5%', icon: BarChart3, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Beds', value: bookings.filter(b => b.status === 'Admitted').length.toString(), change: 'Live', icon: HospitalIcon, color: 'bg-indigo-100 text-indigo-600' },
  ];

  const recentActivity = [
    { id: 1, patient: 'John Doe', hospital: 'City Hospital', status: 'Accepted', time: '10 mins ago' },
    { id: 2, patient: 'Jane Smith', hospital: 'LifeCare Hospital', status: 'Pending', time: '25 mins ago' },
    { id: 3, patient: 'Mike Ross', hospital: 'Metro Med', status: 'Rejected', time: '1 hour ago' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="px-6 pt-6 flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">Admin Dashboard</h1>
      </header>

      <div className="px-6 mt-8 grid grid-cols-1 gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              </div>
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>
              <TrendingUp className="w-3 h-3" />
              {stat.change}
            </div>
          </motion.div>
        ))}
      </div>

      <section className="px-6 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-slate-900">Registered Users (Real Data)</h4>
          <button className="text-blue-600 text-sm font-semibold">View All</button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-10">
              <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl text-center text-slate-400 font-bold">
              No users registered yet.
            </div>
          ) : (
            users.map((user, idx) => (
              <motion.div 
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                    <UserCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">{user.name}</h5>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                    user.role === 'admin' ? 'bg-red-100 text-red-600' :
                    user.role === 'doctor' ? 'bg-blue-100 text-blue-600' :
                    user.role === 'hospital' ? 'bg-indigo-100 text-indigo-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {user.role}
                  </span>
                  <button className="p-1 hover:bg-slate-50 rounded-lg">
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
