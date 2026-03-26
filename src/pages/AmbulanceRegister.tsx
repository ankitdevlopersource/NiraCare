import React from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Truck,
  Phone,
  ChevronRight,
  MapPin,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function AmbulanceRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleNumber: '',
    ambulanceType: 'Basic',
    licenseNumber: '',
    lat: '',
    lng: ''
  });
  const [isLocating, setIsLocating] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleGetLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          }));
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Could not get location. Please enter manually.");
          setIsLocating(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email.endsWith('@gmail.com')) {
      setError('Only Gmail addresses are allowed.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    
    setIsLoading(true);
    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'ambulance',
        phone: formData.phone,
        vehicleNumber: formData.vehicleNumber,
        ambulanceType: formData.ambulanceType,
        licenseNumber: formData.licenseNumber,
        location: {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        },
        isEmailVerified: true
      };

      const response = await api.register(registrationData);
      
      if (response.autoLogin) {
        localStorage.setItem('user', JSON.stringify(response.user));
        navigate('/app');
      } else {
        navigate('/login?role=ambulance&registered=true');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="w-full bg-emerald-600 sticky top-0 z-30 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <Plus className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="font-black text-white text-xl tracking-tighter">Healthhaven</span>
          </Link>
          <Link to="/login?role=ambulance" className="text-sm font-bold text-white/90 hover:text-white hover:underline">
            Already have an account? Sign In
          </Link>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center py-12 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
        >
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-10 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <Truck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black mb-2">Ambulance Registration</h1>
            <p className="text-white/80 text-sm">Join our network of life-saving responders and reach patients faster.</p>
          </div>

          <div className="p-10">
            <form onSubmit={handleRegister} className="space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Driver/Provider Name</label>
                  <input 
                    required
                    type="text"
                    placeholder="Enter full name"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                  <input 
                    required
                    type="email"
                    placeholder="ambulance@gmail.com"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label>
                  <input 
                    required
                    type="tel"
                    placeholder="+91 00000 00000"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Vehicle Number</label>
                  <input 
                    required
                    type="text"
                    placeholder="MH-12-AB-1234"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Ambulance Type</label>
                  <select 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium"
                    value={formData.ambulanceType}
                    onChange={(e) => setFormData({...formData, ambulanceType: e.target.value})}
                  >
                    <option value="Basic">Basic Life Support (BLS)</option>
                    <option value="Advanced">Advanced Life Support (ALS)</option>
                    <option value="Cardiac">Cardiac Care</option>
                    <option value="Neonatal">Neonatal Care</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">License Number</label>
                  <input 
                    required
                    type="text"
                    placeholder="LIC-123456"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Base Location</label>
                  <button 
                    type="button"
                    onClick={handleGetLocation}
                    className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline"
                  >
                    {isLocating ? 'Locating...' : 'Detect Location'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    required
                    type="text"
                    placeholder="Latitude"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium"
                    value={formData.lat}
                    onChange={(e) => setFormData({...formData, lat: e.target.value})}
                  />
                  <input 
                    required
                    type="text"
                    placeholder="Longitude"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium"
                    value={formData.lng}
                    onChange={(e) => setFormData({...formData, lng: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                  <input 
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Confirm</label>
                  <input 
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-emerald-500 focus:bg-white outline-none transition-all font-medium"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 mt-4 disabled:opacity-70"
              >
                {isLoading ? 'Creating Account...' : 'Register Ambulance'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
