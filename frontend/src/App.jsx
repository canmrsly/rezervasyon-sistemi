import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import AdminLogin from './pages/admin/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffPage from './pages/admin/StaffPage';
import BusinessSettingsPage from './pages/admin/BusinessSettingsPage';
import ServicesPage from './pages/admin/ServicesPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Yükleniyor...</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/admin/login" replace />} />

            {/* Admin Routes */}
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="admin/dashboard" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="admin/staff" element={
              <ProtectedRoute>
                <StaffPage />
              </ProtectedRoute>
            } />
            <Route path="admin/services" element={
              <ProtectedRoute>
                <ServicesPage />
              </ProtectedRoute>
            } />
            <Route path="admin/business" element={
              <ProtectedRoute>
                <BusinessSettingsPage />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
