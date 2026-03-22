import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Hospital, 
  Camera, 
  Save, 
  ArrowLeft,
  ShieldCheck,
  Building2,
  BedDouble
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    address: '',
    totalBeds: '',
    availableBeds: '',
    profileImage: ''
  });

  React.useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const userData = await api.getCurrentUser();
      if (!userData) {
        navigate('/login');
        return;
      }
      setUser(userData);
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        address: userData.address || '',
        totalBeds: userData.totalBeds?.toString() || '',
        availableBeds: userData.availableBeds?.toString() || '',
        profileImage: userData.profileImage || ''
      });
    } catch (err: any) {
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsSaving(true);
      const storageRef = ref(storage, `profiles/${user._id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, profileImage: url }));
      setSuccess('Image uploaded successfully!');
    } catch (err: any) {
      setError('Failed to upload image');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
        profileImage: formData.profileImage
      };

      if (user.role === 'hospital') {
        updateData.address = formData.address;
        updateData.totalBeds = parseInt(formData.totalBeds);
        updateData.availableBeds = parseInt(formData.availableBeds);
      }

      await api.updateUser(user._id, updateData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      fetchProfile();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">My Profile</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 pt-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200 overflow-hidden border border-slate-100">
          {/* Cover / Header */}
          <div className="h-32 bg-gradient-to-r from-emerald-600 to-teal-700 relative">
            <div className="absolute -bottom-16 left-10">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2rem] bg-white p-1 shadow-2xl">
                  <div className="w-full h-full rounded-[1.8rem] bg-slate-100 overflow-hidden flex items-center justify-center border-2 border-white">
                    {formData.profileImage ? (
                      <img 
                        src={formData.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-12 h-12 text-slate-300" />
                    )}
                  </div>
                </div>
                {isEditing && (
                  <label className="absolute bottom-2 right-2 w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="pt-20 px-10 pb-10">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h2>
                <p className="text-slate-500 font-medium flex items-center gap-2 mt-1 uppercase tracking-widest text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  {user.role} Account
                </p>
              </div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 text-sm font-bold border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl mb-6 text-sm font-bold border border-emerald-100">
                {success}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" /> Basic Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      disabled={!isEditing}
                      type="text"
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-900 font-medium disabled:opacity-70"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input 
                        disabled
                        type="email"
                        className="w-full bg-slate-100 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 text-slate-500 font-medium"
                        value={user.email}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input 
                        disabled={!isEditing}
                        type="tel"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-900 font-medium disabled:opacity-70"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Specific Info */}
              {user.role === 'hospital' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-600" /> Hospital Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Hospital Address</label>
                      <div className="relative">
                        <MapPin className="absolute left-6 top-4 w-5 h-5 text-slate-300" />
                        <textarea 
                          disabled={!isEditing}
                          rows={3}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-900 font-medium disabled:opacity-70 resize-none"
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Total Beds</label>
                        <div className="relative">
                          <BedDouble className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input 
                            disabled={!isEditing}
                            type="number"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-900 font-medium disabled:opacity-70"
                            value={formData.totalBeds}
                            onChange={(e) => setFormData({...formData, totalBeds: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Available Beds</label>
                        <div className="relative">
                          <BedDouble className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <input 
                            disabled={!isEditing}
                            type="number"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-14 pr-6 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-900 font-medium disabled:opacity-70"
                            value={formData.availableBeds}
                            onChange={(e) => setFormData({...formData, availableBeds: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
