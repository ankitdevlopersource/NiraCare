import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { HOSPITALS } from '../constants';
import { 
  ArrowLeft, 
  Ambulance as AmbulanceIcon, 
  Phone, 
  MapPin, 
  Navigation,
  CheckCircle2,
  AlertCircle,
  Locate,
  Map as MapIcon,
  User,
  Users,
  CreditCard,
  Mail,
  Hospital as HospitalIcon,
  ChevronRight,
  Timer,
  ShieldCheck,
  Download
} from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';

// Fix Leaflet marker icons
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function ChangeView({ center, driverLocation }: { center: [number, number], driverLocation?: [number, number] | null }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (driverLocation) {
      const bounds = L.latLngBounds([center, driverLocation]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      map.setView(center, 14);
    }
  }, [center, driverLocation, map]);

  return null;
}

export default function AmbulanceBooking() {
  const navigate = useNavigate();
  const [step, setStep] = React.useState<'details' | 'select' | 'tracking'>('details');
  
  // Form State
  const [patientName, setPatientName] = React.useState('');
  const [fatherName, setFatherName] = React.useState('');
  const [aadharNumber, setAadharNumber] = React.useState('');
  const [mobileNumber, setMobileNumber] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [destination, setDestination] = React.useState('');
  
  // Location State
  const [location, setLocation] = React.useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = React.useState(false);
  const [ambulances, setAmbulances] = React.useState<any[]>([]);
  const [isLoadingAmbulances, setIsLoadingAmbulances] = React.useState(false);
  
  // Booking State
  const [bookingStatus, setBookingStatus] = React.useState<'idle' | 'booking' | 'confirmed'>('idle');

  // Fetch ambulances when moving to select step
  React.useEffect(() => {
    if (step === 'select') {
      const fetchAmbulances = async () => {
        setIsLoadingAmbulances(true);
        try {
          const users = await api.getUsers();
          // Filter for approved ambulances
          const approvedAmbulances = users
            .filter((u: any) => u.role === 'ambulance' && u.isApproved)
            .map((u: any) => ({
              id: u._id,
              _id: u._id,
              numberPlate: u.name, // Using name as number plate for now
              type: 'Advanced', // Default type
              status: 'Available', // Default status
              phone: u.phone || 'N/A',
              location: u.location || null
            }));
          setAmbulances(approvedAmbulances);
        } catch (error) {
          console.error("Failed to fetch ambulances:", error);
        } finally {
          setIsLoadingAmbulances(false);
        }
      };
      fetchAmbulances();
    }
  }, [step]);
  const [bookingId, setBookingId] = React.useState<string | null>(null);
  const [bookingData, setBookingData] = React.useState<any>(null);
  const [timeLeft, setTimeLeft] = React.useState(180); // 3 minutes in seconds

  // Timer for pending status
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'tracking' && bookingData?.status === 'Pending' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, bookingData?.status, timeLeft]);

  // Poll for real-time updates to the booking
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (bookingId && step === 'tracking') {
      const fetchBooking = async () => {
        try {
          const data = await api.getAmbulanceBookingById(bookingId);
          setBookingData(data);
        } catch (error) {
          console.error("Error polling booking:", error);
        }
      };
      
      fetchBooking();
      interval = setInterval(fetchBooking, 5000);
    }
    return () => clearInterval(interval);
  }, [bookingId, step]);

  const requestLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation([position.coords.latitude, position.coords.longitude]);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLocating(false);
        }
      );
    } else {
      console.warn("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleNext = () => {
    if (!patientName || !fatherName || !aadharNumber || !mobileNumber || !email || !destination || !location) {
      console.warn("Please fill all details and allow location access.");
      return;
    }
    setStep('select');
  };

  const handleBook = async (amb: any) => {
    setBookingStatus('booking');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    try {
      const data = await api.createAmbulanceBooking({
        userId: user.id || 'anonymous',
        patientName,
        fatherName,
        aadharNumber,
        mobileNumber,
        email,
        destination,
        ambulanceType: amb.type,
        pickupLocation: {
          lat: location![0],
          lng: location![1],
        },
      });
      setBookingId(data._id);
      setBookingData(data);
      setStep('tracking');
      setBookingStatus('confirmed');
    } catch (error) {
      console.error("Error booking ambulance:", error);
      setBookingStatus('idle');
    }
  };

  const handleCancelAndRebook = async () => {
    // In a real app, we might want to mark the booking as cancelled in the DB
    setBookingId(null);
    setBookingData(null);
    setStep('select');
    setBookingStatus('idle');
    setTimeLeft(180);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="px-6 pt-6 flex items-center gap-4 sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 pb-4">
        <button 
          onClick={() => step === 'details' ? navigate(-1) : setStep(step === 'select' ? 'details' : 'select')}
          className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-xl font-bold text-slate-900">
          {step === 'details' ? 'Patient Details' : step === 'select' ? 'Select Ambulance' : 'Live Tracking'}
        </h1>
      </header>

      <div className="px-6 mt-4">
        <div className="flex justify-end mb-2">
          <button 
            onClick={() => navigate('/ambulance-login')}
            className="text-xs font-bold text-slate-400 hover:text-red-600 transition-colors flex items-center gap-1"
          >
            <AmbulanceIcon className="w-3 h-3" /> Driver Login
          </button>
        </div>
        <AnimatePresence mode="wait">
          {step === 'details' && (
            <motion.div 
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Emergency Note */}
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-red-900">Emergency Note</p>
                  <p className="text-xs text-red-700 mt-1">For critical emergencies, please call 102 immediately.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Patient Name" 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Users className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Father's Name" 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Aadhar Number" 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all"
                      value={aadharNumber}
                      onChange={(e) => setAadharNumber(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="tel" 
                      placeholder="Mobile Number" 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <HospitalIcon className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                    <select 
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl py-3 pl-12 pr-4 outline-none transition-all appearance-none"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    >
                      <option value="">Select Destination Hospital</option>
                      {HOSPITALS.map(h => (
                        <option key={h.id} value={h.name}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Locate className="w-5 h-5 text-blue-600" /> Pickup Location
                  </h3>
                  {!location && (
                    <button 
                      onClick={requestLocation}
                      disabled={isLocating}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      {isLocating ? 'Locating...' : 'Get My Location'}
                    </button>
                  )}
                </div>
                
                {location ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-2xl border border-blue-100">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-xs font-bold text-blue-900">Current Location Detected</p>
                        <p className="text-[10px] text-blue-700">{location[0].toFixed(4)}, {location[1].toFixed(4)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                    <MapIcon className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-xs text-slate-400 font-medium">Please allow location access to continue</p>
                  </div>
                )}
              </div>

              <button 
                onClick={handleNext}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                Next Step <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 'select' && (
            <motion.div 
              key="select"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider ml-1">Available Ambulances Near You</h3>
              {isLoadingAmbulances ? (
                <div className="flex justify-center p-10">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : ambulances.length === 0 ? (
                <div className="bg-white p-10 rounded-3xl border border-slate-100 text-center">
                  <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 font-bold">No approved ambulances available in your area.</p>
                </div>
              ) : (
                ambulances.map((amb, idx) => (
                  <motion.div 
                    key={amb.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100"
                  >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl ${
                        amb.status === 'Available' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <AmbulanceIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{amb.numberPlate}</h3>
                        <p className="text-xs text-slate-500 font-medium">{amb.type} Support • 2.4 km away</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      amb.status === 'Available' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {amb.status}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <button 
                      disabled={amb.status !== 'Available' || bookingStatus === 'booking'}
                      onClick={() => handleBook(amb)}
                      className={`w-full py-4 rounded-2xl font-bold transition-all ${
                        amb.status === 'Available'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {bookingStatus === 'booking' ? 'Booking...' : `Book ${amb.type} Ambulance`}
                    </button>
                  </div>
                </motion.div>
                ))
              )}
            </motion.div>
          )}

          {step === 'tracking' && (
            <motion.div 
              key="tracking"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div 
                id="ambulance-slip"
                className="bg-white p-5 sm:p-6 rounded-3xl shadow-xl border border-slate-100"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {bookingData?.status === 'Pending' ? 'Finding Driver...' : 'Driver Assigned'}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {bookingData?.status === 'Pending' 
                        ? 'Waiting for driver to accept' 
                        : 'Ambulance is on its way'}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    bookingData?.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {bookingData?.status === 'Pending' ? <Timer className="w-6 h-6 animate-pulse" /> : <CheckCircle2 className="w-6 h-6" />}
                  </div>
                </div>

                {/* Map View */}
                <div className="h-48 sm:h-64 rounded-2xl overflow-hidden border border-slate-100 relative">
                  {location && (
                    <MapContainer center={location} zoom={14} style={{ height: '100%', width: '100%' }}>
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={location}>
                        <Popup>Pickup: {patientName}</Popup>
                      </Marker>
                      {bookingData?.driverLocation && (
                        <Marker 
                          position={[bookingData.driverLocation.lat, bookingData.driverLocation.lng]}
                          icon={L.icon({
                            iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
                            iconSize: [40, 40],
                            iconAnchor: [20, 20]
                          })}
                        >
                          <Popup>Ambulance</Popup>
                        </Marker>
                      )}
                      <ChangeView 
                        center={location} 
                        driverLocation={bookingData?.driverLocation ? [bookingData.driverLocation.lat, bookingData.driverLocation.lng] : null} 
                      />
                    </MapContainer>
                  )}
                  
                  {bookingData?.status === 'Pending' && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-slate-100 flex items-center gap-2">
                      <Timer className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-bold text-slate-900">{formatTime(timeLeft)}</span>
                    </div>
                  )}
                </div>

                {/* OTP Section */}
                {bookingData?.status !== 'Pending' && (
                  <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Pickup OTP</p>
                        <p className="text-lg font-black text-emerald-900 tracking-widest">{bookingData?.otp}</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-600 font-medium text-right max-w-[120px]">
                      Share this OTP with driver only at pickup
                    </p>
                  </div>
                )}

                {/* Driver Info */}
                <div className="mt-6 flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Driver</p>
                      <h4 className="font-bold text-slate-900">
                        {bookingData?.status === 'Pending' ? 'Finding Driver...' : 'Rajesh Kumar'}
                      </h4>
                    </div>
                  </div>
                  {bookingData?.status !== 'Pending' && (
                    <a href="tel:+919876543210" className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100">
                      <Phone className="w-5 h-5" />
                    </a>
                  )}
                </div>

                {/* Download Button */}
                <button 
                  onClick={() => generatePDF('ambulance-slip', `Ambulance_Slip_${Date.now()}`)}
                  className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl"
                >
                  <Download className="w-4 h-4" /> Download Booking Slip
                </button>

                {/* Timeout Action */}
                {bookingData?.status === 'Pending' && timeLeft === 0 && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-3">
                    <p className="text-xs text-amber-800 font-medium text-center">
                      No driver accepted your request within 3 minutes.
                    </p>
                    <button 
                      onClick={handleCancelAndRebook}
                      className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-100"
                    >
                      Try Another Ambulance
                    </button>
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate('/')}
                className="w-full py-4 text-slate-500 font-bold hover:text-slate-700 transition-colors"
              >
                Cancel Booking
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
