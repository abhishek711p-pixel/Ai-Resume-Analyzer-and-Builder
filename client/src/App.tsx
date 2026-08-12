/**
 * React Frontend Application Root Component
 * 
 * Sets up the React Router routing layer and defines the layout engine:
 * 1. Checks route paths to determine workspace views vs standard views.
 * 2. Conditionally shows or hides Navbar and Footer elements on full-page builder workspaces (/create, /tailor).
 * 3. Incorporates a global Tech Stack Modal helper.
 */

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Footer from './components/Footer';
import TechStackModal from './components/TechStackModal';

import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import BuilderPage from './pages/BuilderPage';
import TailorPage from './pages/TailorPage';


const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppLayout = () => {
  const location = useLocation();
  const isFullWorkspace = location.pathname === '/create' || location.pathname === '/tailor';
  const [isTechStackOpen, setIsTechStackOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {!isFullWorkspace && <Navbar onOpenTechStack={() => setIsTechStackOpen(true)} />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create" 
          element={
            <ProtectedRoute>
              <BuilderPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/tailor" 
          element={
            <ProtectedRoute>
              <TailorPage />
            </ProtectedRoute>
          } 
        />
      </Routes>
      {!isFullWorkspace && <Footer onOpenTechStack={() => setIsTechStackOpen(true)} />}

      {/* Global Tech Stack Modal */}
      <TechStackModal isOpen={isTechStackOpen} onClose={() => setIsTechStackOpen(false)} />
    </>
  );
};


function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
