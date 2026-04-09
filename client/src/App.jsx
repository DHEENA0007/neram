import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth.jsx';
import { LoginPage } from './pages/LoginPage.jsx';
import { AdminShell } from './pages/admin/AdminShell.jsx';
import { DashboardPage } from './pages/admin/DashboardPage.jsx';
import { UsersPage } from './pages/admin/UsersPage.jsx';
import { PalangalPage } from './pages/admin/PalangalPage.jsx';
import { SettingsPage } from './pages/admin/SettingsPage.jsx';
import { UserPortal } from './pages/user/UserPortal.jsx';

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-card">
        <span className="loading-dot" />
        <p>Loading Neram...</p>
      </div>
    </div>
  );
}

function RootRoute() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/user'} replace />;
}

function RequireAuth({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/user" replace />;
  return children;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/user"
            element={<RequireAuth><UserPortal /></RequireAuth>}
          />
          <Route
            path="/admin"
            element={<RequireAuth adminOnly><AdminShell /></RequireAuth>}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="palangal" element={<PalangalPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
