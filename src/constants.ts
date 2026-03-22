import { Hospital, QuickAccessItem, Referral, Ambulance } from './types';

export const AMBULANCES: Ambulance[] = [
  {
    id: 'a1',
    numberPlate: 'DL 1CA 1234',
    type: 'Advanced',
    status: 'Available',
    driverName: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    location: 'Central Square',
    distance: '1.2 km'
  },
  {
    id: 'a2',
    numberPlate: 'DL 1CB 5678',
    type: 'ICU',
    status: 'Available',
    driverName: 'Amit Singh',
    phone: '+91 98765 43211',
    location: 'Metro Station',
    distance: '2.5 km'
  },
  {
    id: 'a3',
    numberPlate: 'DL 1CC 9012',
    type: 'Basic',
    status: 'Busy',
    driverName: 'Suresh Raina',
    phone: '+91 98765 43212',
    location: 'City Mall',
    distance: '3.1 km'
  }
];


export const HOSPITALS: Hospital[] = [
  {
    id: '5',
    name: 'Chhatrapati Shivaji Subharti Hospital',
    bedsAvailable: 8,
    type: 'General',
    distance: '4.5 km',
    image: 'https://images.local18.in/hospital/images/meerut-hs-6_2.jpg',
    address: 'Subhartipuram, NH-58, Delhi-Haridwar Bypass Road, Meerut',
    phone: '+91 121 243 9043'
  },
  {
    id: '1',
    name: 'City Hospital',
    bedsAvailable: 3,
    type: 'General',
    distance: '2.4 km',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0jWlYUjn4KNQkzTPYGr7T1zahve1w0NcCNA&s',
    address: '123 Medical Ave, Downtown',
    phone: '+1 234-567-8901'
  },
  {
    id: '2',
    name: 'LifeCare Hospital',
    bedsAvailable: 1,
    type: 'ICU',
    distance: '5.1 km',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThNFUEd1U_ephGQA7jhv3xnCLSQeLyJ1aBXA&s',
    address: '456 Health St, Northside',
    phone: '+1 234-567-8902'
  },
  {
    id: '3',
    name: 'Metro Med',
    bedsAvailable: 0,
    type: 'Full',
    distance: '3.8 km',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGYDrwDWpxxP5urZW5P1ljga3D_0MVw2bDPQ&s',
    address: '789 City Rd, West End',
    phone: '+1 234-567-8903'
  },
  {
    id: '4',
    name: 'St. Jude Medical',
    bedsAvailable: 12,
    type: 'General',
    distance: '6.2 km',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXCg7GUQPFA9Qoyn8KFZf-SP9xgwY7YTeNzg&s',
    address: '101 Saint Blvd, East Side',
    phone: '+1 234-567-8904'
  }
];

export const QUICK_ACCESS: QuickAccessItem[] = [
  { id: '1', label: 'AI Assistant', icon: 'voice_chat', color: 'bg-emerald-100 text-emerald-600', path: '/ai-assistant' },
  { id: '2', label: 'Live Map', icon: 'google_pin', color: 'bg-orange-100 text-orange-600', path: '/live-map' },
  { id: '3', label: 'Hospitals', icon: 'hospital', color: 'bg-indigo-100 text-indigo-600', path: '/hospitals' },
  { id: '4', label: 'Ambulance', icon: 'ambulance', color: 'bg-red-100 text-red-600', path: '/ambulance' },
];
