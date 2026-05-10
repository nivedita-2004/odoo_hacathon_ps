import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import Trips from './pages/trips/Trips';
import CreateTrip from './pages/trips/CreateTrip';
import TripDetail from './pages/trips/TripDetail';
import Cities from './pages/Cities';
import CityDetail from './pages/CityDetail';
import Budget from './pages/Budget';
import Packing from './pages/Packing';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitializing, initAuth } = useAuthStore();
  
  useEffect(() => {
    initAuth();
  }, []);
  
  // Show loading while checking auth status
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A09D]"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/create" element={<CreateTrip />} />
          <Route path="/trips/:id" element={<TripDetail />} />
          <Route path="/cities" element={<Cities />} />
          <Route path="/cities/:id" element={<CityDetail />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/packing" element={<Packing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App
