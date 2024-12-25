import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './providers/AppProvider';
import { AuthCallback } from './components/Auth/AuthCallback';
import { AuthenticatedApp } from './components/Auth/AuthenticatedApp';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/" element={<AuthenticatedApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}