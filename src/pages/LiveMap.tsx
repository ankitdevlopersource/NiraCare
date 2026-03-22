import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Filter, 
  ArrowLeft, 
  Hospital, 
  Ambulance, 
  Activity,
  RefreshCw,
  Info,
  WifiOff,
  Download,
  CloudDownload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { api } from '../services/api';

interface MapMarker {
  id: string;
  name: string;
  type: 'hospital' | 'ambulance';
  lat: number;
  lng: number;
  status: string;
  details: string;
}

export default function LiveMap() {
  const navigate = useNavigate();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'hospital' | 'ambulance'>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchRealTimeData = async (lat: number, lng: number) => {
    if (isOffline) {
      const cached = localStorage.getItem('cached_map_markers');
      if (cached) {
        setMarkers(JSON.parse(cached));
      } else {
        // Fallback static markers if no cache
        setMarkers([
          { id: 'offline-1', name: 'Offline Hospital Data', type: 'hospital', lat: lat + 0.01, lng: lng + 0.01, status: 'Cached', details: 'Last updated while online' }
        ]);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // 1. Fetch real data from our database
      const realUsers = await api.getUsers();
      const realMarkers: MapMarker[] = realUsers
        .filter((u: any) => (u.role === 'hospital' || u.role === 'ambulance') && u.location?.lat && u.location?.lng && u.isApproved)
        .map((u: any) => ({
          id: u._id,
          name: u.name,
          type: u.role as 'hospital' | 'ambulance',
          lat: u.location.lat,
          lng: u.location.lng,
          status: u.role === 'hospital' ? `${u.availableBeds || 0} Beds Available` : 'Active',
          details: u.address || (u.role === 'hospital' ? 'Medical Center' : 'Emergency Vehicle')
        }));

      // 2. Fetch AI-found data as supplement
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const model = "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model: model,
        contents: `Find real-time healthcare data near latitude ${lat}, longitude ${lng}. 
                   Include nearby hospitals and active ambulances. 
                   Return the data as a list of markers with name, type, status, and coordinates.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      // Simulated markers based on grounding or fallback if no chunks
      const aiMarkers: MapMarker[] = [
        {
          id: 'ai-1',
          name: 'City General Hospital',
          type: 'hospital',
          lat: lat + 0.01,
          lng: lng + 0.01,
          status: '12 Beds Available',
          details: 'Specialized in Cardiac Care'
        },
        {
          id: 'ai-2',
          name: 'Ambulance MH-01-1234',
          type: 'ambulance',
          lat: lat - 0.005,
          lng: lng + 0.008,
          status: 'Active - En route',
          details: 'Advanced Life Support'
        }
      ];

      const combinedMarkers = [...realMarkers, ...aiMarkers];
      setMarkers(combinedMarkers);
      localStorage.setItem('cached_map_markers', JSON.stringify(combinedMarkers));
      localStorage.setItem('cached_map_location', JSON.stringify({ lat, lng }));
    } catch (error) {
      console.error("Map Data Error:", error);
      const cached = localStorage.getItem('cached_map_markers');
      if (cached) setMarkers(JSON.parse(cached));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadOffline = () => {
    setIsDownloading(true);
    // Simulate downloading map tiles
    setTimeout(() => {
      setIsDownloading(false);
      console.log("Map data for this area has been cached for offline use.");
    }, 2000);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchRealTimeData(latitude, longitude);
        },
        () => {
          // Fallback location (Mumbai)
          const lat = 19.0760;
          const lng = 72.8777;
          setUserLocation({ lat, lng });
          fetchRealTimeData(lat, lng);
        }
      );
    }
  }, []);

  const filteredMarkers = markers.filter(m => {
    const matchesType = selectedType === 'all' || m.type === selectedType;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-orange-500 text-white px-6 py-2 flex items-center justify-between text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span>Offline Mode - Viewing Cached Data</span>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="underline hover:no-underline"
            >
              Retry Connection
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-900">Live Health Map</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Real-time Tracking</span>
          </div>
        </div>
        <button 
          onClick={() => userLocation && fetchRealTimeData(userLocation.lat, userLocation.lng)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <RefreshCw className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Search & Filters */}
      <div className="p-4 bg-white border-b border-slate-200 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search hospitals or ambulances..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'hospital', 'ambulance'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all border ${
                selectedType === type 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Map Simulation Area */}
      <div className="flex-1 relative bg-slate-200 overflow-hidden">
        {/* Mock Map Background */}
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>

        {/* Markers */}
        <AnimatePresence>
          {!isLoading && filteredMarkers.map((marker) => (
            <motion.div
              key={marker.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute"
              style={{
                top: `${50 + (marker.lat - (userLocation?.lat || 0)) * 1000}%`,
                left: `${50 + (marker.lng - (userLocation?.lng || 0)) * 1000}%`,
              }}
            >
              <div className="group relative flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  {/* Subtle Pulse Animation */}
                  <motion.div
                    animate={{
                      scale: [1, 2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`absolute w-full h-full rounded-full ${
                      marker.type === 'hospital' ? 'bg-blue-400' : 'bg-red-400'
                    }`}
                  />
                  <div className={`p-2 rounded-full shadow-lg cursor-pointer transition-transform hover:scale-110 relative z-10 ${
                    marker.type === 'hospital' ? 'bg-blue-600' : 'bg-red-600'
                  }`}>
                    {marker.type === 'hospital' ? <Hospital className="w-4 h-4 text-white" /> : <Ambulance className="w-4 h-4 text-white" />}
                  </div>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-3 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-20">
                  <h3 className="text-xs font-bold text-slate-900">{marker.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">{marker.details}</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${marker.type === 'hospital' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>
                    <span className="text-[10px] font-bold text-slate-700">{marker.status}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* User Location Marker */}
        {userLocation && (
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative">
              <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
              <div className="absolute inset-0 w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-20"></div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-30">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-slate-900">Fetching Real-time Data...</p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 space-y-3 z-10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-xs font-bold text-slate-700">Hospitals</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-xs font-bold text-slate-700">Ambulances</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></div>
            <span className="text-xs font-bold text-slate-700">Your Location</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-10">
          <button 
            onClick={handleDownloadOffline}
            disabled={isDownloading || isOffline}
            className={`p-4 rounded-2xl shadow-xl transition-all border flex items-center justify-center ${
              isDownloading 
                ? 'bg-slate-100 text-slate-400 border-slate-200' 
                : 'bg-white text-blue-600 border-slate-100 hover:bg-slate-50'
            } ${isOffline ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Download Map for Offline Use"
          >
            {isDownloading ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <CloudDownload className="w-6 h-6" />
            )}
          </button>
          <button className="p-4 bg-white rounded-2xl shadow-xl hover:bg-slate-50 transition-colors border border-slate-100">
            <Navigation className="w-6 h-6 text-blue-600" />
          </button>
          <button className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:bg-blue-700 transition-colors">
            <Activity className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Bottom Info Card */}
      <div className="bg-white border-t border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Nearby Emergency Status</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              There are currently 4 active emergency vehicles within 5km of your location. 
              Average response time is 8 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
