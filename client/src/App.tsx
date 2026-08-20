/**
 * React Frontend Application Root Component
 * 
 * Sets up the React Router routing layer and defines the layout engine:
 * 1. Checks route paths to determine workspace views vs standard views.
 * 2. Conditionally shows or hides Navbar and Footer elements on full-page builder workspaces (/create, /tailor).
 * 3. Incorporates a global Tech Stack Modal helper.
 */

import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TechStackModal from './components/TechStackModal';

// Route-based code splitting for ultra-fast initial page loads
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const BuilderPage = lazy(() => import('./pages/BuilderPage'));
const TailorPage = lazy(() => import('./pages/TailorPage'));
const EvaluationPage = lazy(() => import('./pages/EvaluationPage'));

const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    color: 'var(--accent-primary)',
    fontWeight: 600,
    fontSize: '1rem',
    gap: '8px'
  }}>
    <div style={{
      width: '24px',
      height: '24px',
      border: '3px solid rgba(0, 229, 153, 0.2)',
      borderTopColor: 'var(--accent-primary)',
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite'
    }} />
    <span>Loading...</span>
  </div>
);

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/evaluation" element={<EvaluationPage />} />

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
      </Suspense>
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
