import React, { useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface AdminLoginProps {
  onSuccess?: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, error, clearError } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      return;
    }

    try {
      await signIn(email, password);
      onSuccess?.();
    } catch (err) {
      // Error is handled by the hook
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="shield" size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin Portal
          </h1>
          <p className="text-blue-100">
            Sign in to access the admin dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="mail" size={20} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={cn(
                    'block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    'placeholder-gray-400 text-gray-900',
                    error && 'border-red-300 focus:ring-red-500'
                  )}
                  placeholder="admin@fitnessapp.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="lock" size={20} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={cn(
                    'block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                    'placeholder-gray-400 text-gray-900',
                    error && 'border-red-300 focus:ring-red-500'
                  )}
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={loading}
                >
                  <Icon 
                    name={showPassword ? 'eye_off' : 'eye'} 
                    size={20} 
                    className="text-gray-400 hover:text-gray-600" 
                  />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Icon name="x" size={20} className="text-red-500 mr-3" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className={cn(
                'w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                loading || !email || !password
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              )}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Signing In...
                </>
              ) : (
                <>
                  <Icon name="shield" size={20} className="mr-3" />
                  Sign In to Admin Portal
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <Icon name="shield" size={16} className="text-gray-500 mr-2 mt-0.5" />
              <div className="text-xs text-gray-600">
                <p className="font-medium mb-1">Security Notice</p>
                <p>
                  This is a secure admin portal. All activities are logged and monitored.
                  Only authorized personnel should access this system.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-blue-100 text-sm">
            FitnessApp Admin Portal • Secure Access
          </p>
        </div>
      </div>
    </div>
  );
}

// Demo admin credentials component (for development)
export function AdminLoginDemo() {
  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h4 className="font-medium text-yellow-800 mb-2">Demo Credentials</h4>
      <div className="text-sm text-yellow-700 space-y-1">
        <p><strong>Super Admin:</strong> admin@fitnessapp.com / admin123</p>
        <p><strong>Admin:</strong> manager@fitnessapp.com / manager123</p>
        <p><strong>Moderator:</strong> mod@fitnessapp.com / mod123</p>
        <p><strong>Support:</strong> support@fitnessapp.com / support123</p>
      </div>
      <p className="text-xs text-yellow-600 mt-2">
        Note: These are demo credentials for development only
      </p>
    </div>
  );
}

export default AdminLogin;
