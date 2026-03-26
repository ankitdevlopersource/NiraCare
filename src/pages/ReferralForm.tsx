import React from 'react';
import { 
  ArrowLeft, 
  Send, 
  User, 
  Activity, 
  AlertCircle, 
  CheckCircle2,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HOSPITALS } from '../constants';
import { generatePDF } from '../utils/pdfGenerator';

export default function ReferralForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hospitalId = searchParams.get('hospitalId');
  const role = searchParams.get('role') || 'doctor';
  
  const [submitted, setSubmitted] = React.useState(false);
  const [formData, setFormData] = React.useState({
    patientName: '',
    age: '',
    gender: 'Male',
    condition: '',
    priority: 'Medium',
    targetHospitalId: hospitalId || '',
    reportFile: null as File | null
  });

  const [reportPreview, setReportPreview] = React.useState<string>('');

  const handleReportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, reportFile: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setReportPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setReportPreview('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const theme = {
    bg: 'bg-blue-600',
    text: 'text-blue-600',
    gradient: 'from-blue-600 to-indigo-700',
    shadow: 'shadow-blue-200'
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
            Patient<br/>Referral
          </h1>
          <p className="text-white/70 font-bold uppercase tracking-widest text-xs">
            Seamlessly transfer patients between facilities with real-time tracking.
          </p>
        </div>

        <div className="relative z-10">
          <div className="w-full aspect-square bg-white/10 backdrop-blur-2xl rounded-[3rem] p-6 border border-white/20 shadow-2xl">
            <img 
              src="https://img.freepik.com/free-vector/medical-care-concept-illustration_114360-1504.jpg" 
              alt="Referral Illustration" 
              className="w-full h-full object-contain rounded-[2rem]"
            />
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
          <h1 className="text-xl font-black text-slate-900 tracking-tight">New Referral</h1>
        </header>

        <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-2xl w-full mx-auto"
              >
                <div className="mb-10">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Patient Details</h2>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Please provide accurate medical information</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                          <input 
                            required
                            type="text"
                            placeholder="John Doe"
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-600 outline-none transition-all font-bold text-slate-900 shadow-sm"
                            value={formData.patientName}
                            onChange={e => setFormData({...formData, patientName: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                          <input 
                            required
                            type="number"
                            placeholder="25"
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-4 focus:border-blue-600 outline-none transition-all font-bold text-slate-900 shadow-sm"
                            value={formData.age}
                            onChange={e => setFormData({...formData, age: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                          <select 
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-4 focus:border-blue-600 outline-none transition-all font-bold text-slate-900 shadow-sm appearance-none"
                            value={formData.gender}
                            onChange={e => setFormData({...formData, gender: e.target.value})}
                          >
                            <option>Male</option>
                            <option>Female</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Condition</label>
                        <div className="relative group">
                          <Activity className="absolute left-4 top-5 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                          <textarea 
                            required
                            placeholder="Describe symptoms..."
                            rows={4}
                            className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 focus:border-blue-600 outline-none transition-all font-bold text-slate-900 shadow-sm resize-none"
                            value={formData.condition}
                            onChange={e => setFormData({...formData, condition: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {['Low', 'Medium', 'High', 'Emergency'].map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setFormData({...formData, priority: p})}
                            className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                              formData.priority === p 
                                ? 'bg-slate-900 border-slate-900 text-white shadow-xl' 
                                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Hospital</label>
                      <select 
                        required
                        className="w-full bg-white border-2 border-slate-100 rounded-2xl py-4 px-4 focus:border-blue-600 outline-none transition-all font-bold text-slate-900 shadow-sm appearance-none"
                        value={formData.targetHospitalId}
                        onChange={e => setFormData({...formData, targetHospitalId: e.target.value})}
                      >
                        <option value="">Select Destination Facility</option>
                        {HOSPITALS.map(h => (
                          <option key={h.id} value={h.id}>{h.name} ({h.bedsAvailable} beds available)</option>
                        ))}
                      </select>
                    </div>                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Upload Medical Report</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleReportUpload}
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl py-3 px-4 focus:border-blue-600 outline-none transition-all"
                    />
                    {reportPreview && (
                      <div className="text-xs text-slate-400">Selected: {formData.reportFile?.name}</div>
                    )}
                  </div>                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className={`w-full ${theme.bg} text-white py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl ${theme.shadow} mt-8`}
                  >
                    <Send className="w-6 h-6" /> Complete Referral
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <div 
                  id="referral-slip"
                  className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-2xl mb-8 max-w-md w-full text-left"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-50">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Referral Sent!</h2>
                      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Official Document</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Name</p>
                        <p className="font-bold text-slate-900">{formData.patientName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Age / Gender</p>
                        <p className="font-bold text-slate-900">{formData.age} / {formData.gender}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Condition</p>
                      <p className="font-bold text-slate-900 leading-relaxed italic">"{formData.condition}"</p>
                    </div>

                    <div className="pt-6 border-t border-slate-50 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Priority</p>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          formData.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                          {formData.priority}
                        </span>
                      </div>
                      {formData.reportFile && (
                        <div className="mt-4 text-sm text-slate-900">
                          <p className="font-black text-slate-400 uppercase tracking-widest mb-1">Report File</p>
                          <p>{formData.reportFile.name}</p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                        <p className="font-bold text-slate-900 text-xs">{new Date().toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-md">
                  <button 
                    onClick={() => generatePDF('referral-slip', `Referral_Slip_${Date.now()}`)}
                    className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-2xl"
                  >
                    <Download className="w-6 h-6" /> Download Referral Slip
                  </button>
                  <button 
                    onClick={() => navigate(role ? `/app?role=${role}` : '/app')}
                    className="w-full py-5 bg-white text-slate-400 rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 border-2 border-slate-100 hover:border-slate-200 transition-all"
                  >
                    Back to Dashboard
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
