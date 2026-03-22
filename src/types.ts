export interface Hospital {
  id: string;
  name: string;
  bedsAvailable: number;
  type: 'General' | 'ICU' | 'Full';
  distance: string;
  image: string;
  address?: string;
  phone?: string;
}

export interface QuickAccessItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  path: string;
}

export interface Referral {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  condition: string;
  priority: 'Low' | 'Medium' | 'High' | 'Emergency';
  targetHospitalId: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  timestamp: string;
}

export interface Ambulance {
  id: string;
  numberPlate: string;
  type: 'Basic' | 'Advanced' | 'ICU';
  status: 'Available' | 'Busy' | 'Offline';
  driverName: string;
  phone: string;
  location: string;
  distance: string;
}

export interface Booking {
  id: string;
  type: 'Bed' | 'Ambulance';
  targetId: string; // Hospital ID or Ambulance ID
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  timestamp: string;
  details: any;
}
