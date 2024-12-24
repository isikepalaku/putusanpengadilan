import { useAuth } from '../../context/AuthContext';
import { AppContent } from '../AppContent';
import { LoginForm } from './LoginForm';

export function AuthenticatedApp() {
  const { user } = useAuth();
  return !user ? <LoginForm /> : <AppContent />;
}