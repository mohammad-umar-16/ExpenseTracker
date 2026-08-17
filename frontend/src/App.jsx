import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import { AuthPage, OnboardingPage } from './pages/AuthPages';

function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14 }}>
      <div style={{ width: 38, height: 38, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <span style={{ color: 'var(--dim)', fontSize: '.8rem' }}>Loading…</span>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_onboarded) return <Navigate to="/onboarding" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (user) return <Navigate to={user.is_onboarded ? '/dashboard' : '/onboarding'} replace />;
  return children;
}

function OnboardingRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.is_onboarded) return <Navigate to="/dashboard" replace />;
  return <OnboardingPage />;
}

function Router() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnlyRoute><AuthPage /></PublicOnlyRoute>} />
      <Route path="/onboarding" element={<OnboardingRoute />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Router />
        <Toaster position="bottom-right" toastOptions={{
          style: { background: 'var(--surf3)', color: 'var(--text)', border: '1px solid var(--border2)', fontFamily: 'Sora,sans-serif', fontSize: '.83rem', borderRadius: '10px' },
          success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--surf3)' } },
          error:   { iconTheme: { primary: 'var(--red)',   secondary: 'var(--surf3)' } },
        }} />
      </AuthProvider>
    </BrowserRouter>
  );
}