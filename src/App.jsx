import React, { Suspense, lazy } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

import LandingPage from './pages/LandingPage';

// Route-level code splitting: every page except the landing page is loaded on
// demand. Landing stays eager for the fastest possible first paint, while the
// admin/staff/kitchen/guest portals and secondary marketing pages are only
// fetched for users who navigate to them (recharts, Firebase-admin-style
// screens, etc. no longer ship in the initial bundle).
const AuthPage = lazy(() => import('./pages/AuthPage'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const MenuManager = lazy(() => import('./pages/admin/MenuManager'));
const TableManager = lazy(() => import('./pages/admin/TableManager'));
const Analytics = lazy(() => import('./pages/admin/Analytics'));
const Feedback = lazy(() => import('./pages/admin/Feedback'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const StaffManagement = lazy(() => import('./pages/admin/StaffManagement'));
const HotelPartners = lazy(() => import('./pages/admin/HotelPartners'));
const MenuView = lazy(() => import('./pages/guest/MenuView'));
const StaffLogin = lazy(() => import('./pages/staff/StaffLogin'));
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard'));
const KitchenDisplay = lazy(() => import('./pages/kitchen/KitchenDisplay'));
const LegalPage = lazy(() => import('./pages/LegalPage'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const RestaurantSoftwarePage = lazy(() => import('./pages/RestaurantSoftwarePage'));
const FoodSoftwarePage = lazy(() => import('./pages/FoodSoftwarePage'));
const RestaurantAutomationPage = lazy(() => import('./pages/RestaurantAutomationPage'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/auth" replace />;
}

// Fallback while a lazily-loaded route chunk is being fetched.
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-color, #060709)',
    }}>
      <div
        role="status"
        aria-label="Loading"
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: '3px solid rgba(245, 158, 11, 0.25)',
          borderTopColor: 'var(--primary, #f59e0b)',
          animation: 'taste-route-loader-spin 0.8s linear infinite',
        }}
      />
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to="/admin" replace /> : <AuthPage />} />
      <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/admin/menu" element={<ProtectedRoute><MenuManager /></ProtectedRoute>} />
      <Route path="/admin/tables" element={<ProtectedRoute><TableManager /></ProtectedRoute>} />
      <Route path="/admin/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/admin/feedback" element={<ProtectedRoute><Feedback /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute><StaffManagement /></ProtectedRoute>} />
      <Route path="/admin/hotel-partners" element={<ProtectedRoute><HotelPartners /></ProtectedRoute>} />
      <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/staff" element={<StaffLogin />} />
      <Route path="/staff/:restaurantId" element={<StaffLogin />} />
      <Route path="/staff/dashboard" element={<StaffDashboard />} />
      <Route path="/kitchen/:restaurantId" element={<KitchenDisplay />} />
      <Route path="/menu/:restaurantId/:tableNumber" element={<MenuView />} />
      <Route path="/restaurant-software" element={<RestaurantSoftwarePage />} />
      <Route path="/food-software" element={<FoodSoftwarePage />} />
      <Route path="/restaurant-automation" element={<RestaurantAutomationPage />} />
      <Route path="/terms" element={<LegalPage page="terms" />} />
      <Route path="/privacy" element={<LegalPage page="privacy" />} />
      <Route path="/cookies" element={<LegalPage page="cookies" />} />
      <Route path="/refund" element={<LegalPage page="refund" />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
