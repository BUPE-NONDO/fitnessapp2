import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/LoginForm';
import { TRPCProvider } from '@/components/TRPCProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { RequireAuth } from '@/components/RequireAuth';
import { AchievementManager, CelebrationTrigger } from '@/components/AchievementManager';
import { UserFlowManager, FlowStateIndicator } from '@/components/flow/UserFlowManager';
import { SplashScreen } from '@/components/SplashScreen';
import { AdminApp } from '@/components/admin/AdminApp';
import { ThemeToggle } from '@/contexts/ThemeContext';
import { AccessibleApp } from '@/components/accessibility/AccessibleApp';
import '@/styles/accessibility.css';


function App() {
  return (
    <AccessibleApp>
      <ThemeProvider>
        <AuthProvider>
          <TRPCProvider>
            <AppContent />
          </TRPCProvider>
        </AuthProvider>
      </ThemeProvider>
    </AccessibleApp>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [currentRoute, setCurrentRoute] = useState<'app' | 'admin'>('app');

  // Force fresh start - clear any cached data on app load
  React.useEffect(() => {
    // Clear localStorage to ensure fresh experience
    localStorage.removeItem('onboarding-progress');
    localStorage.removeItem('user-preferences');
    localStorage.removeItem('workout-plan');
    localStorage.removeItem('was-signup');
    sessionStorage.clear();
    console.log('🧹 Cleared cached data for fresh start');
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Check for admin route
  React.useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setCurrentRoute('admin');
    } else {
      setCurrentRoute('app');
    }
  }, []);



  // Show splash screen on initial load
  if (showSplash) {
    return (
      <SplashScreen
        isVisible={showSplash}
        onComplete={handleSplashComplete}
        minDisplayTime={2500}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-500 to-blue-600 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show admin app if on admin route
  if (currentRoute === 'admin') {
    return <AdminApp />;
  }

  if (user) {
    return (
      <RequireAuth>
        <UserFlowManager />
        <AchievementManager />
        <CelebrationTrigger />
        <FlowStateIndicator />
      </RequireAuth>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
      {/* Futuristic 3D Background Elements */}
      <div className="absolute inset-0 perspective-1000">
        {/* Floating 3D Cubes */}
        <div className="absolute top-20 left-20 w-16 h-16 bg-gradient-to-br from-teal-400/20 to-blue-500/20 transform rotate-45 rotateX-12 rotateY-12 animate-float shadow-2xl backdrop-blur-sm border border-teal-400/30"></div>
        <div className="absolute top-40 right-32 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-500/20 transform rotate-12 rotateX-45 rotateY-45 animate-float-delayed shadow-2xl backdrop-blur-sm border border-purple-400/30"></div>
        <div className="absolute bottom-32 left-32 w-20 h-20 bg-gradient-to-br from-cyan-400/20 to-teal-500/20 transform -rotate-12 rotateX-24 rotateY-24 animate-float-slow shadow-2xl backdrop-blur-sm border border-cyan-400/30"></div>

        {/* 3D Geometric Shapes */}
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/15 to-indigo-500/15 transform rotateX-45 rotateY-45 animate-spin-slow shadow-2xl backdrop-blur-sm border border-blue-400/30 clip-path-hexagon"></div>
        <div className="absolute bottom-1/3 left-20 w-18 h-18 bg-gradient-to-br from-emerald-400/15 to-teal-500/15 transform rotateX-30 rotateY-60 animate-pulse-glow shadow-2xl backdrop-blur-sm border border-emerald-400/30"></div>

        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-teal-400 rounded-full animate-float-particle shadow-lg"></div>
        <div className="absolute top-3/4 right-1/4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float-particle-delayed shadow-lg"></div>
        <div className="absolute top-1/2 left-3/4 w-2.5 h-2.5 bg-purple-400 rounded-full animate-float-particle-slow shadow-lg"></div>

        {/* Neural Network Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="neuralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          <path d="M100,200 Q300,100 500,300 T900,200" stroke="url(#neuralGradient)" strokeWidth="1" fill="none" className="animate-pulse"/>
          <path d="M200,400 Q400,300 600,500 T1000,400" stroke="url(#neuralGradient)" strokeWidth="1" fill="none" className="animate-pulse-delayed"/>
          <circle cx="100" cy="200" r="3" fill="#14b8a6" className="animate-pulse"/>
          <circle cx="500" cy="300" r="2" fill="#3b82f6" className="animate-pulse-delayed"/>
          <circle cx="900" cy="200" r="2.5" fill="#8b5cf6" className="animate-pulse"/>
        </svg>
      </div>

      {/* Enhanced Ambient Lighting */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-teal-400/10 rounded-full blur-xl animate-pulse-glow"></div>
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-blue-400/5 rounded-full blur-2xl animate-pulse-glow-delayed"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-400/5 to-blue-400/10 rounded-full blur-3xl animate-pulse-glow-slow"></div>
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-3 sm:mb-4">
          <ThemeToggle size="sm" />
        </div>

        <div className="text-center mb-3 sm:mb-4">
          <div className="relative mx-auto mb-2 sm:mb-3 w-12 h-12 sm:w-16 sm:h-16">
            {/* 3D Futuristic Logo Container */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full animate-pulse-glow transform hover:scale-110 transition-all duration-500 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-300/30 to-purple-400/30 rounded-full animate-spin-slow"></div>
              <div className="absolute inset-2 bg-gradient-to-bl from-teal-500/50 to-blue-600/50 rounded-full backdrop-blur-sm"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <span className="text-lg sm:text-xl transform hover:scale-125 transition-transform duration-300">💪</span>
              </div>
            </div>

            {/* Floating Particles around Logo */}
            <div className="absolute -top-1 -right-1 w-1 h-1 bg-teal-400 rounded-full animate-float-particle"></div>
            <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-blue-400 rounded-full animate-float-particle-delayed"></div>
            <div className="absolute top-1/2 -right-2 w-0.5 h-0.5 bg-purple-400 rounded-full animate-float-particle-slow"></div>
          </div>

          <h1 className="text-lg sm:text-xl font-bold text-white mb-1 transform hover:scale-105 transition-transform duration-300">
            <span className="bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">Fitness</span>
            <span className="text-white">App</span>
          </h1>
          <p className="text-slate-300 text-xs">Your Personal Fitness Journey</p>
        </div>

        <LoginForm
          isSignUp={isSignUp}
          onToggleMode={() => setIsSignUp(!isSignUp)}
        />

        <div className="mt-3 sm:mt-4 text-center">
          <p className="text-xs text-slate-500">
            Developed by Bupe Nondo • Hytel Organization
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
