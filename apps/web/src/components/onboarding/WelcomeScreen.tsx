import React from 'react';
import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-primary-100 dark:from-gray-900 dark:to-purple-900/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-purple-200/30 rounded-full blur-xl"></div>
      <div className="absolute bottom-20 left-10 w-48 h-48 bg-primary-300/20 rounded-full blur-2xl"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-100/10 to-primary-200/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        {/* App Logo/Icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-primary-600 rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-4xl">💪</span>
          </div>
        </motion.div>

        {/* App Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
        >
          FitnessApp
        </motion.h1>

        {/* Motivational Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-md"
        >
          Transform your body, elevate your mind, and unlock your potential
        </motion.p>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Personalized Plans</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Custom workouts tailored to your goals and fitness level</p>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Progress Tracking</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your journey with detailed analytics and insights</p>
          </div>
          
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Achievement System</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Earn badges and celebrate milestones on your fitness journey</p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="space-y-4 w-full max-w-sm"
        >
          <button
            onClick={onGetStarted}
            className="w-full bg-gradient-to-r from-purple-600 to-primary-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started Free
          </button>
          
          <button
            onClick={onSignIn}
            className="w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white font-semibold py-4 px-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
          >
            I Already Have an Account
          </button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-12 flex items-center space-x-8 text-sm text-gray-500 dark:text-gray-400"
        >
          <div className="flex items-center space-x-2">
            <span>⭐</span>
            <span>4.9/5 Rating</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>👥</span>
            <span>10K+ Users</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>🔒</span>
            <span>100% Secure</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
