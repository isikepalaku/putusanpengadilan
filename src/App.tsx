import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppContent } from './components/AppContent';
import { AppProvider } from './providers/AppProvider';
import { AuthProvider } from './context/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { AuthCallback } from './components/Auth/AuthCallback';
import { useAuth } from './context/AuthContext';

function AuthenticatedApp() {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return <AppContent />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<AuthenticatedApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}