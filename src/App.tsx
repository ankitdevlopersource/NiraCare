/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Landing from './pages/Landing';
import HospitalList from './pages/HospitalList';
import ReferralForm from './pages/ReferralForm';
import AdminDashboard from './pages/AdminDashboard';
import AmbulanceBooking from './pages/AmbulanceBooking';
import BedBooking from './pages/BedBooking';
import Login from './pages/Login';
import Register from './pages/Register';
import HospitalDashboard from './pages/HospitalDashboard';
import AmbulanceDashboard from './pages/AmbulanceDashboard';
import AmbulanceLogin from './pages/AmbulanceLogin';
import OwnerDashboard from './pages/OwnerDashboard';
import AIChatbot from './pages/AIChatbot';
import LiveMap from './pages/LiveMap';
import ReportAccident from './pages/ReportAccident';
import Profile from './pages/Profile';
import BloodBank from './pages/BloodBank';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.id) {
      navigate('/login');
    } else if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to home or their specific dashboard
      navigate('/app');
    }
  }, [user, navigate, allowedRoles]);

  return <>{children}</>;
};

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Entry Point - Now Login */}
        <Route path="/" element={<Login />} />

        {/* Auth Routes - No Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/ambulance-login" element={<AmbulanceLogin />} />
        <Route path="/register" element={<Register />} />

        {/* App Routes - With Layout */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="hospitals" element={<ProtectedRoute><HospitalList /></ProtectedRoute>} />
          <Route path="referral" element={<ProtectedRoute><ReferralForm /></ProtectedRoute>} />
          <Route path="admin" element={<Navigate to="/app/owner-dashboard" replace />} />
          <Route path="ambulance" element={<ProtectedRoute><AmbulanceBooking /></ProtectedRoute>} />
          <Route path="book-bed" element={<ProtectedRoute><BedBooking /></ProtectedRoute>} />
          <Route path="hospital-dashboard" element={<ProtectedRoute allowedRoles={['hospital', 'owner']}><HospitalDashboard /></ProtectedRoute>} />
          <Route path="ambulance-dashboard" element={<ProtectedRoute allowedRoles={['ambulance', 'owner']}><AmbulanceDashboard /></ProtectedRoute>} />
          <Route path="owner-dashboard" element={<ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>} />
          <Route path="ai-assistant" element={<ProtectedRoute><AIChatbot /></ProtectedRoute>} />
          <Route path="live-map" element={<ProtectedRoute><LiveMap /></ProtectedRoute>} />
          <Route path="report-accident" element={<ProtectedRoute><ReportAccident /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="blood-bank" element={<ProtectedRoute><BloodBank /></ProtectedRoute>} />
          {/* Fallback for other routes */}
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
