import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/admin/Dashboard';
import MenuManager from './pages/admin/MenuManager';
import TableManager from './pages/admin/TableManager';
import Analytics from './pages/admin/Analytics';
import Feedback from './pages/admin/Feedback';
import Settings from './pages/admin/Settings';
import MenuView from './pages/guest/MenuView';
import StaffLogin from './pages/staff/StaffLogin';
import StaffDashboard from './pages/staff/StaffDashboard';
import KitchenDisplay from './pages/kitchen/KitchenDisplay';
import LegalPage from './pages/LegalPage';
import Contact from './pages/Contact';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/auth" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to="/admin" replace /> : <AuthPage />} />
      <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/menu" element={<ProtectedRoute><MenuManager /></ProtectedRoute>} />
      <Route path="/admin/tables" element={<ProtectedRoute><TableManager /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/admin/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/staff" element={<StaffLogin />} />
      <Route path="/staff/dashboard" element={<StaffDashboard />} />
      <Route path="/kitchen/:restaurantId" element={<KitchenDisplay />} />
      <Route path="/menu/:restaurantId/:tableNumber" element={<MenuView />} />
      <Route path="/terms" element={<LegalPage page="terms" />} />
      <Route path="/privacy" element={<LegalPage page="privacy" />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
