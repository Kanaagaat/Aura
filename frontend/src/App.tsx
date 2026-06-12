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
import { FeedPage } from './pages/FeedPage';
import { AuthPage } from './pages/AuthPage';
import { OnboardingPage } from './pages/OnboardingPage';
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
    return <Navigate to="/feed" replace />;
  }
  return <LandingPage />;
}

function AppRoutes() {
  const init = useAuraStore((s) => s.init);
  const isAuthenticated = useAuraStore((s) => s.isAuthenticated);
  const profile = useAuraStore((s) => s.profile);
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

  const needsOnboarding = Boolean(
    isAuthenticated &&
      profile &&
      (!profile.gender || !profile.vibe_word || (profile.interests?.length ?? 0) < 2),
  );

  if (
    appAccessAllowed &&
    needsOnboarding &&
    location.pathname !== '/onboarding' &&
    location.pathname !== '/auth'
  ) {
    const redirect = location.pathname === '/'
      ? '/feed'
      : `${location.pathname}${location.search}`;
    return (
      <Navigate
        to={`/onboarding?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  return (
    <AppLayout>
      <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingOrRedirect appAccessAllowed={appAccessAllowed} />} />
        <Route path="/app" element={<Navigate to="/feed" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/venues/:id" element={<VenueDetailPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />
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
