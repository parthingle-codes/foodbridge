import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DonorDashboard from './pages/DonorDashboard';
import CreateListing from './pages/CreateListing';
import DonorListings from './pages/DonorListings';
import RewardsPage from './pages/RewardsPage';
import OrganizationDashboard from './pages/OrganizationDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import SafetyCheckPage from './pages/SafetyCheckPage';
import OtpPage from './pages/OtpPage';
import BiofarmDashboard from './pages/BiofarmDashboard';
import AnalyticsPage from './pages/AnalyticsPage';
import MapPage from './pages/MapPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#1f2937',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#16a34a', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Donor Routes */}
            <Route
              path="/donor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/create-listing"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <CreateListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/listings"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <DonorListings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donor/rewards"
              element={
                <ProtectedRoute allowedRoles={['donor']}>
                  <RewardsPage />
                </ProtectedRoute>
              }
            />

            {/* Organization/NGO Routes */}
            <Route
              path="/organization/dashboard"
              element={
                <ProtectedRoute allowedRoles={['organization', 'ngo']}>
                  <OrganizationDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organization/available-food"
              element={
                <ProtectedRoute allowedRoles={['organization', 'ngo']}>
                  <OrganizationDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organization/reservations"
              element={
                <ProtectedRoute allowedRoles={['organization', 'ngo']}>
                  <OrganizationDashboard />
                </ProtectedRoute>
              }
            />

            {/* Volunteer Routes */}
            <Route
              path="/volunteer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/assignments"
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <VolunteerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/safety-check"
              element={
                <ProtectedRoute allowedRoles={['volunteer', 'donor']}>
                  <SafetyCheckPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/volunteer/otp"
              element={
                <ProtectedRoute allowedRoles={['volunteer', 'donor', 'organization', 'ngo']}>
                  <OtpPage />
                </ProtectedRoute>
              }
            />

            {/* Biofarm Routes */}
            <Route
              path="/biofarm/dashboard"
              element={
                <ProtectedRoute allowedRoles={['biofarm']}>
                  <BiofarmDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/biofarm/recovery"
              element={
                <ProtectedRoute allowedRoles={['biofarm']}>
                  <BiofarmDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/biofarm/history"
              element={
                <ProtectedRoute allowedRoles={['biofarm']}>
                  <BiofarmDashboard />
                </ProtectedRoute>
              }
            />

            {/* Shared Routes */}
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
