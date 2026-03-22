import React from 'react';
import { 
  Users, 
  Hospital as HospitalIcon, 
  Ambulance, 
  FileText,
  MessageSquare,
  MapPin
} from 'lucide-react';

export const IconWrapper = ({ name, className }: { name: string, className?: string }) => {
  switch (name) {
    case 'users': return <Users className={className} />;
    case 'hospital': return <HospitalIcon className={className} />;
    case 'ambulance': return <Ambulance className={className} />;
    case 'reports': return <FileText className={className} />;
    case 'voice_chat': return <MessageSquare className={className} />;
    case 'google_pin': return <MapPin className={className} />;
    default: return null;
  }
};
