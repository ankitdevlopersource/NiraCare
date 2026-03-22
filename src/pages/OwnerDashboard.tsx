import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  PlusCircle, 
  Hospital, 
  Ambulance, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  LayoutDashboard,
  Users,
  BarChart3,
  TrendingUp,
  Mail,
  UserCircle,
  Search,
  Filter,
  LogOut,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'users' | 'bookings' | 'profile'>((searchParams.get('tab') as any) || 'overview');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('role') || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const tab = searchParams.get('tab');
    const role = searchParams.get('role');
    if (tab && ['overview', 'approvals', 'users', 'bookings', 'profile'].includes(tab)) {
      setActiveTab(tab as any);
    }
    if (role) {
      setSearchQuery(role);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [userData, bookingData] = await Promise.all([
        api.getUsers(),
        api.getBookings()
      ]);
      setUsers(userData);
      setBookings(bookingData);
      
      // Initialize edit form with current user data
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      const updatedUser = await api.updateUser(user._id, editForm);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      await api.approveUser(id, isApproved);
      fetchData();
    } catch (error) {
      console.error("Failed to update approval status:", error);
      alert("Failed to update status");
    }
  };

  const hospitalCount = users.filter(u => u.role === 'hospital').length;
  const ambulanceCount = users.filter(u => u.role === 'ambulance').length;
  const pendingUsers = users.filter(u => !u.isApproved);
  
  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Users', value: users.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Hospitals', value: hospitalCount.toString(), icon: Hospital, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Ambulances', value: ambulanceCount.toString(), icon: Ambulance, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Bookings', value: bookings.length.toString(), icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="px-6 pt-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
            >
              <ArrowLeft className="w-6 h-6 text-slate-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Owner Console</h1>
              <p className="text-xs text-slate-500 font-medium">System Administration & Oversight</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-orange-600" />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'approvals', label: `Pending (${pendingUsers.length})`, icon: Clock },
            { id: 'users', label: 'All Users', icon: Users },
            { id: 'bookings', label: 'Bookings', icon: BarChart3 },
            { id: 'profile', label: 'Profile', icon: UserCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchParams({ tab: tab.id });
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 mt-8 space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
                  <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 ml-1">Quick Management</h4>
              <div className="grid grid-cols-1 gap-3">
                <button className="w-full flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Hospital className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900">Hospital Network</p>
                      <p className="text-xs text-slate-500">Manage {hospitalCount} medical centers</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </button>

                <button className="w-full flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-emerald-200 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                      <Ambulance className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-slate-900">Ambulance Fleet</p>
                      <p className="text-xs text-slate-500">Oversee {ambulanceCount} active vehicles</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </button>
              </div>
            </div>

            {/* Recent Activity Summary */}
            <div>
              <div className="flex items-center justify-between mb-4 ml-1">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Bookings</h4>
                <button onClick={() => setActiveTab('bookings')} className="text-xs font-bold text-blue-600">View All</button>
              </div>
              <div className="space-y-3">
                {bookings.slice(0, 3).map((booking, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                        <UserCircle className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{booking.patientName}</p>
                        <p className="text-[10px] text-slate-500">{booking.hospitalName || 'General Request'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      booking.status === 'Admitted' ? 'bg-emerald-100 text-emerald-600' : 
                      booking.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'approvals' && (
          <motion.div 
            key="approvals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 mt-8"
          >
            <h4 className="text-lg font-bold text-slate-900 mb-4">Pending Approvals</h4>
            <div className="space-y-4">
              {pendingUsers.length === 0 ? (
                <div className="bg-white p-12 rounded-[40px] border border-slate-100 text-center">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4 opacity-20" />
                  <p className="text-slate-400 font-bold">All caught up!</p>
                  <p className="text-xs text-slate-400 mt-1">No pending registrations to review.</p>
                </div>
              ) : (
                pendingUsers.map((user) => (
                  <div key={user._id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                          user.role === 'hospital' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {user.role === 'hospital' ? <Hospital className="w-7 h-7" /> : <Ambulance className="w-7 h-7" />}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-slate-900">{user.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-black tracking-widest uppercase">{user.role}</span>
                            <span className="text-xs text-slate-400 font-medium">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => handleApprove(user._id, true)}
                        className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-100 hover:scale-[1.02] transition-transform"
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleApprove(user._id, false)}
                        className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-all"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 mt-8"
          >
            <div className="flex flex-col gap-4 mb-6">
              <h4 className="text-lg font-bold text-slate-900">All Registered Users</h4>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search by name, email or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="bg-white p-12 rounded-[40px] text-center text-slate-400 font-bold">
                  No users found matching your search.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div key={user._id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        user.role === 'owner' ? 'bg-orange-100 text-orange-600' :
                        user.role === 'hospital' ? 'bg-blue-100 text-blue-600' :
                        user.role === 'ambulance' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        <UserCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{user.name}</p>
                        <p className="text-[10px] text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${
                        user.role === 'owner' ? 'bg-orange-100 text-orange-600' :
                        user.role === 'hospital' ? 'bg-blue-100 text-blue-600' :
                        user.role === 'ambulance' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {user.role}
                      </span>
                      {!user.isApproved && user.role !== 'owner' && (
                        <span className="text-[8px] font-bold text-orange-500 uppercase">Pending</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'bookings' && (
          <motion.div 
            key="bookings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 mt-8"
          >
            <h4 className="text-lg font-bold text-slate-900 mb-6">System Bookings</h4>
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="bg-white p-12 rounded-[40px] text-center text-slate-400 font-bold">
                  No bookings recorded in the system.
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking._id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h5 className="font-bold text-slate-900">{booking.patientName}</h5>
                        <p className="text-xs text-slate-500">{booking.hospitalName || 'General Request'}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        booking.status === 'Admitted' ? 'bg-emerald-100 text-emerald-600' : 
                        booking.status === 'Pending' ? 'bg-orange-100 text-orange-600' : 
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">
                          {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {booking.bedType} Ward
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div 
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-6 mt-8"
          >
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center relative">
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white hover:bg-white/30 transition-all"
                  >
                    {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                  </button>
                </div>
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[32px] flex items-center justify-center mx-auto mb-4 border border-white/30">
                  <ShieldCheck className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{user.name}</h3>
                <p className="text-blue-100 text-sm font-medium uppercase tracking-widest">System Owner</p>
              </div>

              <div className="p-8 space-y-6">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
                      <input 
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                      <input 
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Phone Number</label>
                      <input 
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    <button 
                      onClick={handleUpdateProfile}
                      className="w-full bg-blue-600 text-white py-5 rounded-3xl font-bold text-sm shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                      <Save className="w-5 h-5" />
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Mail className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</p>
                        <p className="font-bold text-slate-700">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</p>
                        <p className="font-bold text-slate-700 uppercase tracking-wider">{user.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                        <p className="font-bold text-slate-700">Active Administrator</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 p-6 bg-red-50 text-red-600 rounded-[32px] font-bold hover:bg-red-100 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sign Out from Console
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="font-bold text-slate-400">Syncing System Data...</p>
          </div>
        </div>
      )}
    </div>
  );
}
