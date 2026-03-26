import React from 'react';
import {
  MapPin,
  Phone,
  Clock,
  Droplet,
  Navigation,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface BloodBank {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  bloodTypes: string[];
  hours: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  city: string;
}

const DELHI_BLOOD_BANKS: BloodBank[] = [
  {
    id: 'd1',
    name: 'AIIMS Blood Bank',
    address: 'Ansari Nagar, New Delhi, Delhi 110029',
    phone: '+91 11 2658 8500',
    distance: '2.3 km',
    bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    hours: '24/7',
    coordinates: { lat: 28.5672, lng: 77.2100 },
    city: 'Delhi'
  },
  {
    id: 'd2',
    name: 'Safdarjung Hospital Blood Bank',
    address: 'Ansari Nagar West, New Delhi, Delhi 110029',
    phone: '+91 11 2670 0000',
    distance: '3.1 km',
    bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    hours: '24/7',
    coordinates: { lat: 28.5685, lng: 77.2029 },
    city: 'Delhi'
  },
  {
    id: 'd3',
    name: 'Max Super Speciality Hospital Blood Bank',
    address: '1,2, Press Enclave Road, Saket, New Delhi, Delhi 110017',
    phone: '+91 11 2651 5050',
    distance: '4.7 km',
    bloodTypes: ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'],
    hours: '8:00 AM - 8:00 PM',
    coordinates: { lat: 28.5276, lng: 77.2197 },
    city: 'Delhi'
  },
  {
    id: 'd4',
    name: 'Apollo Hospital Blood Bank',
    address: 'Mathura Road, Sarita Vihar, New Delhi, Delhi 110076',
    phone: '+91 11 2692 5858',
    distance: '5.2 km',
    bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    hours: '24/7',
    coordinates: { lat: 28.5355, lng: 77.2881 },
    city: 'Delhi'
  }
];

const MEERUT_BLOOD_BANKS: BloodBank[] = [
  {
    id: 'm1',
    name: 'Subharti Hospital Blood Bank',
    address: 'Subhartipuram, NH-58, Delhi-Haridwar Bypass Road, Meerut, Uttar Pradesh 250005',
    phone: '+91 121 243 9043',
    distance: '1.8 km',
    bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    hours: '24/7',
    coordinates: { lat: 28.9845, lng: 77.7064 },
    city: 'Meerut'
  },
  {
    id: 'm2',
    name: 'Lala Lajpat Rai Memorial Medical College Blood Bank',
    address: 'Garh Road, Meerut, Uttar Pradesh 250004',
    phone: '+91 121 276 5747',
    distance: '2.5 km',
    bloodTypes: ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'],
    hours: '9:00 AM - 5:00 PM',
    coordinates: { lat: 28.9739, lng: 77.6733 },
    city: 'Meerut'
  },
  {
    id: 'm3',
    name: 'Meerut Medical Centre Blood Bank',
    address: 'Mohkampur, Delhi Road, Meerut, Uttar Pradesh 250002',
    phone: '+91 121 244 4444',
    distance: '3.2 km',
    bloodTypes: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    hours: '8:00 AM - 8:00 PM',
    coordinates: { lat: 28.9900, lng: 77.7600 },
    city: 'Meerut'
  },
  {
    id: 'm4',
    name: 'Anand Hospital Blood Bank',
    address: '45/1, Sardhana Road, Meerut, Uttar Pradesh 250001',
    phone: '+91 121 260 0000',
    distance: '4.1 km',
    bloodTypes: ['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'],
    hours: '24/7',
    coordinates: { lat: 28.9900, lng: 77.7600 },
    city: 'Meerut'
  }
];

export default function BloodBank() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = React.useState<'Delhi' | 'Meerut'>('Delhi');
  const [userLocation, setUserLocation] = React.useState<{ lat: number; lng: number } | null>(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isDoctorOrPatient = user.role === 'doctor' || user.role === 'patient' || !user.role;

  // Redirect if not doctor or patient
  React.useEffect(() => {
    if (user.role && !isDoctorOrPatient) {
      navigate('/app');
    }
  }, [user.role, isDoctorOrPatient, navigate]);

  // Get user's location for distance calculation
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to Delhi coordinates if location access denied
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    }
  }, []);

  const bloodBanks = selectedCity === 'Delhi' ? DELHI_BLOOD_BANKS : MEERUT_BLOOD_BANKS;

  const handleViewMap = (bank: BloodBank) => {
    // Open Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${bank.coordinates.lat},${bank.coordinates.lng}`;
    window.open(url, '_blank');
  };

  const handleViewDirections = (bank: BloodBank) => {
    // Open Google Maps with directions from current location
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${bank.coordinates.lat},${bank.coordinates.lng}`;
      window.open(url, '_blank');
    } else {
      // Fallback to just destination
      handleViewMap(bank);
    }
  };

  if (!isDoctorOrPatient) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Blood Banks</h1>
          <p className="text-slate-600">Find nearest blood banks with real-time availability</p>
        </div>
      </div>

      {/* City Selector */}
      <div className="flex gap-3 mb-6">
        {(['Delhi', 'Meerut'] as const).map((city) => (
          <button
            key={city}
            onClick={() => setSelectedCity(city)}
            className={`px-6 py-3 rounded-2xl font-bold transition-all ${
              selectedCity === city
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white text-slate-600 hover:bg-red-50'
            }`}
          >
            {city}
          </button>
        ))}
      </div>

      {/* Blood Banks List */}
      <div className="space-y-4">
        {bloodBanks.map((bank, index) => (
          <motion.div
            key={bank.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                  <Droplet className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{bank.name}</h3>
                  <div className="flex items-center gap-1 text-slate-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{bank.address}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{bank.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{bank.hours}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600 mb-1">{bank.distance}</div>
                <div className="text-xs text-slate-500">away</div>
              </div>
            </div>

            {/* Blood Types Available */}
            <div className="mb-4">
              <p className="text-sm font-bold text-slate-700 mb-2">Available Blood Types:</p>
              <div className="flex flex-wrap gap-2">
                {bank.bloodTypes.map((type) => (
                  <span
                    key={type}
                    className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-200"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleViewMap(bank)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Map
              </button>
              <button
                onClick={() => handleViewDirections(bank)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Directions
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Emergency Note */}
      <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-2xl">
        <div className="flex items-center gap-3">
          <Droplet className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-bold text-red-900">Emergency Blood Requirement?</p>
            <p className="text-sm text-red-700">Contact the blood bank directly for urgent requirements. Always carry your blood group card.</p>
          </div>
        </div>
      </div>
    </div>
  );
}