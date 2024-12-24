import { AppContent } from './components/AppContent';
import { AppProvider } from './providers/AppProvider';
import { AuthProvider } from './context/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { useAuth } from './context/AuthContext';

function AuthenticatedApp() {
  const { user, signOut } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div>
      <div className="absolute top-4 right-4">
        <button
          onClick={() => signOut()}
          className="px-4 py-2 text-sm text-white bg-gray-800 rounded-md hover:bg-gray-700"
        >
          Sign Out
        </button>
      </div>
      <AppContent />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AuthenticatedApp />
      </AppProvider>
    </AuthProvider>
  );
}