import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Phone, 
  ChevronRight 
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';

export default function HospitalList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'doctor';
  const [search, setSearch] = React.useState('');
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const users = await api.getUsers();
        const approvedHospitals = users.filter((u: any) => u.role === 'hospital' && u.isApproved);
        setHospitals(approvedHospitals);
      } catch (error) {
        console.error("Failed to fetch hospitals:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    (h.address && h.address.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header Section */}
      <section className="bg-slate-900 pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-600 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-6 mb-10">
            <button 
              onClick={() => navigate(-1)}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md transition-all text-white border border-white/10"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tighter leading-none">Hospital Network</h1>
              <p className="text-white/50 font-bold uppercase tracking-widest text-[10px] mt-2">Real-time bed availability tracking</p>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search by name, location or specialty..."
              className="w-full bg-white/10 backdrop-blur-2xl border-2 border-white/10 rounded-[2rem] py-5 pl-16 pr-6 text-white placeholder:text-white/30 focus:border-blue-500 outline-none transition-all font-bold text-lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Hospital Grid */}
      <main className="max-w-5xl mx-auto px-6 -mt-12 relative z-20">
        {isLoading ? (
          <div className="flex justify-center p-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredHospitals.map((hospital, idx) => (
              <motion.div 
                key={hospital._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 group"
              >
                <div className="relative h-56">
                  <img src={`https://picsum.photos/seed/${hospital._id}/800/600`} alt={hospital.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute top-6 left-6">
                    <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl backdrop-blur-md ${
                      hospital.availableBeds > 0 ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
                    }`}>
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      {hospital.availableBeds > 0 ? `${hospital.availableBeds} Beds Available` : 'Full'}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4">{hospital.name}</h3>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-start gap-3 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                      <MapPin className="w-4 h-4 text-slate-300 mt-0.5" />
                      <span className="leading-relaxed">{hospital.address || 'Address not provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 font-bold text-xs uppercase tracking-tighter">
                      <Phone className="w-4 h-4 text-slate-300" />
                      <span>{hospital.phone || 'Contact not available'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => navigate(`/app/referral?hospitalId=${hospital._id}&role=${role}`)}
                      className="py-4 bg-slate-100 text-slate-900 rounded-2xl hover:bg-slate-900 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      Refer
                    </button>
                    <button 
                      onClick={() => navigate(`/app/book-bed?hospitalId=${hospital._id}&role=${role}`)}
                      className="py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 shadow-xl shadow-emerald-100 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      Book Bed
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredHospitals.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No Hospitals Found</h3>
            <p className="text-slate-400 font-bold">Try adjusting your search filters</p>
          </div>
        )}
      </main>
    </div>
  );
}
