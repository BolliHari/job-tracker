import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/public/LandingPage'
import LoginPage from './pages/public/LoginPage'
import PrivateLayout from './components/layouts/PrivateLayout'
import { useSelector } from 'react-redux'
import Dashboard from './pages/private/Dashboard'
import Tracker from './pages/private/Tracker'
import JobDetail from './pages/private/JobDetail'
import Settings from './pages/private/Settings'


export default function App() {

  const ProtectedRoute = ({ children }) => {
    const { user } = useSelector((state) => state.auth);
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PrivateLayout>
              <Dashboard />
            </PrivateLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vault"
        element={
          <ProtectedRoute>
            <PrivateLayout>
              <Tracker />
            </PrivateLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tracker/:id"
        element={
          <ProtectedRoute>
            <PrivateLayout>
              <JobDetail />
            </PrivateLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <PrivateLayout>
              <Settings />
            </PrivateLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
