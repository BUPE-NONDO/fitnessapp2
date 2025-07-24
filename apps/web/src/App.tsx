import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';
import { TRPCProvider } from '@/components/TRPCProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { RequireAuth } from '@/components/RequireAuth';
import { AchievementManager, CelebrationTrigger } from '@/components/AchievementManager';

function App() {
  return (
    <AuthProvider>
      <TRPCProvider>
        <AppContent />
      </TRPCProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <RequireAuth>
        <Dashboard />
        <AchievementManager />
        <CelebrationTrigger />
      </RequireAuth>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏋️‍♂️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">FitnessApp</h1>
          <p className="text-gray-600">Your personal fitness tracking companion</p>
        </div>

        <LoginForm
          isSignUp={isSignUp}
          onToggleMode={() => setIsSignUp(!isSignUp)}
        />

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🔥 Powered by Firebase • Built with React & TypeScript
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
