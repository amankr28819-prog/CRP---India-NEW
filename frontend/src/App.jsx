import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import CitizenProtectedRoute from './components/CitizenProtectedRoute';
import LogoutConfirmModal from './components/LogoutConfirmModal';

// Citizen Pages
import RoleSelection from './pages/RoleSelection';
import Home from './pages/Home';
import CategorySelect from './pages/CategorySelect';
import ComplaintForm from './pages/ComplaintForm';
import TrackComplaint from './pages/TrackComplaint';
import ComplaintDetails from './pages/ComplaintDetails';
import CitizenLogin from './pages/CitizenLogin';
import CitizenRegister from './pages/CitizenRegister';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import FAQs from './pages/FAQs';

// Authority Pages
import AuthorityLogin from './pages/authority/AuthorityLogin';
import AuthorityDashboard from './pages/authority/AuthorityDashboard';
import AuthorityComplaints from './pages/authority/AuthorityComplaints';
import AuthorityComplaintDetail from './pages/authority/AuthorityComplaintDetail';

// Wrapper to conditionally render Navbar and Footer (hidden on standalone role selection screen)
function AppLayout() {
  const location = useLocation();
  const isRoleSelection = location.pathname === '/' || location.pathname === '/select-role';

  return (
    <div className="app-wrapper">
      {!isRoleSelection && <Navbar />}
      <main className="main-content">
        <Routes>
          {/* Main Front Page Gateway (Role Selection) */}
          <Route path="/" element={<RoleSelection />} />
          <Route path="/select-role" element={<RoleSelection />} />

          {/* Citizen Portal */}
          <Route path="/home" element={<Home />} />
          <Route
            path="/report"
            element={
              <CitizenProtectedRoute>
                <CategorySelect />
              </CitizenProtectedRoute>
            }
          />
          <Route
            path="/report/:categorySlug"
            element={
              <CitizenProtectedRoute>
                <ComplaintForm />
              </CitizenProtectedRoute>
            }
          />
          <Route path="/track" element={<TrackComplaint />} />
          <Route path="/complaint/:id" element={<ComplaintDetails />} />
          <Route path="/login" element={<CitizenLogin />} />
          <Route path="/register" element={<CitizenRegister />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/faqs" element={<FAQs />} />

          {/* Municipal Authority Portal */}
          <Route path="/authority/login" element={<AuthorityLogin />} />
          <Route
            path="/authority/dashboard"
            element={
              <ProtectedRoute>
                <AuthorityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/complaints"
            element={
              <ProtectedRoute>
                <AuthorityComplaints />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority/complaints/:id"
            element={
              <ProtectedRoute>
                <AuthorityComplaintDetail />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isRoleSelection && <Footer />}
      <LogoutConfirmModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AppLayout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}