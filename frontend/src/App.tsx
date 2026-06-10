import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { BeaconDetailPage } from './pages/BeaconDetailPage';
import { LightBeaconPage } from './pages/LightBeaconPage';
import { ProfilePage } from './pages/ProfilePage';
import { AuthPage } from './pages/AuthPage';
import { useAuraStore } from './store/useAuraStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuraStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const init = useAuraStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapPage />} />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

