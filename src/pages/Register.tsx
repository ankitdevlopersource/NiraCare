import React from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  User,
  Phone,
  UserPlus,
  Stethoscope,
  Hospital,
  Ambulance as AmbulanceIcon,
  UserRound,
  ShieldCheck,
  Plus,
  ChevronRight,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const role = searchParams.get('role') || 'patient';
  
  const roles = [
    { id: 'patient', label: 'Patient', icon: UserRound },
    { id: 'doctor', label: 'Doctor', icon: Stethoscope },
    { id: 'hospital', label: 'Hospital', icon: Hospital },
    { id: 'ambulance', label: 'Ambulance', icon: AmbulanceIcon },
    { id: 'owner', label: 'Owner', icon: ShieldCheck },
  ];
  
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Hospital specific
    hospitalName: '',
    hospitalOwnerName: '',
    hospitalLicense: '',
    hospitalEmail: '',
    // Ambulance specific
    ambulanceName: '',
    ambulanceOwnerName: '',
    ambulanceRegNumber: '',
    ambulanceDriverName: '',
    ambulanceLicense: '',
    // Common/geo
    address: '',
    totalBeds: '',
    availableBeds: '',
    lat: '',
    lng: ''
  });
  const [isLocating, setIsLocating] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [apiStatus, setApiStatus] = React.useState<any>(null);

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
          
          // If we get HTML, the server is likely still starting
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

  const getRoleConfig = () => {
    switch (role) {
      case 'doctor': return { 
        label: 'Doctor', 
        icon: Stethoscope, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-600',
        accent: 'from-emerald-600 to-teal-700',
        quote: "Join our global network of medical experts and elevate patient care."
      };
      case 'hospital': return { 
        label: 'Hospital', 
        icon: Hospital, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-600',
        accent: 'from-emerald-600 to-teal-700',
        quote: "Transform your facility into a smart healthcare hub with HealthHaven."
      };
      case 'ambulance': return { 
        label: 'Ambulance', 
        icon: AmbulanceIcon, 
        color: 'text-blue-600', 
        bg: 'bg-blue-600',
        accent: 'from-blue-600 to-indigo-700',
        quote: "Join our rapid response network and save lives in real-time."
      };
      case 'owner': return { 
        label: 'Owner', 
        icon: ShieldCheck, 
        color: 'text-orange-600', 
        bg: 'bg-orange-600',
        accent: 'from-orange-600 to-red-700',
        quote: "Architect the future of healthcare with enterprise-grade management."
      };
      default: return { 
        label: 'Patient', 
        icon: UserRound, 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-600',
        accent: 'from-emerald-600 to-teal-700',
        quote: "Experience healthcare that's faster, smarter, and always within reach."
      };
    }
  };

  const config = getRoleConfig();

  const handleGetLocation = async () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Update coordinates
          setFormData(prev => ({
            ...prev,
            lat: lat.toString(),
            lng: lng.toString()
          }));

          // Fetch place name using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();

            if (data && data.display_name) {
              // Extract a readable address from the response
              const address = data.display_name.split(', ').slice(0, 4).join(', ');
              setFormData(prev => ({
                ...prev,
                address: address
              }));
            }
          } catch (error) {
            console.error("Error fetching place name:", error);
            // Still set coordinates even if place name fetch fails
          }

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

    if (role === 'hospital') {
      if (!formData.hospitalName.trim() || !formData.hospitalOwnerName.trim() || !formData.hospitalLicense.trim() || !formData.hospitalEmail.trim()) {
        setError('Please fill in all hospital details.');
        return;
      }
    }

    if (role === 'ambulance') {
      if (!formData.ambulanceName.trim() || !formData.ambulanceOwnerName.trim() || !formData.ambulanceRegNumber.trim() || !formData.ambulanceDriverName.trim() || !formData.ambulanceLicense.trim()) {
        setError('Please fill in all ambulance details.');
        return;
      }
    }

    setIsLoading(true);
    try {
      const registrationData: any = {
        name: role === 'hospital' ? formData.hospitalName : role === 'ambulance' ? formData.ambulanceName : formData.name,
        email: formData.email,
        password: formData.password,
        role: role,
        phone: formData.phone,
        isEmailVerified: true
      };

      if (role === 'hospital' || role === 'ambulance') {
        registrationData.address = formData.address;
        if (role === 'hospital') {
          registrationData.hospitalName = formData.hospitalName;
          registrationData.hospitalOwnerName = formData.hospitalOwnerName;
          registrationData.hospitalLicense = formData.hospitalLicense;
          registrationData.hospitalEmail = formData.hospitalEmail;
          registrationData.totalBeds = parseInt(formData.totalBeds);
          registrationData.availableBeds = parseInt(formData.availableBeds);
        }
        if (role === 'ambulance') {
          registrationData.ambulanceName = formData.ambulanceName;
          registrationData.ambulanceOwnerName = formData.ambulanceOwnerName;
          registrationData.ambulanceRegNumber = formData.ambulanceRegNumber;
          registrationData.ambulanceDriverName = formData.ambulanceDriverName;
          registrationData.ambulanceLicense = formData.ambulanceLicense;
        }
        registrationData.location = {
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        };
      }

      await api.register({
        ...registrationData,
        role
      });
      navigate('/login?role=' + role);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="w-full bg-blue-600 sticky top-0 z-30 shadow-lg">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-black text-white text-xl tracking-tighter">HealthHaven</span>
            </Link>
            <Link 
              to={`/login?role=${role}`}
              className="text-sm font-bold text-white/90 hover:text-white hover:underline flex items-center gap-2"
            >
              Already have an account? Sign In
            </Link>
          </div>

          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm p-1.5 rounded-2xl w-full">
            {roles.map((r) => (
              <button
                key={r.id}
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
                }`}
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden border border-slate-100"
        >
          {/* Hero Section */}
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
                Create <span className="opacity-60 font-light italic">Account</span>
              </h1>
              <p className="text-white/80 font-medium max-w-md leading-relaxed">
                {config.quote}
              </p>
            </div>
          </div>

          <div className="p-10 lg:p-16">
            {role === 'owner' ? (
              <div className="space-y-8">
                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-8">
                  <h2 className="text-2xl font-bold text-orange-900 mb-4">Owner Access</h2>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-orange-800 font-medium leading-relaxed">
                      Owner login is restricted to authorized administrators only. 
                      <br />
                      If you are an authorized owner, please proceed to login with your assigned credentials.
                    </p>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => navigate('/login?role=owner')}
                  className="w-full bg-orange-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-slate-200 group hover:bg-orange-700 transition-colors"
                >
                  Go to Owner Login
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  {role === 'hospital' ? 'Hospital Name' : role === 'ambulance' ? 'Ambulance Name' : 'Full Name'}
                </label>
                <div className="relative group">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-r border-slate-100 group-focus-within:border-blue-200 transition-colors`}>
                    <User className={`w-5 h-5 text-slate-400 group-focus-within:${config.color}`} />
                  </div>
                  <input 
                    required
                    type="text"
                    placeholder={role === 'hospital' ? 'Enter hospital name' : role === 'ambulance' ? 'Enter ambulance name' : 'Enter your full name'}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-16 pr-4 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                    value={role === 'hospital' ? formData.hospitalName : role === 'ambulance' ? formData.ambulanceName : formData.name}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (role === 'hospital') setFormData({...formData, hospitalName: value});
                      else if (role === 'ambulance') setFormData({...formData, ambulanceName: value});
                      else setFormData({...formData, name: value});
                    }}
                  />
                </div>
              </div>

              {(role === 'hospital' || role === 'ambulance') && (
                <div className="space-y-6 pt-6 border-t border-slate-100">
                  {role === 'hospital' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Hospital Owner Name</label>
                        <input
                          required
                          type="text"
                          placeholder="Enter owner name"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                          value={formData.hospitalOwnerName}
                          onChange={(e) => setFormData({...formData, hospitalOwnerName: e.target.value})}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Hospital License</label>
                          <input
                            required
                            type="text"
                            placeholder="Enter license number"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                            value={formData.hospitalLicense}
                            onChange={(e) => setFormData({...formData, hospitalLicense: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Hospital Email</label>
                          <input
                            required
                            type="email"
                            placeholder="hospital@example.com"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                            value={formData.hospitalEmail}
                            onChange={(e) => setFormData({...formData, hospitalEmail: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Total Beds</label>
                          <input
                            required
                            type="number"
                            placeholder="e.g. 100"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                            value={formData.totalBeds}
                            onChange={(e) => setFormData({...formData, totalBeds: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 ml-1">Available Beds</label>
                          <input
                            required
                            type="number"
                            placeholder="e.g. 25"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                            value={formData.availableBeds}
                            onChange={(e) => setFormData({...formData, availableBeds: e.target.value})}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {role === 'ambulance' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Ambulance Owner Name</label>
                        <input
                          required
                          type="text"
                          placeholder="Enter owner name"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                          value={formData.ambulanceOwnerName}
                          onChange={(e) => setFormData({...formData, ambulanceOwnerName: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Ambulance Registration Number</label>
                        <input
                          required
                          type="text"
                          placeholder="Enter reg number"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                          value={formData.ambulanceRegNumber}
                          onChange={(e) => setFormData({...formData, ambulanceRegNumber: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Ambulance Driver Name</label>
                        <input
                          required
                          type="text"
                          placeholder="Enter driver name"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                          value={formData.ambulanceDriverName}
                          onChange={(e) => setFormData({...formData, ambulanceDriverName: e.target.value})}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Ambulance License</label>
                        <input
                          required
                          type="text"
                          placeholder="Enter vehicle license"
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                          value={formData.ambulanceLicense}
                          onChange={(e) => setFormData({...formData, ambulanceLicense: e.target.value})}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-r border-slate-100 group-focus-within:border-blue-200 transition-colors">
                      <Mail className={`w-5 h-5 text-slate-400 group-focus-within:${config.color}`} />
                    </div>
                    <input 
                      required
                      type="email"
                      placeholder="name@gmail.com"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-16 pr-4 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium disabled:opacity-50"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-r border-slate-100 group-focus-within:border-blue-200 transition-colors">
                      <Phone className={`w-5 h-5 text-slate-400 group-focus-within:${config.color}`} />
                    </div>
                    <input 
                      required
                      type="tel"
                      placeholder="+91 00000 00000"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-16 pr-4 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-r border-slate-100 group-focus-within:border-blue-200 transition-colors">
                      <Lock className={`w-5 h-5 text-slate-400 group-focus-within:${config.color}`} />
                    </div>
                    <input 
                      required
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-16 pr-4 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-r border-slate-100 group-focus-within:border-blue-200 transition-colors">
                      <Lock className={`w-5 h-5 text-slate-400 group-focus-within:${config.color}`} />
                    </div>
                    <input 
                      required
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-16 pr-4 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {(role === 'hospital' || role === 'ambulance') && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6 pt-6 border-t border-slate-100"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">
                      {role === 'hospital' ? 'Hospital Address' : 'Base Address'}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border-r border-slate-100 group-focus-within:border-blue-200 transition-colors">
                        <MapPin className={`w-5 h-5 text-slate-400 group-focus-within:${config.color}`} />
                      </div>
                      <input 
                        required
                        type="text"
                        placeholder={role === 'hospital' ? "Full hospital address" : "Ambulance base address"}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-16 pr-4 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                  </div>


                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700 ml-1">Location Details</label>
                      <button
                        type="button"
                        onClick={handleGetLocation}
                        disabled={isLocating}
                        className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        {isLocating ? 'Locating...' : 'Detect My Location'}
                      </button>
                    </div>

                    {/* Address Field */}
                    <input
                      required
                      type="text"
                      placeholder="Location Address (auto-filled when detecting location)"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />

                    {/* Coordinates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <input
                        required
                        type="text"
                        placeholder="Latitude"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                        value={formData.lat}
                        onChange={(e) => setFormData({...formData, lat: e.target.value})}
                      />
                      <input
                        required
                        type="text"
                        placeholder="Longitude"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-blue-500 focus:bg-white outline-none transition-all text-slate-900 font-medium"
                        value={formData.lng}
                        onChange={(e) => setFormData({...formData, lng: e.target.value})}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className={`w-full ${config.bg} text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-slate-200 mt-8 group disabled:opacity-70`}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  <>
                    Create {config.label} Account
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>
            )}
          </div>
        </motion.div>

        <footer className="mt-12 text-center max-w-md">
          <p className="text-slate-400 text-xs font-medium leading-relaxed">
            By registering, you agree to our <span className="text-slate-600 underline cursor-pointer">Terms of Service</span> and <span className="text-slate-600 underline cursor-pointer">Privacy Policy</span>.
            <br />© 2026 Healthhaven Healthcare Logistics.
          </p>
        </footer>
      </main>
    </div>
  );
}
