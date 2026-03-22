import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Search, 
  AlertTriangle, 
  Car, 
  Bike, 
  Truck, 
  User,
  CheckCircle2,
  Hospital as HospitalIcon,
  Phone,
  ChevronRight,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { generatePDF } from '../utils/pdfGenerator';

export default function ReportAccident() {
  const navigate = useNavigate();
  const [accidentType, setAccidentType] = useState('');
  const [details, setDetails] = useState('');
  const [victimName, setVictimName] = useState('');
  const [victimContact, setVictimContact] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [showHospitals, setShowHospitals] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [isLoadingHospitals, setIsLoadingHospitals] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const accidentTypes = [
    { id: 'bike', label: 'Bike Accident', icon: Bike, color: 'bg-orange-500' },
    { id: 'car', label: 'Car Accident', icon: Car, color: 'bg-blue-500' },
    { id: 'truck', label: 'Truck Accident', icon: Truck, color: 'bg-red-500' },
    { id: 'pedestrian', label: 'Pedestrian', icon: User, color: 'bg-emerald-500' },
    { id: 'other', label: 'Other', icon: AlertTriangle, color: 'bg-slate-500' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearchHospitals = async () => {
    setIsLoadingHospitals(true);
    setShowHospitals(true);
    try {
      const users = await api.getUsers();
      let approvedHospitals = users.filter((u: any) => u.role === 'hospital' && u.isApproved);
      
      // Filter/Prioritize based on accident type
      if (accidentType === 'car' || accidentType === 'truck') {
        // Prioritize trauma centers or hospitals with more beds
        approvedHospitals.sort((a: any, b: any) => (b.availableBeds || 0) - (a.availableBeds || 0));
      } else if (accidentType === 'bike') {
        // Maybe prioritize orthopedic specialty if we had that data
      }

      setHospitals(approvedHospitals);
    } catch (error) {
      console.error("Failed to fetch hospitals:", error);
    } finally {
      setIsLoadingHospitals(false);
    }
  };

  const handleBookHospital = (hospital: any) => {
    setSelectedHospital(hospital);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call to report accident
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
        <motion.div 
          id="emergency-slip"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          {/* Slip Header */}
          <div className="bg-red-600 p-8 text-center text-white relative">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white rounded-full blur-2xl"></div>
            </div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight">EMERGENCY SLIP</h2>
              <p className="text-white/60 font-bold text-[10px] uppercase tracking-widest mt-1">Booking Confirmed</p>
            </div>
          </div>

          {/* Slip Content */}
          <div className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booked Hospital</p>
                  <h3 className="text-xl font-black text-slate-900">{selectedHospital?.name || 'Emergency Services'}</h3>
                </div>
                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
                  <HospitalIcon className="w-5 h-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Victim Name</p>
                  <p className="font-bold text-slate-900">{victimName || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Accident Type</p>
                  <p className="font-bold text-slate-900 capitalize">{accidentType}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{location || 'Current Location'}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Incident Details</p>
                <p className="text-slate-600 font-medium text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl italic">
                  "{details}"
                </p>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button 
                onClick={() => generatePDF('emergency-slip', `Emergency_Slip_${Date.now()}`)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Slip
              </button>
              <button 
                onClick={() => navigate('/app')}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* Decorative Cutout */}
          <div className="flex justify-between px-4 -mb-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-6 h-6 bg-slate-900 rounded-full"></div>
            ))}
          </div>
        </motion.div>
        <p className="mt-8 text-white/40 font-bold text-[10px] uppercase tracking-widest">Help is on the way. Stay calm.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <section className="bg-red-600 pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex items-center gap-6 mb-8">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all text-white border border-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Emergency Report</h1>
              <p className="text-white/60 font-bold uppercase tracking-widest text-[10px] mt-2">Accident Assistance Portal</p>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-2xl mx-auto px-6 -mt-12 relative z-20">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-100 p-8 md:p-12">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Accident Type */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Type of Accident</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {accidentTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setAccidentType(type.id)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-3xl border-2 transition-all ${
                      accidentType === type.id 
                        ? 'border-red-600 bg-red-50 text-red-600 scale-[1.02] shadow-lg' 
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      accidentType === type.id ? 'bg-red-600 text-white' : 'bg-white text-slate-400'
                    }`}>
                      <type.icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Victim Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Victim Name (Optional)</label>
                <input 
                  type="text"
                  placeholder="Enter name if known"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-red-600 outline-none transition-all font-bold text-slate-900"
                  value={victimName}
                  onChange={(e) => setVictimName(e.target.value)}
                />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                <input 
                  type="tel"
                  placeholder="Emergency contact"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 focus:border-red-600 outline-none transition-all font-bold text-slate-900"
                  value={victimContact}
                  onChange={(e) => setVictimContact(e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Accident Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
                <input 
                  type="text"
                  required
                  placeholder="Street name, Landmark, or City"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:border-red-600 outline-none transition-all font-bold text-slate-900"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Accident Details */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Accident Details</label>
              <textarea 
                required
                placeholder="Describe the accident, number of people involved, and current situation..."
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 min-h-[150px] focus:border-red-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-4">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Impact Part Image</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`w-full aspect-video rounded-[2.5rem] border-4 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
                  image ? 'border-emerald-500' : 'border-slate-100 bg-slate-50 group-hover:border-slate-200'
                }`}>
                  {image ? (
                    <img src={image} alt="Impact preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <Camera className="w-8 h-8 text-slate-300" />
                      </div>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Click to upload photo</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Search Near Hospital Button */}
            <div className="pt-4">
              <button 
                type="button"
                onClick={handleSearchHospitals}
                className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-slate-800 transition-all"
              >
                <Search className="w-6 h-6" />
                Search Near Hospital
              </button>
            </div>

            {/* Nearby Hospitals Section */}
            <AnimatePresence>
              {showHospitals && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Nearby Hospitals</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Updates</span>
                    </div>
                  </div>

                  {isLoadingHospitals ? (
                    <div className="flex justify-center p-10">
                      <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hospitals.map((hospital) => (
                        <div 
                          key={hospital._id}
                          className={`bg-slate-50 rounded-[2rem] p-6 border-2 transition-all flex flex-col gap-4 ${
                            selectedHospital?._id === hospital._id 
                              ? 'border-emerald-500 bg-emerald-50 shadow-lg' 
                              : 'border-slate-100 hover:bg-white hover:shadow-xl'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-colors ${
                                selectedHospital?._id === hospital._id ? 'bg-emerald-600 text-white' : 'bg-white text-blue-600'
                              }`}>
                                <HospitalIcon className="w-7 h-7" />
                              </div>
                              <div>
                                <h4 className="text-lg font-black text-slate-900 leading-none mb-2">{hospital.name}</h4>
                                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-tighter">
                                  <MapPin className="w-3 h-3" />
                                  <span>{hospital.address || 'Nearby'}</span>
                                </div>
                              </div>
                            </div>
                            {selectedHospital?._id === hospital._id && (
                              <div className="bg-emerald-500 text-white p-1.5 rounded-full">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <button 
                              type="button"
                              onClick={() => handleBookHospital(hospital)}
                              className={`flex-1 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all ${
                                selectedHospital?._id === hospital._id 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white'
                              }`}
                            >
                              {selectedHospital?._id === hospital._id ? 'Hospital Selected' : 'Book Hospital'}
                            </button>
                            <a 
                              href={`tel:${hospital.phone || '102'}`}
                              className="w-12 h-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                            >
                              <Phone className="w-5 h-5" />
                            </a>
                          </div>
                        </div>
                      ))}
                      {hospitals.length === 0 && (
                        <p className="text-center text-slate-400 font-bold py-6">No hospitals found nearby.</p>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-100">
              {!selectedHospital && showHospitals && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <p className="text-[10px] font-bold text-orange-700 uppercase tracking-tight">
                    Please select a hospital from the list to book a bed before submitting.
                  </p>
                </div>
              )}
              <button 
                type="submit"
                disabled={isSubmitting || !accidentType}
                className="w-full bg-red-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-red-200 hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting Report...' : 'Submit Emergency Report'}
              </button>
              <p className="text-center text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-6">
                Your location will be shared with emergency services
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
