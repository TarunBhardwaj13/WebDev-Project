import React from 'react';
import {
BrowserRouter as Router,
Routes,
Route,
Navigate,
useLocation,
} from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// User pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Matches from './pages/Matches';
import Requests from './pages/Requests';
import Chat from './pages/Chat';
import Sessions from './pages/Sessions';

// Admin page
import AdminDashboard from './pages/admin/AdminDashboard';

function LoadingScreen() {
return ( <div className="flex min-h-screen items-center justify-center bg-slate-900"> <p className="text-gray-300">Loading...</p> </div>
);
}

// Normal user protected route
function ProtectedRoute({ children }) {
const { user, loading } = useAuth();

if (loading) return <LoadingScreen />;

if (!user) {
return <Navigate to="/login" replace />;
}

if (user.role === 'admin') {
return <Navigate to="/admin/dashboard" replace />;
}

return children;
}

// Admin protected route
function AdminRoute({ children }) {
const { user, loading } = useAuth();

if (loading) return <LoadingScreen />;

if (!user) {
return <Navigate to="/login" replace />;
}

if (user.role !== 'admin') {
return <Navigate to="/dashboard" replace />;
}

return children;
}

// Redirect logged-in users away from login/register
function PublicOnlyRoute({ children }) {
const { user, loading } = useAuth();

if (loading) return <LoadingScreen />;

if (user) {
return (
<Navigate
to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
replace
/>
);
}

return children;
}

// Hide normal website header/footer from admin dashboard
function AppLayout() {
const location = useLocation();
const isAdminPage = location.pathname.startsWith('/admin');

return ( <div className="flex min-h-screen flex-col bg-slate-900 text-slate-100">
{!isAdminPage && <Navbar />}

```
  <main className="flex-grow">
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Shared login for admins and normal users */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        }
      />

      {/* Normal user pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <Matches />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <Requests />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <Sessions />
          </ProtectedRoute>
        }
      />

      {/* Admin-only dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      {/* Old admin login URL redirects to shared login */}
      <Route
        path="/admin/login"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  </main>

  {!isAdminPage && <Footer />}
</div>


);
}

export default function App() {
return ( <AuthProvider> <Router> <AppLayout /> </Router> </AuthProvider>
);
}
