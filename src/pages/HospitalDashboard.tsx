import React from 'react';
import { 
  ArrowLeft, 
  Bed, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Phone,
  User,
  FileText,
  MapPin,
  Fingerprint,
  Mail,
  AlertCircle,
  ExternalLink,
  X,
  LayoutDashboard,
  Stethoscope,
  Package,
  Wallet,
  MessageSquare,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Activity,
  ChevronRight,
  ClipboardList,
  UserPlus,
  History,
  AlertTriangle,
  Truck,
  Menu,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

type TabType = 'dashboard' | 'patients' | 'doctors' | 'inventory' | 'finance' | 'profile';

export default function HospitalDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [doctors, setDoctors] = React.useState<any[]>([]);
  const [inventory, setInventory] = React.useState<any[]>([]);
  const [expenses, setExpenses] = React.useState<any[]>([]);
  const [hmsStats, setHmsStats] = React.useState<any>(null);
  const [selectedBooking, setSelectedBooking] = React.useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [showAddDoctor, setShowAddDoctor] = React.useState(false);
  const [showAddInventory, setShowAddInventory] = React.useState(false);
  const [showAddExpense, setShowAddExpense] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  const [isApproved, setIsApproved] = React.useState<boolean | null>(null);
  const activeTab = (searchParams.get('tab') as TabType) || 'dashboard';
  const [isEditing, setIsEditing] = React.useState(false);
  
  // Form States
  const [doctorForm, setDoctorForm] = React.useState({
    name: '',
    specialization: '',
    salary: 0,
    commissionRate: 0
  });

  const [inventoryForm, setInventoryForm] = React.useState({
    itemName: '',
    category: 'Medicine',
    stock: 0,
    minStockAlert: 5,
    expiryDate: '',
    supplierName: '',
    unitPrice: 0
  });

  const [expenseForm, setExpenseForm] = React.useState({
    title: '',
    category: 'Utility',
    amount: 0,
    description: ''
  });

  const [billingAmount, setBillingAmount] = React.useState<number>(0);

  const [editForm, setEditForm] = React.useState({
    name: '',
    address: '',
    totalBeds: 0,
    availableBeds: 0,
    phone: ''
  });

  const fetchData = async () => {
    try {
      const currentUser = await api.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsApproved(currentUser.isApproved);
        setEditForm({
          name: currentUser.name || '',
          address: currentUser.address || '',
          totalBeds: currentUser.totalBeds || 0,
          availableBeds: currentUser.availableBeds || 0,
          phone: currentUser.phone || ''
        });

        if (currentUser.isApproved) {
          const [bookingsData, doctorsData, inventoryData, expensesData, statsData] = await Promise.all([
            api.getBookings(),
            api.getDoctors(currentUser._id),
            api.getInventory(currentUser._id),
            api.getExpenses(currentUser._id),
            api.getHospitalStats(currentUser._id)
          ]);
          
          setBookings(bookingsData);
          setDoctors(doctorsData);
          setInventory(inventoryData);
          setExpenses(expensesData);
          setHmsStats(statsData);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.updateBookingStatus(id, status);
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    try {
      await api.updateUser(user._id, editForm);
      setIsEditing(false);
      fetchData();
      alert("Hospital profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    try {
      await api.createDoctor({ ...doctorForm, hospitalId: user._id });
      setShowAddDoctor(false);
      setDoctorForm({ name: '', specialization: '', salary: 0, commissionRate: 0 });
      fetchData();
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    try {
      await api.addInventory({ ...inventoryForm, hospitalId: user._id });
      setShowAddInventory(false);
      setInventoryForm({
        itemName: '',
        category: 'Medicine',
        stock: 0,
        minStockAlert: 5,
        expiryDate: '',
        supplierName: '',
        unitPrice: 0
      });
      fetchData();
    } catch (error) {
      console.error("Error adding inventory:", error);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;
    try {
      await api.addExpense({ ...expenseForm, hospitalId: user._id });
      setShowAddExpense(false);
      setExpenseForm({ title: '', category: 'Utility', amount: 0, description: '' });
      fetchData();
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'doctors', label: 'Doctors', icon: Stethoscope },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const getRevenueData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: d.toISOString().split('T')[0],
        revenue: 0
      };
    }).reverse();

    bookings.forEach(booking => {
      if (booking.status === 'Discharged' && booking.billingAmount) {
        const bookingDate = new Date(booking.createdAt).toISOString().split('T')[0];
        const day = last7Days.find(d => d.fullDate === bookingDate);
        if (day) {
          day.revenue += booking.billingAmount;
        }
      }
    });

    return last7Days;
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Active Patients</p>
              <h3 className="text-2xl font-bold text-slate-900">{hmsStats?.activePatients || 0}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+12% from last week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Total Revenue</p>
              <h3 className="text-2xl font-bold text-slate-900">₹{hmsStats?.totalRevenue?.toLocaleString() || 0}</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
            <TrendingUp className="w-3 h-3" />
            <span>+8% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Low Stock</p>
              <h3 className="text-2xl font-bold text-slate-900">{hmsStats?.lowStockItems || 0}</h3>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400">Items needing attention</p>
        </div>

        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
              <Bed className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Bed Occupancy</p>
              <h3 className="text-2xl font-bold text-slate-900">
                {user?.totalBeds ? Math.round(((user.totalBeds - user.availableBeds) / user.totalBeds) * 100) : 0}%
              </h3>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-purple-600 h-full transition-all duration-500" 
              style={{ width: `${user?.totalBeds ? ((user.totalBeds - user.availableBeds) / user.totalBeds) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h4 className="text-lg font-bold text-slate-900">Revenue Overview</h4>
            <select className="bg-slate-50 border-none rounded-xl text-xs font-bold px-4 py-2 outline-none w-fit">
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getRevenueData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Patient Distribution */}
        <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-900 mb-8 text-center sm:text-left">Patient Distribution</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'OPD', value: hmsStats?.opdCount || 0 },
                    { name: 'IPD', value: hmsStats?.ipdCount || 0 },
                  ]}
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-xs font-bold text-slate-600">OPD ({hmsStats?.opdCount || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-xs font-bold text-slate-600">IPD ({hmsStats?.ipdCount || 0})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPatients = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Patient Management</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              className="pl-11 pr-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all w-full sm:w-64"
            />
          </div>
          <button className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
            <Plus className="w-4 h-4" /> New Admission
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Patient</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Ward</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{booking.patientName}</p>
                      <p className="text-xs text-slate-400">{booking.mobileNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    booking.patientType === 'IPD' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                  }`}>
                    {booking.patientType}
                  </span>
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-medium text-slate-600">{booking.bedType}</p>
                </td>
                <td className="px-8 py-5">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    booking.status === 'Admitted' ? 'bg-emerald-100 text-emerald-600' :
                    booking.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {booking.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </td>
                <td className="px-8 py-5">
                  <button 
                    onClick={() => setSelectedBooking(booking)}
                    className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

  const renderDoctors = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Medical Staff</h2>
        <button 
          onClick={() => setShowAddDoctor(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
        >
          <Plus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor._id} className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{doctor.name}</h4>
                <p className="text-xs font-bold text-blue-600 uppercase">{doctor.specialization}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium">Schedule</span>
                <span className="text-slate-900 font-bold">{doctor.schedule?.[0]?.day || 'Mon-Fri'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-medium">Availability</span>
                <span className="text-emerald-600 font-bold">On Duty</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors">
                View Profile
              </button>
              <button className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-blue-50 hover:text-blue-600 transition-colors">
                Schedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Inventory & Supplies</h2>
        <button 
          onClick={() => setShowAddInventory(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Items</p>
          <h3 className="text-2xl font-bold text-slate-900">{inventory.length}</h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Low Stock</p>
          <h3 className="text-2xl font-bold text-red-600">{hmsStats?.lowStockItems || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Expiring Soon</p>
          <h3 className="text-2xl font-bold text-amber-600">{hmsStats?.expiringSoon || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Value</p>
          <h3 className="text-2xl font-bold text-emerald-600">₹4.2L</h3>
        </div>
      </div>

      <div className="bg-white rounded-[32px] sm:rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] lg:min-w-0">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Item Name</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Stock</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Expiry</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {inventory.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900">{item.itemName}</p>
                    <p className="text-xs text-slate-400">{item.supplierName}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold uppercase">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-bold text-slate-900">{item.stock} Units</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      item.stock <= item.minStockAlert ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                      {item.stock <= item.minStockAlert ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500">
                    {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-8 py-5">
                    <button className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const getExpenseDistribution = () => {
    const distribution: { [key: string]: number } = {
      'Utility': 0,
      'Maintenance': 0,
      'Salary': 0,
      'Supplies': 0,
      'Other': 0
    };

    expenses.forEach(expense => {
      if (distribution[expense.category] !== undefined) {
        distribution[expense.category] += expense.amount;
      } else {
        distribution['Other'] += expense.amount;
      }
    });

    return Object.entries(distribution)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  };

  const renderFinance = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Financial Management</h2>
        <button 
          onClick={() => setShowAddExpense(true)}
          className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
        >
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase">Monthly Revenue</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">₹{hmsStats?.totalRevenue?.toLocaleString() || 0}</h3>
          <p className="text-xs font-bold text-emerald-600 mt-2">+12.5% from last month</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-red-600 rotate-180" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase">Monthly Expenses</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">₹{hmsStats?.totalExpenses?.toLocaleString() || 0}</h3>
          <p className="text-xs font-bold text-red-600 mt-2">+4.2% from last month</p>
        </div>
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase">Net Profit</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">
            ₹{(hmsStats?.totalRevenue - hmsStats?.totalExpenses)?.toLocaleString() || 0}
          </h3>
          <p className="text-xs font-bold text-blue-600 mt-2">Healthy Margin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-900 mb-8">Recent Expenses</h4>
          <div className="space-y-4">
            {expenses.length > 0 ? expenses.slice(0, 5).map((expense) => (
              <div key={expense._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{expense.title}</p>
                    <p className="text-xs text-slate-400">{expense.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">-₹{expense.amount}</p>
                  <p className="text-[10px] text-slate-400">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-400 py-10">No expenses recorded yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
          <h4 className="text-lg font-bold text-slate-900 mb-8">Expense Distribution</h4>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={getExpenseDistribution()}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                  <Cell fill="#8b5cf6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {getExpenseDistribution().map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5] }} />
                <span className="text-xs font-bold text-slate-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-slate-900">Hospital Profile</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Hospital Name</label>
            <input 
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Address</label>
            <textarea 
              value={editForm.address}
              onChange={(e) => setEditForm({...editForm, address: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all min-h-[100px]"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Total Beds</label>
              <input 
                type="number"
                value={editForm.totalBeds}
                onChange={(e) => setEditForm({...editForm, totalBeds: parseInt(e.target.value)})}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Available Beds</label>
              <input 
                type="number"
                value={editForm.availableBeds}
                onChange={(e) => setEditForm({...editForm, availableBeds: parseInt(e.target.value)})}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1">Phone Number</label>
            <input 
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:scale-[1.02] transition-transform"
          >
            Save
          </button>
        </form>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center">
              <User className="w-10 h-10 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{user?.name}</h3>
              <p className="text-slate-500">{user?.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Total Beds</p>
              <p className="text-lg font-bold text-slate-900">{user?.totalBeds}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Available Beds</p>
              <p className="text-lg font-bold text-emerald-600">{user?.availableBeds}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Phone</p>
              <p className="text-lg font-bold text-slate-900">{user?.phone || 'Not set'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                user?.isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {user?.isApproved ? 'Approved' : 'Pending'}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">Address</p>
            <p className="text-slate-900 font-medium leading-relaxed">{user?.address || 'Not set'}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-100 p-4 sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-100">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">NiraCare <span className="text-emerald-600">HMS</span></h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6 text-slate-600" /> : <Menu className="w-6 h-6 text-slate-600" />}
        </button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        w-72 bg-white border-r border-slate-100 flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen overflow-y-auto no-scrollbar
      `}>
        <div className="p-8">
          <div className="hidden lg:flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">NiraCare <span className="text-emerald-600">HMS</span></h1>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSearchParams({ tab: item.id });
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-100' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8">
          <button 
            onClick={() => {
              localStorage.removeItem('user');
              navigate('/');
            }}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-10 min-w-0 pb-32">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 lg:mb-10">
          <div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 capitalize">{activeTab}</h2>
            <p className="text-slate-400 font-medium mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-3 bg-white px-4 lg:px-6 py-2 lg:py-3 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] lg:text-xs font-bold text-slate-600">System Online</span>
            </div>
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-slate-400" />
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'patients' && renderPatients()}
        {activeTab === 'doctors' && renderDoctors()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'finance' && renderFinance()}
        {activeTab === 'profile' && renderProfile()}
      </main>

      {/* Add Doctor Modal */}
      <AnimatePresence>
        {showAddDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddDoctor(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-slate-900">Add New Doctor</h3>
                  <button onClick={() => setShowAddDoctor(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <form onSubmit={handleAddDoctor} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Doctor Name</label>
                    <input 
                      type="text"
                      required
                      value={doctorForm.name}
                      onChange={(e) => setDoctorForm({...doctorForm, name: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Specialization</label>
                    <input 
                      type="text"
                      required
                      value={doctorForm.specialization}
                      onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="e.g. Cardiologist"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Monthly Salary</label>
                      <input 
                        type="number"
                        required
                        value={doctorForm.salary}
                        onChange={(e) => setDoctorForm({...doctorForm, salary: parseInt(e.target.value)})}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Commission (%)</label>
                      <input 
                        type="number"
                        required
                        value={doctorForm.commissionRate}
                        onChange={(e) => setDoctorForm({...doctorForm, commissionRate: parseInt(e.target.value)})}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:scale-[1.02] transition-transform">
                    Add Doctor
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Inventory Modal */}
      <AnimatePresence>
        {showAddInventory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddInventory(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-slate-900">Add Inventory Item</h3>
                  <button onClick={() => setShowAddInventory(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <form onSubmit={handleAddInventory} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Item Name</label>
                    <input 
                      type="text"
                      required
                      value={inventoryForm.itemName}
                      onChange={(e) => setInventoryForm({...inventoryForm, itemName: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
                      <select 
                        value={inventoryForm.category}
                        onChange={(e) => setInventoryForm({...inventoryForm, category: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      >
                        <option value="Medicine">Medicine</option>
                        <option value="Surgical">Surgical</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Stock Quantity</label>
                      <input 
                        type="number"
                        required
                        value={inventoryForm.stock}
                        onChange={(e) => setInventoryForm({...inventoryForm, stock: parseInt(e.target.value)})}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Min Stock Alert</label>
                      <input 
                        type="number"
                        required
                        value={inventoryForm.minStockAlert}
                        onChange={(e) => setInventoryForm({...inventoryForm, minStockAlert: parseInt(e.target.value)})}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Expiry Date</label>
                      <input 
                        type="date"
                        value={inventoryForm.expiryDate}
                        onChange={(e) => setInventoryForm({...inventoryForm, expiryDate: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Supplier Name</label>
                    <input 
                      type="text"
                      value={inventoryForm.supplierName}
                      onChange={(e) => setInventoryForm({...inventoryForm, supplierName: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                  <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:scale-[1.02] transition-transform">
                    Add Item
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddExpense && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddExpense(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-slate-900">Add Expense</h3>
                  <button onClick={() => setShowAddExpense(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <form onSubmit={handleAddExpense} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Title</label>
                    <input 
                      type="text"
                      required
                      value={expenseForm.title}
                      onChange={(e) => setExpenseForm({...expenseForm, title: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                      placeholder="e.g. Electricity Bill"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Category</label>
                      <select 
                        value={expenseForm.category}
                        onChange={(e) => setExpenseForm({...expenseForm, category: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      >
                        <option value="Utility">Utility</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Salary">Salary</option>
                        <option value="Supplies">Supplies</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Amount</label>
                      <input 
                        type="number"
                        required
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({...expenseForm, amount: parseInt(e.target.value)})}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase ml-1">Description</label>
                    <textarea 
                      value={expenseForm.description}
                      onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all min-h-[80px]"
                    />
                  </div>
                  <button type="submit" className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:scale-[1.02] transition-transform">
                    Add Expense
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBooking(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="bg-emerald-600 p-8 text-white relative">
                <button 
                  onClick={() => setSelectedBooking(null)}
                  className="absolute right-6 top-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedBooking.patientName}</h2>
                    <p className="text-white/70 font-medium">{selectedBooking.patientType} Patient</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {selectedBooking.bedType} Ward
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Status: {selectedBooking.status}
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Fingerprint className="w-3 h-3" /> Aadhar Number
                    </p>
                    <p className="font-bold text-slate-900">{selectedBooking.aadharNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Mobile
                    </p>
                    <p className="font-bold text-slate-900">{selectedBooking.mobileNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </p>
                    <p className="font-bold text-slate-900 truncate">{selectedBooking.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Booked At
                    </p>
                    <p className="font-bold text-slate-900">
                      {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : 'Just now'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Address
                  </p>
                  <p className="font-bold text-slate-900 leading-relaxed">{selectedBooking.address}</p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Medical Report
                  </p>
                  {selectedBooking.reportUrl ? (
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-6 rounded-3xl text-center">
                      <FileText className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-slate-900">Patient_Report.pdf</p>
                      <button className="mt-3 text-xs font-bold text-emerald-600 flex items-center gap-1 mx-auto hover:underline">
                        <ExternalLink className="w-3 h-3" /> View Full Report
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 italic">No report uploaded.</p>
                  )}
                </div>
              </div>

              <div className="p-8 bg-slate-50 flex flex-col gap-4">
                {selectedBooking.status === 'Admitted' && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-400 uppercase ml-1">Final Billing Amount (₹)</label>
                      <input 
                        type="number"
                        value={billingAmount}
                        onChange={(e) => setBillingAmount(parseInt(e.target.value) || 0)}
                        className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="Enter amount"
                      />
                    </div>
                    <button 
                      onClick={async () => {
                        if (billingAmount <= 0) return alert("Please enter a valid billing amount");
                        try {
                          await api.updateBookingStatus(selectedBooking._id, 'Discharged', { 
                            billingAmount,
                            paymentStatus: 'Paid' 
                          });
                          setSelectedBooking(null);
                          setBillingAmount(0);
                          fetchData();
                        } catch (error) {
                          console.error("Error discharging patient:", error);
                        }
                      }}
                      className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:scale-[1.02] transition-transform"
                    >
                      Discharge Patient
                    </button>
                  </div>
                )}

                {selectedBooking.status === 'Pending' && (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => {
                        updateStatus(selectedBooking._id, 'Admitted');
                        setSelectedBooking(null);
                      }}
                      className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:scale-[1.02] transition-transform"
                    >
                      Confirm Admission
                    </button>
                    <button 
                      onClick={() => {
                        updateStatus(selectedBooking._id, 'Rejected');
                        setSelectedBooking(null);
                      }}
                      className="flex-1 bg-white text-red-600 border-2 border-red-100 py-4 rounded-2xl font-bold hover:bg-red-50 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {selectedBooking.status === 'Discharged' && (
                  <div className="p-4 bg-emerald-50 rounded-2xl text-center">
                    <p className="text-emerald-600 font-bold">Patient Discharged</p>
                    <p className="text-xs text-emerald-500 mt-1">Total Bill: ₹{selectedBooking.billingAmount}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
