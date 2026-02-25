import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Credentials from './pages/Credentials';
import AnalyticsOverview from './pages/AnalyticsOverview';
import CitizenDashboard from './pages/citizen/Dashboard';
import CreateIssue from './pages/citizen/CreateIssue';
import CitizenProfile from './pages/citizen/Profile';
import OrgDashboard from './pages/organization/Dashboard';
import OrgProfile from './pages/organization/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';

// Protected Route HOC
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// Role-based dashboard redirect
// NOTE: Backend uses 'AUTHORITY' as the role name for organization accounts
function DashboardRedirect() {
  const { role } = useAuth();
  if (role === 'CITIZEN')    return <Navigate to="/dashboard/citizen" replace />;
  if (role === 'AUTHORITY')  return <Navigate to="/dashboard/organization" replace />;
  if (role === 'ADMIN')      return <Navigate to="/dashboard/admin" replace />;
  return <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/credentials" element={<Credentials />} />
      <Route
        path="/analytics"
        element={(
          <ProtectedRoute allowedRoles={['ADMIN', 'AUTHORITY']}>
            <AnalyticsOverview />
          </ProtectedRoute>
        )}
      />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
      <Route path="/dashboard/citizen" element={
        <ProtectedRoute allowedRoles={['CITIZEN']}><CitizenDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/citizen/create" element={
        <ProtectedRoute allowedRoles={['CITIZEN']}><CreateIssue /></ProtectedRoute>
      } />
      <Route path="/dashboard/citizen/profile" element={
        <ProtectedRoute allowedRoles={['CITIZEN']}><CitizenProfile /></ProtectedRoute>
      } />
      <Route path="/dashboard/organization" element={
        <ProtectedRoute allowedRoles={['AUTHORITY']}><OrgDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/organization/profile" element={
        <ProtectedRoute allowedRoles={['AUTHORITY']}><OrgProfile /></ProtectedRoute>
      } />
      <Route path="/dashboard/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/dashboard/admin/users" element={
        <ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
