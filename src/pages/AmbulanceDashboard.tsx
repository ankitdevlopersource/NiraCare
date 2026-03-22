import React from 'react';
import { 
  ArrowLeft, 
  Ambulance as AmbulanceIcon, 
  MapPin, 
  Phone, 
  Navigation, 
  Clock, 
  CheckCircle2, 
  XCircle,
  User,
  Hospital,
  Map as MapIcon,
  Locate,
  X,
  ShieldCheck,
  CreditCard,
  Users,
  Mail,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

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

export default function AmbulanceDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const [driverLocation, setDriverLocation] = React.useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = React.useState(false);
  const [watchId, setWatchId] = React.useState<number | null>(null);
  const [otpInput, setOtpInput] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [isApproved, setIsApproved] = React.useState<boolean | null>(null);

  const fetchOrders = async () => {
    try {
      // Check approval status first
      const user = await api.getCurrentUser();
      setIsApproved(user?.isApproved ?? false);

      if (user?.isApproved) {
        const data = await api.getAmbulanceBookings();
        setOrders(data);
      }
    } catch (error) {
      console.error("Error fetching ambulance orders:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Start watching location on mount
  React.useEffect(() => {
    requestDriverLocation();
    return () => {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Sync location to MongoDB when driverLocation or orders change
  React.useEffect(() => {
    if (driverLocation) {
      const activeOrder = orders.find(o => o.status === 'In Progress');
      if (activeOrder) {
        api.updateAmbulanceBookingStatus(activeOrder._id, 'In Progress', {
          driverLocation: {
            lat: driverLocation[0],
            lng: driverLocation[1]
          }
        }).catch(err => console.error("Error updating driver location:", err));
      }
    }
  }, [driverLocation, orders]);

  const handleAccept = async (id: string) => {
    try {
      await api.updateAmbulanceBookingStatus(id, 'In Progress', {
        driverId: 'DRIVER_123' // Mock driver ID
      });
      fetchOrders();
    } catch (error) {
      console.error("Error accepting order:", error);
    }
  };

  const handleVerifyOtp = async (order: any) => {
    if (otpInput === order.otp) {
      setIsVerifying(true);
      try {
        await api.updateAmbulanceBookingStatus(order._id, 'Completed', {
          otpVerified: true
        });
        setOtpInput('');
        setSelectedOrder(null);
        fetchOrders();
        console.log("OTP Verified! Patient picked up successfully.");
      } catch (error) {
        console.error("Error verifying OTP:", error);
      } finally {
        setIsVerifying(false);
      }
    } else {
      console.warn("Invalid OTP. Please check with the patient.");
    }
  };

  const requestDriverLocation = () => {
    if (watchId !== null) return; // Already watching

    setIsLocating(true);
    if ("geolocation" in navigator) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newLoc: [number, number] = [position.coords.latitude, position.coords.longitude];
          setDriverLocation(newLoc);
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting driver location:", error);
          setIsLocating(false);
        },
        { enableHighAccuracy: true } // Update as frequently as possible
      );
      setWatchId(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <header className="px-6 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Ambulance Panel</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-bold text-slate-500">Live Sync</span>
        </div>
      </header>
      
      {isApproved === false && (
        <div className="px-6 mt-8">
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-amber-900 mb-2">Registration Pending</h2>
            <p className="text-sm text-amber-700 max-w-xs">
              Your ambulance registration is currently being reviewed by the administrator. 
              You will be able to accept requests once approved.
            </p>
          </div>
        </div>
      )}

      {/* Vehicle Info */}
      <div className="px-6 mt-8">
        <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-xl shadow-blue-200 flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80 font-bold uppercase tracking-wider">Vehicle Number</p>
            <h2 className="text-2xl font-bold mt-1">DL 1CA 1234</h2>
            <p className="text-sm mt-2 flex items-center gap-1.5">
              <AmbulanceIcon className="w-4 h-4" /> Advanced Life Support
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Navigation className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Active Orders */}
      <section className="px-6 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-slate-900">New Requests</h4>
          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-bold">
            {orders.filter(o => o.status === 'Pending').length} NEW
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="font-bold text-slate-400 text-sm">Loading requests...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-slate-200 text-center">
            <XCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-bold text-slate-400">No requests found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <motion.div 
                key={order._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900">{order.patientName}</h5>
                      <p className="text-xs text-slate-500">{order.mobileNumber}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                    order.status === 'In Progress' ? 'bg-blue-100 text-blue-600' : 
                    order.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-600"></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Pickup Location</p>
                      <p className="text-sm font-medium text-slate-700">Current Location (Map View Available)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-2 h-2 rounded-full bg-emerald-600"></div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Destination</p>
                      <p className="text-sm font-medium text-slate-700">{order.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                  <button 
                    onClick={() => setSelectedOrder(order)}
                    className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <MapIcon className="w-4 h-4" /> View Map
                  </button>
                  {order.status === 'Pending' && (
                    <button 
                      onClick={() => handleAccept(order._id)}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-100"
                    >
                      Accept Order
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Map Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="bg-blue-600 p-8 text-white relative">
                <button 
                  onClick={() => {
                    setSelectedOrder(null);
                    setOtpInput('');
                  }}
                  className="absolute right-6 top-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedOrder.patientName}</h2>
                    <p className="text-white/70 font-medium">Pickup Request</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Father's Name</p>
                    <p className="text-xs font-bold text-slate-700">{selectedOrder.fatherName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Aadhar No</p>
                    <p className="text-xs font-bold text-slate-700">{selectedOrder.aadharNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                    <p className="text-xs font-bold text-slate-700 truncate max-w-[120px]">{selectedOrder.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Hospital className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Hospital</p>
                    <p className="text-xs font-bold text-slate-700">{selectedOrder.destination}</p>
                  </div>
                </div>
              </div>

              <div className="p-0 h-[300px] relative">
                {!driverLocation ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 p-10 text-center">
                    <Locate className="w-12 h-12 text-blue-600 mb-4 animate-bounce" />
                    <h3 className="font-bold text-slate-900 mb-2">Location Permission Required</h3>
                    <p className="text-sm text-slate-500 mb-6">Please allow location access to see your position relative to the patient.</p>
                    <button 
                      onClick={requestDriverLocation}
                      disabled={isLocating}
                      className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100"
                    >
                      {isLocating ? 'Locating...' : 'Allow Location'}
                    </button>
                  </div>
                ) : (
                  <MapContainer 
                    center={[selectedOrder.pickupLocation.lat, selectedOrder.pickupLocation.lng]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    {/* Patient Marker */}
                    <Marker position={[selectedOrder.pickupLocation.lat, selectedOrder.pickupLocation.lng]}>
                      <Popup>Patient Pickup: {selectedOrder.patientName}</Popup>
                    </Marker>

                    {/* Driver Marker */}
                    <Marker 
                      position={driverLocation}
                      icon={L.icon({
                        iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // Ambulance icon
                        iconSize: [40, 40],
                        iconAnchor: [20, 20]
                      })}
                    >
                      <Popup>Your Location (Ambulance)</Popup>
                    </Marker>

                    <ChangeView 
                      center={[selectedOrder.pickupLocation.lat, selectedOrder.pickupLocation.lng]} 
                      driverLocation={driverLocation}
                    />
                  </MapContainer>
                )}
              </div>

                {selectedOrder.status === 'In Progress' && (
                  <div className="p-6 bg-white border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <ShieldCheck className="w-5 h-5 text-amber-600" />
                      </div>
                      <h4 className="font-bold text-slate-900">Verify Pickup OTP</h4>
                    </div>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Enter 6-digit OTP" 
                        maxLength={6}
                        className="flex-1 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl py-3 px-4 outline-none transition-all font-bold tracking-widest text-center"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                      />
                      <button 
                        onClick={() => handleVerifyOtp(selectedOrder)}
                        disabled={isVerifying || otpInput.length !== 6}
                        className="px-6 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 disabled:opacity-50"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                )}

              <div className="p-8 bg-slate-50 flex gap-3">
                <a 
                  href={`tel:${selectedOrder.mobileNumber}`}
                  className="flex-1 bg-white text-slate-600 border-2 border-slate-100 py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Call Patient
                </a>
                {selectedOrder.status === 'Pending' && (
                  <button 
                    onClick={() => {
                      handleAccept(selectedOrder._id);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100"
                  >
                    Accept Order
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
