import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomePage } from './pages/HomePage';
import { LandingPage } from './pages/LandingPage';
import { MapPage } from './pages/MapPage';
import { BeaconDetailPage } from './pages/BeaconDetailPage';
import { LightBeaconPage } from './pages/LightBeaconPage';
import { ProfilePage } from './pages/ProfilePage';
import { UserProfilePage } from './pages/UserProfilePage';
import { AuthPage } from './pages/AuthPage';
import { VenueDetailPage } from './pages/VenueDetailPage';
import { ToastContainer } from './components/ui/Toast';
import { useAuraStore } from './store/useAuraStore';
import { hasPreviewAccess, isPublicLaunchEnabled, unlockPreviewAccess } from './lib/prelaunch';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuraStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}

function LandingOrRedirect({ appAccessAllowed }: { appAccessAllowed: boolean }) {
  const isAuthenticated = useAuraStore((s) => s.isAuthenticated);
  if (!appAccessAllowed) {
    return <LandingPage />;
  }
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }
  return <LandingPage />;
}

function AppRoutes() {
  const init = useAuraStore((s) => s.init);
  const location = useLocation();
  const [appAccessAllowed, setAppAccessAllowed] = useState(
    () => isPublicLaunchEnabled() || unlockPreviewAccess(window.location.search) || hasPreviewAccess(),
  );

  useEffect(() => {
    const unlocked = unlockPreviewAccess(location.search);
    setAppAccessAllowed(isPublicLaunchEnabled() || unlocked || hasPreviewAccess());
  }, [location.search]);

  useEffect(() => {
    if (appAccessAllowed) {
      init();
    }
  }, [appAccessAllowed, init]);

  if (!appAccessAllowed && location.pathname !== '/') {
    return <Navigate to="/" replace />;
  }

  return (
    <AppLayout>
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingOrRedirect appAccessAllowed={appAccessAllowed} />} />
        <Route path="/app" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/venues/:id" element={<VenueDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/beacon/new"
          element={
            <ProtectedRoute>
              <LightBeaconPage />
            </ProtectedRoute>
          }
        />
        <Route path="/beacon/:id" element={<BeaconDetailPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/users/:id" element={<UserProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ErrorBoundary>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer />
    </BrowserRouter>
  );
}
