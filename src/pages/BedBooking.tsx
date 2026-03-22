import React from 'react';
import { 
  ArrowLeft, 
  Hospital as HospitalIcon, 
  Bed, 
  User, 
  Calendar,
  CheckCircle2,
  ChevronRight,
  Activity,
  AlertCircle,
  Phone,
  Mail,
  Fingerprint,
  MapPin,
  Upload,
  Printer,
  ShieldCheck,
  Clock,
  Plus,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HOSPITALS } from '../constants';
import { api } from '../services/api';
import { generatePDF } from '../utils/pdfGenerator';

export default function BedBooking() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hospitalId = searchParams.get('hospitalId');
  const role = searchParams.get('role') || 'patient';
  
  const hospital = HOSPITALS.find(h => h.id === hospitalId) || HOSPITALS[0];
  const [step, setStep] = React.useState(1);
  const [bookingType, setBookingType] = React.useState<'General' | 'ICU' | 'Emergency'>('General');
  
  const [patientDetails, setPatientDetails] = React.useState({
    name: '',
    aadhar: '',
    mobile: '',
    email: '',
    otp: '',
    patientType: 'Critical',
    address: '',
    report: null as File | null
  });

  const [otpStep, setOtpStep] = React.useState<'none' | 'sending' | 'verify' | 'verified'>('none');
  const [isSendingOtp, setIsSendingOtp] = React.useState(false);
  const [isBooking, setIsBooking] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSendOtp = () => {
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpStep('verify');
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (patientDetails.otp.length === 6) {
      setOtpStep('verified');
    }
  };

  const handleConfirm = async () => {
    if (isBooking) return;
    setIsBooking(true);
    setError('');
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    try {
      await api.createBooking({
        userId: user.id || 'anonymous',
        hospitalId: hospital.id,
        hospitalName: hospital.name,
        patientName: patientDetails.name,
        aadharNumber: patientDetails.aadhar,
        mobileNumber: patientDetails.mobile,
        email: patientDetails.email,
        patientType: patientDetails.patientType,
        address: patientDetails.address,
        bedType: bookingType,
      });
      setStep(3);
    } catch (err: any) {
      console.error('Booking Error:', err);
      setError(err.message || 'Failed to create booking');
    } finally {
      setIsBooking(false);
    }
  };

  const theme = {
    bg: 'bg-emerald-600',
    text: 'text-emerald-600',
    gradient: 'from-emerald-600 to-teal-700',
    shadow: 'shadow-emerald-200'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Left Decoration Panel */}
      <div className={`hidden md:flex md:w-1/3 bg-gradient-to-br ${theme.gradient} p-12 flex-col justify-between relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-black rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all text-white mb-12"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-4 leading-none">
            Bed<br/>Booking
          </h1>
          <p className="text-white/70 font-bold uppercase tracking-widest text-xs">
            Secure your medical care instantly with our real-time reservation system.
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/20 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border-2 border-white/20">
                <img src={hospital.image} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-white font-black text-lg leading-tight">{hospital.name}</h3>
                <p className="text-white/60 text-xs font-bold flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" /> {hospital.distance} Away
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-white/50 uppercase tracking-widest">
                <span>Selected Ward</span>
                <span className="text-white">{bookingType}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-white/50 uppercase tracking-widest">
                <span>Daily Rate</span>
                <span className="text-white">₹{bookingType === 'General' ? '1,500' : bookingType === 'ICU' ? '5,000' : '2,500'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen pb-32">
        <header className="md:hidden px-6 pt-8 pb-4 flex items-center gap-4 bg-white border-b border-slate-100">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Bed Booking</h1>
        </header>

        <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-xl w-full mx-auto space-y-10"
              >
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Select Ward</h2>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Choose the care level required</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { type: 'General', price: '₹1,500/day', icon: Bed, available: hospital.bedsAvailable, desc: 'Standard care with basic monitoring' },
                    { type: 'ICU', price: '₹5,000/day', icon: Activity, available: 2, desc: 'Critical care with 24/7 monitoring' },
                    { type: 'Emergency', price: '₹2,500/day', icon: AlertCircle, available: 1, desc: 'Immediate trauma & urgent care' }
                  ].map((item: any) => (
                    <button
                      key={item.type}
                      onClick={() => setBookingType(item.type)}
                      className={`p-6 rounded-[2.5rem] border-4 transition-all flex items-center justify-between group ${
                        bookingType === item.type 
                          ? `bg-white border-emerald-600 shadow-2xl shadow-emerald-100` 
                          : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                          bookingType === item.type ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <item.icon className="w-7 h-7" />
                        </div>
                        <div className="text-left">
                          <p className="text-lg font-black text-slate-900 leading-none mb-1">{item.type} Ward</p>
                          <p className="text-xs font-bold text-slate-400">{item.desc}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900">{item.price}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${item.available > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.available} Left
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className={`w-full ${theme.bg} text-white py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl ${theme.shadow}`}
                >
                  Continue to Details <ChevronRight className="w-6 h-6" />
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl w-full mx-auto space-y-10"
              >
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Patient Info</h2>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Verification required for admission</p>
                </div>

                <div className="space-y-8">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                        <input 
                          type="text"
                          placeholder="John Doe"
                          className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:border-emerald-600 outline-none transition-all font-bold text-slate-900"
                          value={patientDetails.name}
                          onChange={e => setPatientDetails({...patientDetails, name: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Aadhar Number</label>
                      <div className="relative group">
                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                        <input 
                          type="text"
                          placeholder="1234 5678 9012"
                          className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:border-emerald-600 outline-none transition-all font-bold text-slate-900"
                          value={patientDetails.aadhar}
                          onChange={e => setPatientDetails({...patientDetails, aadhar: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                        <input 
                          type="tel"
                          placeholder="9876543210"
                          className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:border-emerald-600 outline-none transition-all font-bold text-slate-900"
                          value={patientDetails.mobile}
                          onChange={e => setPatientDetails({...patientDetails, mobile: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-emerald-600 transition-colors" />
                        <input 
                          type="email"
                          placeholder="john@example.com"
                          className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:border-emerald-600 outline-none transition-all font-bold text-slate-900"
                          value={patientDetails.email}
                          onChange={e => setPatientDetails({...patientDetails, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* OTP Section */}
                  <AnimatePresence>
                    {patientDetails.email.includes('@') && otpStep !== 'verified' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl"
                      >
                        {otpStep === 'none' ? (
                          <button 
                            onClick={handleSendOtp}
                            disabled={isSendingOtp}
                            className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-emerald-400 transition-colors"
                          >
                            {isSendingOtp ? <Clock className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                            {isSendingOtp ? 'Sending Code...' : 'Verify with OTP'}
                          </button>
                        ) : (
                          <div className="flex gap-3">
                            <input 
                              type="text"
                              placeholder="0 0 0 0 0 0"
                              maxLength={6}
                              className="flex-grow bg-white/10 border-2 border-white/10 focus:border-emerald-400 rounded-2xl py-4 px-6 outline-none transition-all text-center tracking-[1em] font-black text-white"
                              value={patientDetails.otp}
                              onChange={e => setPatientDetails({...patientDetails, otp: e.target.value})}
                            />
                            <button 
                              onClick={handleVerifyOtp}
                              className="px-8 bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-900/50"
                            >
                              Verify
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                    {otpStep === 'verified' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-500 p-4 rounded-2xl flex items-center justify-center gap-3 text-white font-black uppercase tracking-widest text-[10px]"
                      >
                        <CheckCircle2 className="w-5 h-5" /> Identity Verified
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Residential Address</label>
                    <textarea 
                      placeholder="Enter complete address..."
                      rows={3}
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-emerald-600 outline-none transition-all font-bold text-slate-900 resize-none"
                      value={patientDetails.address}
                      onChange={e => setPatientDetails({...patientDetails, address: e.target.value})}
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleConfirm}
                    disabled={!patientDetails.name || !patientDetails.mobile || otpStep !== 'verified' || isBooking}
                    className={`w-full ${theme.bg} text-white py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl ${theme.shadow} disabled:opacity-50 disabled:grayscale`}
                  >
                    {isBooking ? (
                      <>
                        <Clock className="w-6 h-6 animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-6 h-6" /> Confirm Reservation
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl w-full mx-auto text-center"
              >
                <div className="w-32 h-32 bg-emerald-100 rounded-[3rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-100">
                  <CheckCircle2 className="w-16 h-16 text-emerald-600" />
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Booking Confirmed!</h2>
                <p className="text-slate-400 font-bold text-lg mb-12">
                  Your bed in the <span className="text-emerald-600">{bookingType} Ward</span> at {hospital.name} is now reserved.
                </p>

                <div 
                  id="booking-receipt"
                  className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-xl mb-12 text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Booking ID</p>
                        <p className="text-2xl font-black text-slate-900 tracking-tighter">#PRDW-{Math.floor(100000 + Math.random() * 900000)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-50 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient</p>
                        <p className="font-bold text-slate-900">{patientDetails.name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Facility</p>
                        <p className="font-bold text-slate-900">{hospital.name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => generatePDF('booking-receipt', `Booking_Receipt_${Date.now()}`)}
                    className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl"
                  >
                    <Download className="w-6 h-6" /> Download Receipt
                  </button>
                  <button 
                    onClick={() => navigate('/app')}
                    className="w-full bg-white text-slate-400 py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 border-2 border-slate-100 hover:border-slate-200 transition-all"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
